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
        print(f"[CONFIG] Identifying configuration files for {repo_name}...")
        start_time = time.time()
        
        if not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Agents credentials are not configured. Please set AZURE_AI_AGENTS_API_KEY and AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        try:
            print(f"[CONFIG] Connecting to Azure AI Agents service...")
            
            async with AgentsClient(self.endpoint, self.credential) as client:
                print(f"[CONFIG] Creating agent for config file identification...")
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
                
                print(f"[CONFIG] Creating thread for config file identification...")
                thread = await client.create_thread()
                
                print(f"[CONFIG] Preparing file list for analysis ({len(files)} files)...")
                file_list = "\n".join([f"{file['path']} ({file['type']})" for file in files[:100]])  # Limit to first 100 files
                
                content = f"Repository: {repo_name}\n\n"
                content += "Files in repository:\n```\n" + file_list + "\n```\n\n"
                content += "Please identify the most important configuration and dependency files from this list."
                
                print(f"[CONFIG] Sending file list to Azure AI Agents...")
                await client.create_message(
                    thread.id,
                    content=content,
                    role="user"
                )
                
                print(f"[CONFIG] Starting config file identification run...")
                run = await client.create_run(thread.id, agent.id)
                
                print(f"[CONFIG] Waiting for config file identification to complete...")
                status = None
                last_status_time = time.time()
                
                while status not in ["completed", "failed", "cancelled", "expired"]:
                    run = await client.get_run(thread.id, run.id)
                    status = run.status
                    
                    current_time = time.time()
                    elapsed = current_time - start_time
                    since_last_update = current_time - last_status_time
                    
                    if status == "completed":
                        print(f"[CONFIG] Config file identification completed after {elapsed:.2f} seconds")
                        break
                        
                    if status in ["failed", "cancelled", "expired"]:
                        print(f"[CONFIG] Config file identification failed with status: {status} after {elapsed:.2f} seconds")
                        raise RuntimeError(f"Agent run {status}")
                    
                    if since_last_update >= 10:
                        print(f"[CONFIG] Still identifying config files... (elapsed: {elapsed:.2f}s, status: {status})")
                        last_status_time = current_time
                    
                    await asyncio.sleep(2)
                
                print(f"[CONFIG] Retrieving config file identification results...")
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
                        valid_files = valid_files[:10]  # Limit to 10 most important files
                        print(f"[CONFIG] Identified {len(valid_files)} config files in {time.time() - start_time:.2f} seconds: {', '.join(valid_files[:5])}" + ("..." if len(valid_files) > 5 else ""))
                        return valid_files
                
                print(f"[CONFIG] No valid configuration files identified after {time.time() - start_time:.2f} seconds")
                raise RuntimeError("No valid configuration files identified by the agent")
        except Exception as e:
            print(f"[CONFIG] Error during config file identification: {str(e)}")
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
        print(f"[SETUP] Extracting setup instructions for {repo_name} with agent: {agent_id}...")
        start_time = time.time()
        
        if not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Agents credentials are not configured. Please set AZURE_AI_AGENTS_API_KEY and AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        try:
            print(f"[SETUP] Connecting to Azure AI Agents service...")
            
            async with AgentsClient(self.endpoint, self.credential) as client:
                print(f"[SETUP] Creating agent for setup instruction extraction...")
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
                
                print(f"[SETUP] Creating thread for setup instruction extraction...")
                thread = await client.create_thread()
                
                print(f"[SETUP] Preparing configuration files for analysis ({len(file_contents)} files)...")
                content = f"Repository: {repo_name}\n\n"
                content += "Configuration Files:\n\n"
                
                for file_path, file_content in file_contents.items():
                    content += f"File: {file_path}\n```\n{file_content[:5000]}\n```\n\n"  # Limit file content to 5000 chars
                
                content += "Please extract setup instructions from these files in the format specified."
                
                print(f"[SETUP] Sending configuration files to Azure AI Agents...")
                await client.create_message(
                    thread.id,
                    content=content,
                    role="user"
                )
                
                print(f"[SETUP] Starting setup instruction extraction run...")
                run = await client.create_run(thread.id, agent.id)
                
                print(f"[SETUP] Waiting for setup instruction extraction to complete...")
                status = None
                last_status_time = time.time()
                
                while status not in ["completed", "failed", "cancelled", "expired"]:
                    run = await client.get_run(thread.id, run.id)
                    status = run.status
                    
                    current_time = time.time()
                    elapsed = current_time - start_time
                    since_last_update = current_time - last_status_time
                    
                    if status == "completed":
                        print(f"[SETUP] Setup instruction extraction completed after {elapsed:.2f} seconds")
                        break
                        
                    if status in ["failed", "cancelled", "expired"]:
                        print(f"[SETUP] Setup instruction extraction failed with status: {status} after {elapsed:.2f} seconds")
                        raise RuntimeError(f"Agent run {status}")
                    
                    if since_last_update >= 10:
                        print(f"[SETUP] Still extracting setup instructions... (elapsed: {elapsed:.2f}s, status: {status})")
                        last_status_time = current_time
                    
                    await asyncio.sleep(2)
                
                print(f"[SETUP] Retrieving setup instruction extraction results...")
                messages = await client.list_messages(thread.id)
                
                assistant_messages = [message for message in messages if message.role == "assistant"]
                if assistant_messages:
                    response = assistant_messages[-1].content
                    
                    import json
                    import re
                    
                    print(f"[SETUP] Parsing JSON response...")
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
                        print(f"[SETUP] Successfully extracted setup instructions in {time.time() - start_time:.2f} seconds: {', '.join(setup_instructions.keys())}")
                        return setup_instructions
                    except json.JSONDecodeError:
                        print(f"[SETUP] Failed to parse JSON from response after {time.time() - start_time:.2f} seconds")
                        raise RuntimeError("Failed to parse JSON from response")
                
                print(f"[SETUP] No setup instructions found in agent response after {time.time() - start_time:.2f} seconds")
                raise RuntimeError("No setup instructions found in agent response")
        except Exception as e:
            print(f"[SETUP] Error during setup instruction extraction: {str(e)}")
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
        print(f"[ANALYSIS] Starting analysis for repository: {repo_name} with agent: {agent_id}")
        print(f"[ANALYSIS] Azure AI Agents endpoint configured: {self.endpoint != 'your_endpoint'}, Credentials available: {self.credential is not None}")
        
        if not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Agents credentials are not configured. Please set AZURE_AI_AGENTS_API_KEY and AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        print(f"[ANALYSIS] Step 1/3: Analyzing repository content for {repo_name}...")
        analysis_start_time = time.time()
        analysis = await self._analyze_with_azure_agents(agent_id, repo_name, readme_content, dependencies)
        analysis_duration = time.time() - analysis_start_time
        print(f"[ANALYSIS] Step 1/3 completed in {analysis_duration:.2f} seconds. Generated analysis length: {len(analysis)}")
        
        # Step 2: If files are provided, perform the two-step analysis for setup commands
        if files:
            # Step 2: Identify configuration files
            print(f"[ANALYSIS] Step 2/3: Identifying configuration files for {repo_name}...")
            config_start_time = time.time()
            config_files = await self.identify_config_files(repo_name, files)
            config_duration = time.time() - config_start_time
            print(f"[ANALYSIS] Step 2/3 completed in {config_duration:.2f} seconds. Identified {len(config_files)} configuration files: {', '.join(config_files[:5])}" + ("..." if len(config_files) > 5 else ""))
            
            # Step 3: Extract setup instructions
            print(f"[ANALYSIS] Step 3/3: Extracting setup instructions from configuration files...")
            setup_start_time = time.time()
            file_contents = {file_path: dependencies.get(file_path, "") for file_path in config_files if file_path in dependencies}
            
            if readme_content:
                file_contents["README.md"] = readme_content
            
            setup_commands = await self.extract_setup_instructions(agent_id, repo_name, file_contents)
            setup_duration = time.time() - setup_start_time
            print(f"[ANALYSIS] Step 3/3 completed in {setup_duration:.2f} seconds. Extracted setup commands for: {', '.join(setup_commands.keys())}")
            
            total_duration = time.time() - analysis_start_time
            print(f"[ANALYSIS] Total analysis completed in {total_duration:.2f} seconds for {repo_name}")
            
            return {
                "analysis": analysis,
                "setup_commands": setup_commands
            }
        
        print(f"[ANALYSIS] Analysis completed for {repo_name} (without setup commands)")
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
            print(f"[ANALYSIS] Connecting to Azure AI Agents service...")
            start_time = time.time()
            
            async with AgentsClient(self.endpoint, self.credential) as client:
                print(f"[ANALYSIS] Creating agent with ID: {agent_id}...")
                agent_instructions = self._get_agent_instructions(agent_id)
                agent = await client.create_agent(
                    project="agunblock",
                    model="gpt-4",
                    name=f"{agent_id}-analyzer",
                    instructions=agent_instructions,
                )
                
                print(f"[ANALYSIS] Creating thread for analysis...")
                thread = await client.create_thread()
                
                print(f"[ANALYSIS] Preparing repository content for analysis...")
                content = f"Repository: {repo_name}\n\n"
                content += "README:\n```\n" + (readme_content or "No README found") + "\n```\n\n"
                
                if dependencies:
                    content += f"Dependencies ({len(dependencies)} files):\n"
                    for file_name, file_content in dependencies.items():
                        content += f"{file_name}:\n```\n{file_content}\n```\n\n"
                
                print(f"[ANALYSIS] Sending repository content to Azure AI Agents...")
                await client.create_message(
                    thread.id,
                    content=content,
                    role="user"
                )
                
                print(f"[ANALYSIS] Starting analysis run with agent: {agent_id}...")
                run = await client.create_run(thread.id, agent.id)
                
                print(f"[ANALYSIS] Waiting for analysis to complete...")
                status = None
                last_status_time = time.time()
                status_check_count = 0
                
                while status not in ["completed", "failed", "cancelled", "expired"]:
                    run = await client.get_run(thread.id, run.id)
                    status = run.status
                    status_check_count += 1
                    
                    current_time = time.time()
                    elapsed = current_time - start_time
                    since_last_update = current_time - last_status_time
                    
                    if status == "completed":
                        print(f"[ANALYSIS] Analysis completed after {elapsed:.2f} seconds")
                        break
                        
                    if status in ["failed", "cancelled", "expired"]:
                        print(f"[ANALYSIS] Analysis failed with status: {status} after {elapsed:.2f} seconds")
                        raise RuntimeError(f"Agent run {status}")
                    
                    if since_last_update >= 10:
                        print(f"[ANALYSIS] Still analyzing... (elapsed: {elapsed:.2f}s, status: {status})")
                        last_status_time = current_time
                    
                    await asyncio.sleep(2)
                
                print(f"[ANALYSIS] Retrieving analysis results...")
                messages = await client.list_messages(thread.id)
                
                assistant_messages = [message for message in messages if message.role == "assistant"]
                if assistant_messages:
                    result = assistant_messages[-1].content
                    print(f"[ANALYSIS] Analysis completed successfully in {time.time() - start_time:.2f} seconds (result length: {len(result)} chars)")
                    return result
                
                print(f"[ANALYSIS] No analysis results found after {time.time() - start_time:.2f} seconds")
                raise RuntimeError("No analysis results found")
        except Exception as e:
            print(f"[ANALYSIS] Error during analysis: {str(e)}")
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
