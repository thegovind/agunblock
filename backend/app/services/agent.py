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
            print("Using predefined list of configuration files")
            common_config_files = [
                "requirements.txt", "pyproject.toml", "setup.py", "Pipfile",  # Python
                "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",  # JavaScript/Node.js
                "Gemfile", "Gemfile.lock",  # Ruby
                "pom.xml", "build.gradle", "build.gradle.kts",  # Java/Kotlin
                "Cargo.toml",  # Rust
                "go.mod", "go.sum",  # Go
                "composer.json", "composer.lock",  # PHP
                "Dockerfile", "docker-compose.yml", "docker-compose.yaml",  # Docker
                ".github/workflows", "azure-pipelines.yml",  # CI/CD
                "README.md", "CONTRIBUTING.md", "INSTALL.md", "SETUP.md"  # Documentation
            ]
            
            # Filter the list to only include files that exist in the repository
            file_paths = [file["path"] for file in files]
            config_files = []
            
            for config_file in common_config_files:
                matching_files = [path for path in file_paths if path == config_file or path.endswith("/" + config_file) or (config_file.endswith("/") and any(path.startswith(config_file) for path in file_paths))]
                config_files.extend(matching_files)
            
            return config_files[:10]  # Limit to 10 most important files
        
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
                        print(f"Agent run {status}, using predefined list instead")
                        return self._get_default_config_files(files)
                    
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
                
                return self._get_default_config_files(files)
        except Exception as e:
            print(f"Error identifying configuration files: {str(e)}")
            return self._get_default_config_files(files)
    
    def _get_default_config_files(self, files: List[Dict[str, Any]]) -> List[str]:
        """Get a default list of configuration files based on common patterns."""
        common_config_files = [
            "README.md", 
            "requirements.txt", 
            "package.json", 
            "pyproject.toml", 
            "Dockerfile", 
            ".env.example",
            "docker-compose.yml",
            "Makefile",
            "setup.py",
            "CONTRIBUTING.md"
        ]
        
        file_paths = [file["path"] for file in files]
        return [path for path in file_paths if any(path.endswith("/" + config) or path == config for config in common_config_files)][:10]
        
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
            print("Using mock setup instructions")
            return self._generate_mock_setup_instructions(repo_name, file_contents)
        
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
                        print(f"Agent run {status}, using mock setup instructions instead")
                        return self._generate_mock_setup_instructions(repo_name, file_contents)
                    
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
                        print("Failed to parse JSON from response")
                
                return self._generate_mock_setup_instructions(repo_name, file_contents)
        except Exception as e:
            print(f"Error extracting setup instructions: {str(e)}")
            return self._generate_mock_setup_instructions(repo_name, file_contents)
    
    def _generate_mock_setup_instructions(self, repo_name: str, file_contents: Dict[str, str]) -> Dict[str, str]:
        """Generate mock setup instructions based on file contents."""
        setup_instructions = {
            "prerequisites": "",
            "dependencies": "",
            "run_app": "",
            "linting": "",
            "testing": ""
        }
        
        if any(path.endswith(".py") for path in file_contents.keys()) or "requirements.txt" in file_contents:
            setup_instructions["prerequisites"] = "Python 3.8+ required\npip install -U pip"
            setup_instructions["dependencies"] = "pip install -r requirements.txt"
            setup_instructions["run_app"] = "python app.py"
            setup_instructions["linting"] = "flake8 ."
            setup_instructions["testing"] = "pytest"
        
        if "package.json" in file_contents:
            package_json = file_contents.get("package.json", "{}")
            if "pnpm-lock.yaml" in file_contents:
                setup_instructions["prerequisites"] = "Node.js 16+ required\nnpm install -g pnpm"
                setup_instructions["dependencies"] = "pnpm install"
            elif "yarn.lock" in file_contents:
                setup_instructions["prerequisites"] = "Node.js 16+ required\nnpm install -g yarn"
                setup_instructions["dependencies"] = "yarn install"
            else:
                setup_instructions["prerequisites"] = "Node.js 16+ required"
                setup_instructions["dependencies"] = "npm install"
            
            if "react" in package_json:
                setup_instructions["run_app"] = "npm start"
            elif "next" in package_json:
                setup_instructions["run_app"] = "npm run dev"
            else:
                setup_instructions["run_app"] = "npm start"
            
            setup_instructions["linting"] = "npm run lint"
            setup_instructions["testing"] = "npm test"
        
        if "Dockerfile" in file_contents or "docker-compose.yml" in file_contents:
            setup_instructions["prerequisites"] = "Docker and Docker Compose required"
            setup_instructions["dependencies"] = "docker-compose build"
            setup_instructions["run_app"] = "docker-compose up"
        
        return setup_instructions
            
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
        
        if True or not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            print(f"Using mock data for {agent_id} and {repo_name}")
            analysis = self._generate_mock_analysis(agent_id, repo_name, readme_content, dependencies)
            print(f"Generated mock analysis length: {len(analysis)}")
            
            if files:
                config_files = await self.identify_config_files(repo_name, files)
                print(f"Identified {len(config_files)} configuration files")
                
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
                        return f"Error: Agent run {status}"
                    
                    await asyncio.sleep(2)
                
                messages = await client.list_messages(thread.id)
                
                assistant_messages = [message for message in messages if message.role == "assistant"]
                if assistant_messages:
                    return assistant_messages[-1].content
                
                return "No analysis results found"
        except Exception as e:
            return f"Error connecting to Azure AI Agents: {str(e)}\n\nUsing mock data instead:\n\n{self._generate_mock_analysis(agent_id, repo_name, readme_content, dependencies)}"
    
    def _generate_mock_analysis(self, agent_id: str, repo_name: str, readme_content: str, dependencies: Dict[str, str]) -> str:
        """
        Generate mock analysis data for testing purposes.
        
        Args:
            agent_id: The type of AI agent
            repo_name: The repository name in owner/repo format
            readme_content: The README content of the repository
            dependencies: Dictionary of dependency files and their contents
            
        Returns:
            Mock analysis as a string
        """
        language = "JavaScript"
        if dependencies:
            for dep_file, lang in LANGUAGE_MAP.items():
                if dep_file in dependencies:
                    language = lang
                    break
                
        analyses = {
            AGENT_ID_GITHUB_COPILOT_COMPLETIONS: f"""## GitHub Copilot (Code Completions) Analysis for {repo_name}

This repository is well-suited for GitHub Copilot code completions. Based on the codebase structure and {language} language, here's how to set up:

### Setup Instructions

1. Install GitHub Copilot extension in VS Code, JetBrains, or other supported IDEs
2. Open files from this repository and start coding
3. GitHub Copilot will provide contextual suggestions as you type

- Enable inline suggestions
- Configure Copilot to analyze your entire workspace for better context
- Use Copilot Chat for explaining code and generating documentation
- This {language} codebase will benefit from Copilot's strong understanding of standard libraries and frameworks
- Use comments to guide Copilot when working with complex or custom components
- For large files, consider breaking them down into smaller components for better suggestions

```bash
# Clone the repository
git clone https://github.com/{repo_name}.git
cd {repo_name.split('/')[1]}

code .
```

Enable GitHub Copilot in your editor settings and start coding with AI assistance!""",
            AGENT_ID_GITHUB_COPILOT_AGENT: f"""## GitHub Copilot Coding Agent Analysis for {repo_name}

This repository can benefit from GitHub Copilot Coding Agent for asynchronous, issue-driven automation. Here's how to set up:

### Setup Instructions

1. Assign GitHub Issues to Copilot Agent in your repository
2. The agent will autonomously create pull requests, run CI/CD, and iterate on feedback
3. Review and merge the agent's pull requests as needed

- Automate feature additions, bug fixes, refactoring, and more
- Leverage GitHub's security and review workflows
- Monitor the agent's progress in draft pull requests

```bash
# Example: Assign an issue to Copilot Agent
# On GitHub, assign the issue to @github-copilot-agent
```

Copilot Coding Agent works best with clear, well-scoped issues and access to your repository's context.""",
            AGENT_ID_DEVIN: f"""## Devin Configuration for {repo_name}

This {language} repository can be effectively worked on using Devin. Here's the setup:

### Setup Instructions

1. Access Devin through Azure Marketplace
2. Clone this repository using: `git clone https://github.com/{repo_name}.git`
3. Ask Devin to analyze the repository structure
4. Specify tasks you want Devin to help with

- Provide Devin with full repository access for context
- Use natural language to describe your development goals
- Allow Devin to suggest architectural improvements
- For this {language} codebase, Devin can help with:
  - Code refactoring and optimization
  - Implementing new features
  - Debugging complex issues
  - Writing comprehensive tests

```
"Devin, analyze this {language} repository and suggest performance improvements"
"Help me implement a new feature that does X in this codebase"
"Debug why this function is not working as expected"
```

Devin works best with this repository by understanding the full context of files and dependencies.""",
            AGENT_ID_CODEX_CLI: f"""## Codex CLI Setup for {repo_name}

This guide will help you set up Codex CLI to work with this {language} repository.

### Setup Instructions

1. Set up Azure OpenAI Service with Codex model or use OpenAI endpoint
2. Install the Codex CLI tool
3. Configure your API key
4. Clone the repository
5. Use the following commands to analyze code

```bash
pip install codex-cli

codex configure --api-key YOUR_API_KEY

# Clone the repository
git clone https://github.com/{repo_name}.git
cd {repo_name.split('/')[1]}
```

```bash
# Analyze a specific file
codex explain -f [filename]

codex generate -p "Create a function that..."

codex optimize -f [filename]
```

- Use Codex CLI to generate boilerplate code
- Ask for explanations of complex functions
- Generate unit tests for critical components
- Use for documentation generation

This repository's structure is compatible with Codex CLI's code generation capabilities.""",
            AGENT_ID_SREAGENT: f"""## SREAgent Configuration for {repo_name}

This guide will help you set up SREAgent for this {language} repository.

### Setup Instructions

1. Set up SREAgent in your Azure environment
2. Connect this repository using the SREAgent GitHub integration
3. Configure monitoring settings in the Azure portal
4. Set up alert policies based on repository activity

```bash
pip install sreagent-cli

sreagent configure --subscription YOUR_SUBSCRIPTION_ID

# Connect repository
sreagent connect --repo {repo_name}

sreagent monitor --setup
```

- Deployment frequency
- Error rates
- Performance metrics
- Infrastructure usage
- API response times
- Resource utilization

Based on this {language} repository, we recommend setting up alerts for:
- Failed deployments
- Unusual error rate spikes
- Performance degradation
- Resource constraints

SREAgent can help maintain reliability for services deployed from this repository."""
        }
        
        # Support legacy IDs for backward compatibility
        lookup_id = LEGACY_AGENT_ID_MAP.get(agent_id, agent_id)
        return analyses.get(lookup_id, f"No specific analysis available for {agent_id} and {repo_name}. Please try another agent.")

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
