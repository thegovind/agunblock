import { Agent } from '../types/agent';

const agents: Agent[] = [
  {
    id: 'github-copilot-completions',
    name: 'GitHub Copilot (Code Completions)',
    description:
      'AI pair programmer that suggests code completions as you type in your IDE. Available for VS Code, JetBrains, and more.',
    provider: 'GitHub (Microsoft)',
    category: 'code-completion',
    url: 'https://github.com/features/copilot',
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
    getStarted: 'Enable in your IDE via the GitHub Copilot extension.',
    strengths: [
      'Real-time code suggestions',
      'Context-aware completions',
      'Supports multiple languages',
      'IDE integration',
    ],
    integration: 'IDE plugin',
  },
  {
    id: 'github-copilot-agent',
    name: 'GitHub Copilot Coding Agent',
    description:
      'Asynchronous agent that autonomously completes GitHub Issues by creating pull requests, running CI/CD, and iterating on feedback. Assign issues to the agent to automate feature additions, bug fixes, refactoring, and more.',
    provider: 'GitHub (Microsoft)',
    category: 'async-swe',
    url: 'https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/',
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
    getStarted: 'Assign issues to Copilot Agent in your GitHub repository.',
    strengths: [
      'Automated PRs',
      'CI/CD integration',
      'Issue-driven automation',
      'Iterative code improvement',
    ],
    integration: 'GitHub Issues & PRs',
  },
  {
    id: 'devin',
    name: 'Devin',
    description:
      'An autonomous AI software engineer, available via Azure Marketplace, that can plan and execute complex tasks across the SDLC.',
    provider: 'Microsoft',
    category: 'async-swe',
    url: 'https://aka.ms/devin',
    logo: 'https://cognition.ai/images/devin-logo.svg',
    getStarted: 'Available via Azure Marketplace.',
    strengths: [
      'End-to-end development',
      'Autonomous problem solving',
      'Complex reasoning',
      'Multi-step planning',
    ],
    integration: 'Azure Marketplace',
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description:
      'Command-line interface for code generation using natural language, compatible with both OpenAI and Azure OpenAI endpoints.',
    provider: 'OpenAI',
    category: 'cli',
    url: 'https://github.com/openai/codex?tab=readme-ov-file#environment-variables-setup',
    logo: 'https://openai.com/content/images/2021/08/codex-1.jpg',
    getStarted: 'Install via pip and configure with your OpenAI or Azure OpenAI API key.',
    strengths: [
      'Command-line integration',
      'Code generation from comments',
      'API understanding',
      'Language translation',
    ],
    integration: 'OpenAI & Azure OpenAI',
  },
  {
    id: 'sreagent',
    name: 'SREAgent',
    description:
      'Microsoft\'s AI agent for Site Reliability Engineering tasks, integrated with Azure App Service. Helps maintain system reliability and performance.',
    provider: 'Microsoft',
    category: 'devops',
    url: 'https://learn.microsoft.com/en-us/azure/app-service/sre-agent-overview',
    logo: 'https://azure.microsoft.com/images/product-logos/sreagent.svg',
    getStarted: 'Available directly in Azure App Service.',
    strengths: [
      'Incident response',
      'Performance optimization',
      'System monitoring',
      'Automated remediation',
    ],
    integration: 'Azure App Service',
  },
];

export default agents;
