import asyncio
import time
from azure.ai.agents.aio import AgentsClient
from azure.core.credentials import AzureKeyCredential
from ..config import AZURE_AI_PROJECT_CONNECTION_STRING, AZURE_AI_AGENTS_API_KEY

class AzureAgentService:
    def __init__(self):
        self.endpoint = AZURE_AI_PROJECT_CONNECTION_STRING
        self.credential = None if not AZURE_AI_AGENTS_API_KEY or AZURE_AI_AGENTS_API_KEY == "your_api_key" else AzureKeyCredential(AZURE_AI_AGENTS_API_KEY)
        
    async def analyze_repository(self, agent_id: str, repo_name: str, readme_content: str, dependencies: dict):
        """
        Analyze a repository using Azure AI Agents.
        
        Args:
            agent_id: The type of AI agent ("github-copilot", "devin", etc.)
            repo_name: The repository name in owner/repo format
            readme_content: The README content of the repository
            dependencies: Dictionary of dependency files and their contents
        
        Returns:
            Analysis results as a string
        """
        print(f"Analyzing repository: {repo_name} with agent: {agent_id}")
        print(f"Endpoint: {self.endpoint}, Credential: {self.credential is not None}")
        
        if True or not self.credential or not self.endpoint or self.endpoint == "your_endpoint":
            print(f"Using mock data for {agent_id} and {repo_name}")
            mock_analysis = self._generate_mock_analysis(agent_id, repo_name, readme_content, dependencies)
            print(f"Generated mock analysis length: {len(mock_analysis)}")
            return mock_analysis
            
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
    
    def _generate_mock_analysis(self, agent_id: str, repo_name: str, readme_content: str, dependencies: dict):
        """Generate mock analysis data for testing purposes."""
        language = "JavaScript"
        if dependencies:
            if "requirements.txt" in dependencies:
                language = "Python"
            elif "package.json" in dependencies:
                language = "JavaScript/TypeScript"
            elif "pom.xml" in dependencies:
                language = "Java"
            elif "build.gradle" in dependencies:
                language = "Java/Kotlin"
                
        analyses = {
            'github-copilot-completions': f"""## GitHub Copilot (Code Completions) Analysis for {repo_name}

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
            'github-copilot-agent': f"""## GitHub Copilot Coding Agent Analysis for {repo_name}

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
            'devin': f"""## Devin Configuration for {repo_name}

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
            'codex-cli': f"""## Codex CLI Setup for {repo_name}

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
            'sreagent': f"""## SREAgent Configuration for {repo_name}

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
        legacy_map = {
            'github-copilot': 'github-copilot-completions',
        }
        lookup_id = legacy_map.get(agent_id, agent_id)
        return analyses.get(lookup_id, f"No specific analysis available for {agent_id} and {repo_name}. Please try another agent.")

    def _get_agent_instructions(self, agent_id: str):
        base_instructions = (
            "You are an AI assistant that analyzes GitHub repositories and provides detailed setup "
            "instructions for different AI agents. Your job is to analyze the repository README and "
            "dependency files to understand the project structure and requirements."
        )
        agent_specific_instructions = {
            "github-copilot-completions": (
                "Focus on how to set up GitHub Copilot (Code Completions) for this repository. Explain how to "
                "install GitHub Copilot in VS Code, JetBrains, or other supported IDEs, how to "
                "configure it for this specific project, and provide tips for getting the best "
                "code suggestions based on this repository's structure and languages."
            ),
            "github-copilot-agent": (
                "Focus on how to set up GitHub Copilot Coding Agent for this repository. Explain how to "
                "assign issues to the agent, how it creates pull requests and runs CI/CD, and provide tips for "
                "effective use based on this repository's structure and requirements."
            ),
            "devin": (
                "Focus on how to set up Devin for this repository. Explain how to access Devin "
                "through Azure Marketplace, how to clone and configure this repository for Devin, "
                "and provide tips for effective collaboration with Devin based on this repository's "
                "structure and requirements."
            ),
            "codex-cli": (
                "Focus on how to set up Codex CLI for this repository. Explain how to install "
                "and configure Codex CLI with Azure OpenAI or OpenAI, how to use it effectively with this "
                "repository, and provide example commands tailored to this repository's structure."
            ),
            "sreagent": (
                "Focus on how to set up SREAgent for this repository. Explain how to configure "
                "SREAgent in an Azure environment, how to connect it with this repository, "
                "and recommend monitoring metrics and alert policies based on this repository's "
                "structure and purpose."
            )
        }
        # Support legacy IDs for backward compatibility
        legacy_map = {
            'github-copilot': 'github-copilot-completions',
        }
        lookup_id = legacy_map.get(agent_id, agent_id)
        if lookup_id in agent_specific_instructions:
            return base_instructions + "\n\n" + agent_specific_instructions[lookup_id]
        return base_instructions
