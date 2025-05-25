import asyncio
import time
from typing import Dict, List, Optional, Any, Union

from azure.ai.agents.aio import AgentsClient
from azure.core.credentials import AzureKeyCredential

from ..config import AZURE_AI_PROJECT_CONNECTION_STRING, AZURE_AI_AGENTS_API_KEY
from ..constants import (
    AGENT_ID_GITHUB_COPILOT_COMPLETIONS,
    AGENT_ID_GITHUB_COPILOT_AGENT,
    AGENT_ID_DEVIN,
    AGENT_ID_CODEX_CLI,
    AGENT_ID_SREAGENT,
    LEGACY_AGENT_ID_MAP,
    DEPENDENCY_FILES,
    LANGUAGE_MAP,
)


class AzureAgentService:
    """Service for interacting with Azure AI Agents."""
    
    def __init__(self) -> None:
        """Initialize the Azure Agent Service with credentials."""
        self.endpoint = AZURE_AI_PROJECT_CONNECTION_STRING
        self.credential = None if not AZURE_AI_AGENTS_API_KEY or AZURE_AI_AGENTS_API_KEY == "your_api_key" else AzureKeyCredential(AZURE_AI_AGENTS_API_KEY)
    
    async def identify_config_files(self, repo_name: str, files: List[Dict[str, Any]]) -> List[str]:
        """
        First step of the two-phase analysis: Identify configuration and dependency files.
        
        Args:
            repo_name: The repository name in owner/repo format
            files: List of files in the repository
            
        Returns:
            List of file paths that are relevant for configuration
        """
        print(f"Identifying configuration files for {repo_name}...")
        
        if not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Agents credentials are not configured. Please set AZURE_AI_AGENTS_API_KEY and AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        try:
            async with AgentsClient(self.endpoint, self.credential) as client:
                agent_instructions = """
                You are an AI assistant that helps identify configuration and dependency files in a GitHub repository.
                Your task is to analyze the list of files in a repository and identify the most important files for understanding:
                1. How to install dependencies
                2. How to configure the development environment
                3. How to run the application
                4. How to run tests and linting
                
                Focus on files like:
                - Package management files (requirements.txt, package.json, etc.)
                - Configuration files (.env.example, docker-compose.yml, etc.)
                - Documentation files (README.md, INSTALL.md, etc.)
                - Build configuration files (Makefile, webpack.config.js, etc.)
                
                Return a list of file paths, with the most important files first.
                """
                
                agent = await client.create_agent(
                    project="agunblock",
                    model="gpt-4",
                    name="config-file-identifier",
                    instructions=agent_instructions,
                )
                
                thread = await client.create_thread()
                
                file_list = "\n".join([f"{file['path']} ({file['type']})" for file in files[:100]])  # Limit to first 100 files
                
                content = f"Repository: {repo_name}\n\n"
                content += "Files in repository:\n```\n" + file_list + "\n```\n\n"
                content += "Please identify the most important configuration and dependency files from this list."
                
                await client.create_message(
                    thread.id,
                    content=content,
                    role="user"
                )
                
                run = await client.create_run(thread.id, agent.id)
                
                status = None
                while status not in ["completed", "failed", "cancelled", "expired"]:
                    run = await client.get_run(thread.id, run.id)
                    status = run.status
                    
                    if status == "completed":
                        break
                        
                    if status in ["failed", "cancelled", "expired"]:
                        raise RuntimeError(f"Agent run {status}")
                    
                    await asyncio.sleep(2)
                
                messages = await client.list_messages(thread.id)
                
                assistant_messages = [message for message in messages if message.role == "assistant"]
                if assistant_messages:
                    response = assistant_messages[-1].content
                    import re
                    file_paths = re.findall(r'`([^`]+)`|"([^"]+)"|\'([^\']+)\'', response)
                    file_paths = [path[0] or path[1] or path[2] for path in file_paths if any(path)]
                    
                    # Filter to ensure they exist in the repository
                    repo_files = [file["path"] for file in files]
                    valid_files = [path for path in file_paths if path in repo_files]
                    
                    if valid_files:
                        return valid_files[:10]  # Limit to 10 most important files
                
                raise RuntimeError("No valid configuration files identified by the agent")
        except Exception as e:
            raise RuntimeError(f"Error identifying configuration files: {str(e)}")
    
        
    async def extract_setup_instructions(self, agent_id: str, repo_name: str, file_contents: Dict[str, str]) -> Dict[str, str]:
        """
        Second step of the two-phase analysis: Extract setup instructions from config files.
        
        Args:
            agent_id: The type of AI agent ("github-copilot", "devin", etc.)
            repo_name: The repository name in owner/repo format
            file_contents: Dictionary mapping file paths to their contents
            
        Returns:
            Dictionary of setup commands for Devin
        """
        print(f"Extracting setup instructions for {repo_name} with agent: {agent_id}...")
        
        if not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Agents credentials are not configured. Please set AZURE_AI_AGENTS_API_KEY and AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        try:
            async with AgentsClient(self.endpoint, self.credential) as client:
                agent_instructions = """
                You are an AI assistant that helps extract setup instructions from repository configuration files.
                Your task is to analyze the content of configuration files and extract commands for:
                
                1. Prerequisites: What software needs to be installed before working with this repo
                2. Dependencies: How to install project dependencies
                3. Run App: How to run the application locally
                4. Linting: How to run linters or code quality checks
                5. Testing: How to run tests
                
                Format your response as a JSON object with these keys:
                {
                    "prerequisites": "Commands to install prerequisites",
                    "dependencies": "Commands to install dependencies",
                    "run_app": "Commands to run the app",
                    "linting": "Commands to run linters",
                    "testing": "Commands to run tests"
                }
                
                Be specific and provide exact commands that would work in a terminal.
                """
                
                agent = await client.create_agent(
                    project="agunblock",
                    model="gpt-4",
                    name="setup-instruction-extractor",
                    instructions=agent_instructions,
                )
                
                thread = await client.create_thread()
                
                content = f"Repository: {repo_name}\n\n"
                content += "Configuration Files:\n\n"
                
                for file_path, file_content in file_contents.items():
                    content += f"File: {file_path}\n```\n{file_content[:5000]}\n```\n\n"  # Limit file content to 5000 chars
                
                content += "Please extract setup instructions from these files in the format specified."
                
                await client.create_message(
                    thread.id,
                    content=content,
                    role="user"
                )
                
                run = await client.create_run(thread.id, agent.id)
                
                status = None
                while status not in ["completed", "failed", "cancelled", "expired"]:
                    run = await client.get_run(thread.id, run.id)
                    status = run.status
                    
                    if status == "completed":
                        break
                        
                    if status in ["failed", "cancelled", "expired"]:
                        raise RuntimeError(f"Agent run {status}")
                    
                    await asyncio.sleep(2)
                
                messages = await client.list_messages(thread.id)
                
                assistant_messages = [message for message in messages if message.role == "assistant"]
                if assistant_messages:
                    response = assistant_messages[-1].content
                    
                    import json
                    import re
                    
                    json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        json_match = re.search(r'(\{.*\})', response, re.DOTALL)
                        if json_match:
                            json_str = json_match.group(1)
                        else:
                            json_str = response
                    
                    try:
                        setup_instructions = json.loads(json_str)
                        return setup_instructions
                    except json.JSONDecodeError:
                        raise RuntimeError("Failed to parse JSON from response")
                
                raise RuntimeError("No setup instructions found in agent response")
        except Exception as e:
            raise RuntimeError(f"Error extracting setup instructions: {str(e)}")
            
    async def analyze_repository(self, agent_id: str, repo_name: str, readme_content: str, dependencies: Dict[str, str], files: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Analyze a repository using Azure AI Agents with a two-step process.
        
        Args:
            agent_id: The type of AI agent ("github-copilot", "devin", etc.)
            repo_name: The repository name in owner/repo format
            readme_content: The README content of the repository
            dependencies: Dictionary of dependency files and their contents
            files: List of files in the repository (optional)
            
        Returns:
            Dictionary with analysis results and setup commands
        """
        print(f"Analyzing repository: {repo_name} with agent: {agent_id}")
        print(f"Endpoint: {self.endpoint}, Credential: {self.credential is not None}")
        
        if not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Agents credentials are not configured. Please set AZURE_AI_AGENTS_API_KEY and AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        print(f"Starting repository analysis for {repo_name} with agent: {agent_id}...")
        analysis = await self._analyze_with_azure_agents(agent_id, repo_name, readme_content, dependencies)
        print(f"Generated analysis length: {len(analysis)}")
        
        # Step 2: If files are provided, perform the two-step analysis for setup commands
        if files:
            print(f"Starting step 1: Identifying configuration files for {repo_name}...")
            config_files = await self.identify_config_files(repo_name, files)
            print(f"Identified {len(config_files)} configuration files")
            
            print(f"Starting step 2: Extracting setup instructions from configuration files...")
            file_contents = {file_path: dependencies.get(file_path, "") for file_path in config_files if file_path in dependencies}
            
            if readme_content:
                file_contents["README.md"] = readme_content
            
            setup_commands = await self.extract_setup_instructions(agent_id, repo_name, file_contents)
            print(f"Extracted setup commands: {len(setup_commands)}")
            
            return {
                "analysis": analysis,
                "setup_commands": setup_commands
            }
        
        return {
            "analysis": analysis
        }
    
    async def _analyze_with_azure_agents(self, agent_id: str, repo_name: str, readme_content: str, dependencies: Dict[str, str]) -> str:
        """
        Analyze a repository using Azure AI Agents.
        
        Args:
            agent_id: The type of AI agent
            repo_name: The repository name in owner/repo format
            readme_content: The README content of the repository
            dependencies: Dictionary of dependency files and their contents
            
        Returns:
            Analysis results as a string
        """
        try:
            async with AgentsClient(self.endpoint, self.credential) as client:
                agent_instructions = self._get_agent_instructions(agent_id)
                agent = await client.create_agent(
                    project="agunblock",
                    model="gpt-4",
                    name=f"{agent_id}-analyzer",
                    instructions=agent_instructions,
                )
                
                thread = await client.create_thread()
                
                content = f"Repository: {repo_name}\n\n"
                content += "README:\n```\n" + (readme_content or "No README found") + "\n```\n\n"
                
                if dependencies:
                    content += "Dependencies:\n"
                    for file_name, file_content in dependencies.items():
                        content += f"{file_name}:\n```\n{file_content}\n```\n\n"
                
                await client.create_message(
                    thread.id,
                    content=content,
                    role="user"
                )
                
                run = await client.create_run(thread.id, agent.id)
                
                status = None
                while status not in ["completed", "failed", "cancelled", "expired"]:
                    run = await client.get_run(thread.id, run.id)
                    status = run.status
                    
                    if status == "completed":
                        break
                        
                    if status in ["failed", "cancelled", "expired"]:
                        raise RuntimeError(f"Agent run {status}")
                    
                    await asyncio.sleep(2)
                
                messages = await client.list_messages(thread.id)
                
                assistant_messages = [message for message in messages if message.role == "assistant"]
                if assistant_messages:
                    return assistant_messages[-1].content
                
                raise RuntimeError("No analysis results found")
        except Exception as e:
            raise RuntimeError(f"Error connecting to Azure AI Agents: {str(e)}")
    

    def _get_agent_instructions(self, agent_id: str) -> str:
        """
        Get agent-specific instructions for analysis.
        
        Args:
            agent_id: The type of AI agent
            
        Returns:
            Instructions string for the agent
        """
        base_instructions = (
            "You are an AI assistant that analyzes GitHub repositories and provides detailed setup "
            "instructions for different AI agents. Your job is to analyze the repository README and "
            "dependency files to understand the project structure and requirements."
        )
        agent_specific_instructions = {
            AGENT_ID_GITHUB_COPILOT_COMPLETIONS: (
                "Focus on how to set up GitHub Copilot (Code Completions) for this repository. Explain how to "
                "install GitHub Copilot in VS Code, JetBrains, or other supported IDEs, how to "
                "configure it for this specific project, and provide tips for getting the best "
                "code suggestions based on this repository's structure and languages."
            ),
            AGENT_ID_GITHUB_COPILOT_AGENT: (
                "Focus on how to set up GitHub Copilot Coding Agent for this repository. Explain how to "
                "assign issues to the agent, how it creates pull requests and runs CI/CD, and provide tips for "
                "effective use based on this repository's structure and requirements."
            ),
            AGENT_ID_DEVIN: (
                "Focus on how to set up Devin for this repository. Explain how to access Devin "
                "through Azure Marketplace, how to clone and configure this repository for Devin, "
                "and provide tips for effective collaboration with Devin based on this repository's "
                "structure and requirements."
            ),
            AGENT_ID_CODEX_CLI: (
                "Focus on how to set up Codex CLI for this repository. Explain how to install "
                "and configure Codex CLI with Azure OpenAI or OpenAI, how to use it effectively with this "
                "repository, and provide example commands tailored to this repository's structure."
            ),
            AGENT_ID_SREAGENT: (
                "Focus on how to set up SREAgent for this repository. Explain how to configure "
                "SREAgent in an Azure environment, how to connect it with this repository, "
                "and recommend monitoring metrics and alert policies based on this repository's "
                "structure and purpose."
            )
        }
        
        # Support legacy IDs for backward compatibility
        lookup_id = LEGACY_AGENT_ID_MAP.get(agent_id, agent_id)
        if lookup_id in agent_specific_instructions:
            return base_instructions + "\n\n" + agent_specific_instructions[lookup_id]
        return base_instructions
