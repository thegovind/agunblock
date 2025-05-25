import asyncio
import time
from typing import Dict, List, Optional, Any, Union, Callable, Awaitable

from azure.ai.agents.aio import AgentsClient
from azure.ai.agents.models import (
    AgentThreadCreationOptions,
    ThreadMessageOptions,
    MessageTextContent,
    ListSortOrder,
)
from azure.core.credentials import AzureKeyCredential
from azure.identity.aio import DefaultAzureCredential

from ..config import PROJECT_ENDPOINT, MODEL_DEPLOYMENT_NAME, AZURE_AI_PROJECT_CONNECTION_STRING, AZURE_AI_AGENTS_API_KEY
from ..models.schemas import AnalysisProgressUpdate
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
        # Use the new PROJECT_ENDPOINT format (following official samples)
        self.endpoint = PROJECT_ENDPOINT or AZURE_AI_PROJECT_CONNECTION_STRING
        self.model_deployment = MODEL_DEPLOYMENT_NAME
        
        if not self.endpoint:
            raise ValueError("PROJECT_ENDPOINT environment variable is required. Set it to your Azure AI Project endpoint (e.g., https://your-project.services.ai.azure.com/api/projects/your-project-id)")
        
        # Ensure the endpoint uses HTTPS and fix common formatting issues
        if self.endpoint and not self.endpoint.startswith('https://'):
            if self.endpoint.startswith('http://'):
                self.endpoint = self.endpoint.replace('http://', 'https://')
            elif not self.endpoint.startswith('http'):
                # If no protocol is specified, add https://
                self.endpoint = f'https://{self.endpoint}'
        
        # Use DefaultAzureCredential as recommended, fall back to API key if available
        try:
            self.credential = DefaultAzureCredential()
        except Exception:
            # Fall back to API key authentication if DefaultAzureCredential fails
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
        
        if not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Project endpoint is not configured. Please set AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        if not self.credential:
            raise ValueError("Azure AI Agents credentials are not configured. Please run 'az login' for DefaultAzureCredential or set AZURE_AI_AGENTS_API_KEY in your environment.")
        
        try:
            print(f"[CONFIG] Connecting to Azure AI Agents service...")
            
            # Use DefaultAzureCredential as async context manager if available
            credential_context = self.credential if isinstance(self.credential, DefaultAzureCredential) else None
            
            if credential_context:
                async with credential_context:
                    async with AgentsClient(self.endpoint, credential_context) as client:
                        return await self._process_config_identification(client, repo_name, files, start_time)
            else:
                async with AgentsClient(self.endpoint, self.credential) as client:
                    return await self._process_config_identification(client, repo_name, files, start_time)
        except Exception as e:
            print(f"[CONFIG] Error during config file identification: {str(e)}")
            raise RuntimeError(f"Error identifying configuration files: {str(e)}")

    async def _process_config_identification(self, client: AgentsClient, repo_name: str, files: List[Dict[str, Any]], start_time: float) -> List[str]:
        """Process config file identification using the new Azure AI Agents API."""
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
            model=self.model_deployment,
            name="config-file-identifier",
            instructions=agent_instructions,
        )
        
        print(f"[CONFIG] Preparing file list for analysis ({len(files)} files)...")
        file_list = "\n".join([f"{file['path']} ({file['type']})" for file in files[:100]])  # Limit to first 100 files
        
        content = f"Repository: {repo_name}\n\n"
        content += "Files in repository:\n```\n" + file_list + "\n```\n\n"
        content += "Please identify the most important configuration and dependency files from this list."
        
        print(f"[CONFIG] Starting config file identification with create_thread_and_process_run...")
        run = await client.create_thread_and_process_run(
            agent_id=agent.id,
            thread=AgentThreadCreationOptions(
                messages=[ThreadMessageOptions(role="user", content=content)]
            ),
        )
        
        if run.status == "failed":
            error_msg = f"Config identification failed: {run.last_error if run.last_error else 'Unknown error'}"
            print(f"[CONFIG] {error_msg}")
            raise RuntimeError(error_msg)
        
        print(f"[CONFIG] Config file identification completed after {time.time() - start_time:.2f} seconds")
        print(f"[CONFIG] Retrieving config file identification results...")
        
        # List all messages in the thread, in ascending order of creation
        messages = client.messages.list(
            thread_id=run.thread_id,
            order=ListSortOrder.ASCENDING,
        )
        
        response = ""
        async for msg in messages:
            if msg.role == "assistant":
                last_part = msg.content[-1]
                if isinstance(last_part, MessageTextContent):
                    response = last_part.text.value
                    break
        
        if response:
            import re
            file_paths = re.findall(r'`([^`]+)`|"([^"]+)"|\'([^\']+)\'', response)
            file_paths = [path[0] or path[1] or path[2] for path in file_paths if any(path)]
            
            # Filter to ensure they exist in the repository
            repo_files = [file["path"] for file in files]
            valid_files = [path for path in file_paths if path in repo_files]
            
            # Clean up the agent
            try:
                await client.delete_agent(agent.id)
                print(f"[CONFIG] Deleted agent {agent.id}")
            except Exception as e:
                print(f"[CONFIG] Warning: Could not delete agent {agent.id}: {str(e)}")
            
            if valid_files:
                valid_files = valid_files[:10]  # Limit to 10 most important files
                print(f"[CONFIG] Identified {len(valid_files)} config files in {time.time() - start_time:.2f} seconds: {', '.join(valid_files[:5])}" + ("..." if len(valid_files) > 5 else ""))
                return valid_files
        
        print(f"[CONFIG] No valid configuration files identified after {time.time() - start_time:.2f} seconds")
        raise RuntimeError("No valid configuration files identified by the agent")
        
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
        
        if not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Project endpoint is not configured. Please set AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        if not self.credential:
            raise ValueError("Azure AI Agents credentials are not configured. Please run 'az login' for DefaultAzureCredential or set AZURE_AI_AGENTS_API_KEY in your environment.")
        
        try:
            print(f"[SETUP] Connecting to Azure AI Agents service...")
            
            # Use DefaultAzureCredential as async context manager if available
            credential_context = self.credential if isinstance(self.credential, DefaultAzureCredential) else None
            
            if credential_context:
                async with credential_context:
                    async with AgentsClient(self.endpoint, credential_context) as client:
                        return await self._process_setup_extraction(client, agent_id, repo_name, file_contents, start_time)
            else:
                async with AgentsClient(self.endpoint, self.credential) as client:
                    return await self._process_setup_extraction(client, agent_id, repo_name, file_contents, start_time)
        except Exception as e:
            print(f"[SETUP] Error during setup instruction extraction: {str(e)}")
            raise RuntimeError(f"Error extracting setup instructions: {str(e)}")

    async def _process_setup_extraction(self, client: AgentsClient, agent_id: str, repo_name: str, file_contents: Dict[str, str], start_time: float) -> Dict[str, str]:
        """Process setup instruction extraction using the new Azure AI Agents API."""
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
            model=self.model_deployment,
            name="setup-instruction-extractor",
            instructions=agent_instructions,
        )
        
        print(f"[SETUP] Preparing configuration files for analysis ({len(file_contents)} files)...")
        content = f"Repository: {repo_name}\n\n"
        content += "Configuration Files:\n\n"
        
        for file_path, file_content in file_contents.items():
            content += f"File: {file_path}\n```\n{file_content[:5000]}\n```\n\n"  # Limit file content to 5000 chars
        
        content += "Please extract setup instructions from these files in the format specified."
        
        print(f"[SETUP] Starting setup instruction extraction with create_thread_and_process_run...")
        run = await client.create_thread_and_process_run(
            agent_id=agent.id,
            thread=AgentThreadCreationOptions(
                messages=[ThreadMessageOptions(role="user", content=content)]
            ),
        )
        
        if run.status == "failed":
            error_msg = f"Setup extraction failed: {run.last_error if run.last_error else 'Unknown error'}"
            print(f"[SETUP] {error_msg}")
            raise RuntimeError(error_msg)
        
        print(f"[SETUP] Setup instruction extraction completed after {time.time() - start_time:.2f} seconds")
        print(f"[SETUP] Retrieving setup instruction extraction results...")
        
        # List all messages in the thread, in ascending order of creation
        messages = client.messages.list(
            thread_id=run.thread_id,
            order=ListSortOrder.ASCENDING,
        )
        
        response = ""
        async for msg in messages:
            if msg.role == "assistant":
                last_part = msg.content[-1]
                if isinstance(last_part, MessageTextContent):
                    response = last_part.text.value
                    break
        
        if response:
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
                
                # Clean up the agent
                try:
                    await client.delete_agent(agent.id)
                    print(f"[SETUP] Deleted agent {agent.id}")
                except Exception as e:
                    print(f"[SETUP] Warning: Could not delete agent {agent.id}: {str(e)}")
                
                print(f"[SETUP] Successfully extracted setup instructions in {time.time() - start_time:.2f} seconds: {', '.join(setup_instructions.keys())}")
                return setup_instructions
            except json.JSONDecodeError:
                print(f"[SETUP] Failed to parse JSON from response after {time.time() - start_time:.2f} seconds")
                raise RuntimeError("Failed to parse JSON from response")
        
        print(f"[SETUP] No setup instructions found in agent response after {time.time() - start_time:.2f} seconds")
        raise RuntimeError("No setup instructions found in agent response")
            
    async def analyze_repository(self, agent_id: str, repo_name: str, readme_content: str, dependencies: Dict[str, str], files: Optional[List[Dict[str, Any]]] = None, progress_callback: Optional[Callable[[AnalysisProgressUpdate], Awaitable[None]]] = None) -> Dict[str, Any]:
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
        
        if not self.endpoint or self.endpoint == "your_endpoint":
            raise ValueError("Azure AI Project endpoint is not configured. Please set AZURE_AI_PROJECT_CONNECTION_STRING in your environment.")
        
        if not self.credential:
            raise ValueError("Azure AI Agents credentials are not configured. Please run 'az login' for DefaultAzureCredential or set AZURE_AI_AGENTS_API_KEY in your environment.")
        
        # Send initial progress update
        if progress_callback:
            await progress_callback(AnalysisProgressUpdate(
                step=1,
                step_name="Analyzing Repository Content",
                status="starting",
                message=f"Starting analysis for {repo_name} with {agent_id}",
                progress_percentage=0
            ))
        
        print(f"[ANALYSIS] Step 1/3: Analyzing repository content for {repo_name}...")
        analysis_start_time = time.time()
        
        if progress_callback:
            await progress_callback(AnalysisProgressUpdate(
                step=1,
                step_name="Analyzing Repository Content",
                status="in_progress",
                message="Azure AI Agents is analyzing the repository structure and README",
                progress_percentage=10
            ))
        
        analysis = await self._analyze_with_azure_agents(agent_id, repo_name, readme_content, dependencies)
        analysis_duration = time.time() - analysis_start_time
        print(f"[ANALYSIS] Step 1/3 completed in {analysis_duration:.2f} seconds. Generated analysis length: {len(analysis)}")
        
        if progress_callback:
            await progress_callback(AnalysisProgressUpdate(
                step=1,
                step_name="Analyzing Repository Content",
                status="completed",
                message=f"Repository analysis completed in {analysis_duration:.1f} seconds",
                progress_percentage=33,
                elapsed_time=analysis_duration,
                details={"analysis_length": len(analysis)}
            ))
        
        # Step 2: If files are provided, perform the two-step analysis for setup commands
        if files:
            # Step 2: Identify configuration files
            if progress_callback:
                await progress_callback(AnalysisProgressUpdate(
                    step=2,
                    step_name="Identifying Configuration Files",
                    status="starting",
                    message="Scanning repository files to identify configuration and dependency files",
                    progress_percentage=35
                ))
            
            print(f"[ANALYSIS] Step 2/3: Identifying configuration files for {repo_name}...")
            config_start_time = time.time()
            
            if progress_callback:
                await progress_callback(AnalysisProgressUpdate(
                    step=2,
                    step_name="Identifying Configuration Files",
                    status="in_progress",
                    message=f"Azure AI Agents is analyzing {len(files)} files to identify important configuration files",
                    progress_percentage=45
                ))
            
            config_files = await self.identify_config_files(repo_name, files)
            config_duration = time.time() - config_start_time
            print(f"[ANALYSIS] Step 2/3 completed in {config_duration:.2f} seconds. Identified {len(config_files)} configuration files: {', '.join(config_files[:5])}" + ("..." if len(config_files) > 5 else ""))
            
            if progress_callback:
                await progress_callback(AnalysisProgressUpdate(
                    step=2,
                    step_name="Identifying Configuration Files",
                    status="completed",
                    message=f"Identified {len(config_files)} configuration files in {config_duration:.1f} seconds",
                    progress_percentage=66,
                    elapsed_time=config_duration,
                    details={"config_files_count": len(config_files), "config_files": config_files[:5]}
                ))
            
            # Step 3: Extract setup instructions
            if progress_callback:
                await progress_callback(AnalysisProgressUpdate(
                    step=3,
                    step_name="Extracting Setup Instructions",
                    status="starting",
                    message="Extracting detailed setup instructions from configuration files",
                    progress_percentage=70
                ))
            
            print(f"[ANALYSIS] Step 3/3: Extracting setup instructions from configuration files...")
            setup_start_time = time.time()
            file_contents = {file_path: dependencies.get(file_path, "") for file_path in config_files if file_path in dependencies}
            
            if readme_content:
                file_contents["README.md"] = readme_content
            
            if progress_callback:
                await progress_callback(AnalysisProgressUpdate(
                    step=3,
                    step_name="Extracting Setup Instructions",
                    status="in_progress",
                    message=f"Azure AI Agents is extracting setup commands from {len(file_contents)} configuration files",
                    progress_percentage=85
                ))
            
            setup_commands = await self.extract_setup_instructions(agent_id, repo_name, file_contents)
            setup_duration = time.time() - setup_start_time
            print(f"[ANALYSIS] Step 3/3 completed in {setup_duration:.2f} seconds. Extracted setup commands for: {', '.join(setup_commands.keys())}")
            
            total_duration = time.time() - analysis_start_time
            print(f"[ANALYSIS] Total analysis completed in {total_duration:.2f} seconds for {repo_name}")
            
            if progress_callback:
                await progress_callback(AnalysisProgressUpdate(
                    step=3,
                    step_name="Extracting Setup Instructions",
                    status="completed",
                    message=f"Setup instructions extracted successfully in {setup_duration:.1f} seconds",
                    progress_percentage=100,
                    elapsed_time=total_duration,
                    details={"setup_commands": list(setup_commands.keys()), "total_duration": total_duration}
                ))
            
            return {
                "analysis": analysis,
                "setup_commands": setup_commands
            }
        
        print(f"[ANALYSIS] Analysis completed for {repo_name} (without setup commands)")
        
        if progress_callback:
            total_duration = time.time() - analysis_start_time
            await progress_callback(AnalysisProgressUpdate(
                step=1,
                step_name="Analysis Complete",
                status="completed",
                message="Repository analysis completed successfully",
                progress_percentage=100,
                elapsed_time=total_duration,
                details={"analysis_length": len(analysis)}
            ))
        
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
            
            # Use DefaultAzureCredential as async context manager if available
            credential_context = self.credential if isinstance(self.credential, DefaultAzureCredential) else None
            
            if credential_context:
                async with credential_context:
                    async with AgentsClient(self.endpoint, credential_context) as client:
                        return await self._process_analysis(client, agent_id, repo_name, readme_content, dependencies, start_time)
            else:
                async with AgentsClient(self.endpoint, self.credential) as client:
                    return await self._process_analysis(client, agent_id, repo_name, readme_content, dependencies, start_time)
                    
        except Exception as e:
            print(f"[ANALYSIS] Error during analysis: {str(e)}")
            raise RuntimeError(f"Error connecting to Azure AI Agents: {str(e)}")

    async def _process_analysis(self, client: AgentsClient, agent_id: str, repo_name: str, readme_content: str, dependencies: Dict[str, str], start_time: float) -> str:
        """Process the analysis using the new Azure AI Agents API."""
        print(f"[ANALYSIS] Creating agent with ID: {agent_id}...")
        agent_instructions = self._get_agent_instructions(agent_id)
        agent = await client.create_agent(
            model=self.model_deployment,
            name=f"{agent_id}-analyzer",
            instructions=agent_instructions,
        )
        
        print(f"[ANALYSIS] Preparing repository content for analysis...")
        content = f"Repository: {repo_name}\n\n"
        content += "README:\n```\n" + (readme_content or "No README found") + "\n```\n\n"
        
        if dependencies:
            content += f"Dependencies ({len(dependencies)} files):\n"
            for file_name, file_content in dependencies.items():
                content += f"{file_name}:\n```\n{file_content}\n```\n\n"
        
        print(f"[ANALYSIS] Starting analysis with create_thread_and_process_run...")
        run = await client.create_thread_and_process_run(
            agent_id=agent.id,
            thread=AgentThreadCreationOptions(
                messages=[ThreadMessageOptions(role="user", content=content)]
            ),
        )
        
        if run.status == "failed":
            error_msg = f"Analysis failed: {run.last_error if run.last_error else 'Unknown error'}"
            print(f"[ANALYSIS] {error_msg}")
            raise RuntimeError(error_msg)
        
        print(f"[ANALYSIS] Analysis completed after {time.time() - start_time:.2f} seconds")
        print(f"[ANALYSIS] Retrieving analysis results...")
        
        # List all messages in the thread, in ascending order of creation
        messages = client.messages.list(
            thread_id=run.thread_id,
            order=ListSortOrder.ASCENDING,
        )
        
        result_content = ""
        async for msg in messages:
            if msg.role == "assistant":
                last_part = msg.content[-1]
                if isinstance(last_part, MessageTextContent):
                    result_content = last_part.text.value
                    break
        
        if result_content:
            print(f"[ANALYSIS] Analysis completed successfully in {time.time() - start_time:.2f} seconds (result length: {len(result_content)} chars)")
            
            # Clean up the agent
            try:
                await client.delete_agent(agent.id)
                print(f"[ANALYSIS] Deleted agent {agent.id}")
            except Exception as e:
                print(f"[ANALYSIS] Warning: Could not delete agent {agent.id}: {str(e)}")
            
            return result_content
        
        print(f"[ANALYSIS] No analysis results found after {time.time() - start_time:.2f} seconds")
        raise RuntimeError("No analysis results found")
    

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
                "Focus on how to set up Devin for this repository. Devin is SWE Agent from Cognition Explain how to access Devin "
                "through Azure Marketplace at https://aka.ms/devin, how to clone and configure this repository for Devin, "
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
