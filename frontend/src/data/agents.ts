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
    prerequisites: [
      'GitHub account with active subscription',
      'Compatible IDE (VS Code, JetBrains, etc.)',
      'Internet connection for API access'
    ],
    setupSteps: [
      {
        title: 'Sign up for GitHub Copilot',
        description: 'Visit the GitHub Copilot website and sign up for a subscription or start a free trial.',
        links: [
          { text: 'GitHub Copilot Subscription', url: 'https://github.com/features/copilot' }
        ]
      },
      {
        title: 'Install IDE Extension',
        description: 'Install the GitHub Copilot extension in your preferred IDE (VS Code, JetBrains, etc.).',
        links: [
          { text: 'VS Code Extension', url: 'https://marketplace.visualstudio.com/items?itemName=GitHub.copilot' },
          { text: 'JetBrains Plugin', url: 'https://plugins.jetbrains.com/plugin/17718-github-copilot' }
        ]
      },
      {
        title: 'Authenticate with GitHub',
        description: 'Sign in to your GitHub account when prompted by the extension to authenticate and activate Copilot.'
      },
      {
        title: 'Configure Settings',
        description: 'Adjust Copilot settings in your IDE to customize suggestion behavior and keyboard shortcuts.'
      }
    ],
    useCases: [
      'Writing boilerplate code quickly',
      'Learning new APIs and frameworks',
      'Exploring alternative implementations',
      'Documenting existing code'
    ],
    bestFor: [
      'Individual developers',
      'Rapid prototyping',
      'Learning new languages',
      'Routine coding tasks'
    ]
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
    prerequisites: [
      'GitHub account with Copilot Enterprise subscription',
      'Repository with appropriate permissions',
      'Well-defined issues with clear requirements'
    ],
    setupSteps: [
      {
        title: 'Subscribe to GitHub Copilot Enterprise',
        description: 'Ensure your organization has a GitHub Copilot Enterprise subscription.',
        links: [
          { text: 'Copilot Enterprise', url: 'https://github.com/features/copilot' }
        ]
      },
      {
        title: 'Enable Copilot Agent for your organization',
        description: 'Organization admin must enable Copilot Agent in the organization settings.',
        links: [
          { text: 'Organization Settings', url: 'https://github.com/settings/organizations' }
        ]
      },
      {
        title: 'Configure repository settings',
        description: 'Enable Copilot Agent for specific repositories in repository settings.',
        links: [
          { text: 'Repository Settings', url: 'https://github.com/settings/repositories' }
        ]
      },
      {
        title: 'Create well-defined issues',
        description: 'Create issues with clear requirements, acceptance criteria, and context for the agent to work with.'
      },
      {
        title: 'Assign issues to Copilot Agent',
        description: 'Assign the issue to the Copilot Agent user in your repository to trigger automated development.'
      }
    ],
    useCases: [
      'Automating feature development',
      'Fixing bugs with clear reproduction steps',
      'Refactoring code based on specifications',
      'Implementing standard patterns across codebase'
    ],
    bestFor: [
      'Teams with well-defined processes',
      'Repositories with good test coverage',
      'Routine feature implementation',
      'Organizations with clear coding standards'
    ]
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
    prerequisites: [
      'Azure subscription with appropriate permissions',
      'Devin account (sign up at aka.ms/devin)',
      'GitHub repository with appropriate permissions',
      'Basic understanding of Azure services'
    ],
    setupSteps: [
      {
        title: 'Sign up for Devin',
        description: 'Visit the Devin website and create an account to access the service.',
        links: [
          { text: 'Devin Signup', url: 'https://aka.ms/devin' }
        ]
      },
      {
        title: 'Deploy Devin from Azure Marketplace',
        description: 'Navigate to Azure Marketplace and deploy Devin to your Azure subscription.',
        links: [
          { text: 'Azure Marketplace', url: 'https://azuremarketplace.microsoft.com/' }
        ]
      },
      {
        title: 'Configure GitHub Integration',
        description: 'Connect your GitHub account to Devin to enable repository access and code changes.',
        links: [
          { text: 'GitHub Settings', url: 'https://github.com/settings/applications' }
        ]
      },
      {
        title: 'Set up project workspace',
        description: 'Create a new project in Devin and connect it to your GitHub repository.'
      },
      {
        title: 'Define development tasks',
        description: 'Create tasks for Devin to work on, with clear requirements and acceptance criteria.'
      }
    ],
    useCases: [
      'Complex feature development',
      'Debugging difficult issues',
      'System architecture design',
      'End-to-end project implementation'
    ],
    bestFor: [
      'Complex problem solving',
      'Projects requiring deep reasoning',
      'Multi-step development tasks',
      'Teams needing autonomous development'
    ]
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
    prerequisites: [
      'Azure AI Foundry account (ai.azure.com)',
      'Deployed models in Azure AI Foundry',
      'Python environment (3.7+)',
      'API access credentials'
    ],
    setupSteps: [
      {
        title: 'Deploy models in Azure AI Foundry',
        description: 'Visit Azure AI Foundry and deploy the necessary models for Codex CLI.',
        links: [
          { text: 'Azure AI Foundry', url: 'https://ai.azure.com' }
        ]
      },
      {
        title: 'Install Codex CLI',
        description: 'Install the Codex CLI package using pip in your Python environment.',
        links: [
          { text: 'Codex CLI Repository', url: 'https://github.com/openai/codex' }
        ]
      },
      {
        title: 'Configure API credentials',
        description: 'Set up environment variables with your Azure OpenAI API key and endpoint.',
        links: [
          { text: 'API Configuration Guide', url: 'https://github.com/openai/codex?tab=readme-ov-file#environment-variables-setup' }
        ]
      },
      {
        title: 'Set up local repository',
        description: 'Initialize Codex CLI in your local repository to enable code generation features.'
      },
      {
        title: 'Test the installation',
        description: 'Run a simple code generation command to verify that Codex CLI is working correctly.'
      }
    ],
    useCases: [
      'Generating code from natural language',
      'Converting between programming languages',
      'Explaining complex code',
      'Automating routine coding tasks'
    ],
    bestFor: [
      'Command-line enthusiasts',
      'Developers working across languages',
      'Automation-focused workflows',
      'Quick code generation tasks'
    ]
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
    prerequisites: [
      'Azure subscription',
      'Azure App Service plan (Premium v3 or higher)',
      'Application deployed to App Service',
      'Appropriate Azure RBAC permissions'
    ],
    setupSteps: [
      {
        title: 'Ensure eligible App Service plan',
        description: 'Verify that your App Service is running on a Premium v3 or higher plan.',
        links: [
          { text: 'App Service Plans', url: 'https://azure.microsoft.com/en-us/pricing/details/app-service/windows/' }
        ]
      },
      {
        title: 'Enable SREAgent in App Service',
        description: 'Navigate to your App Service in the Azure portal and enable SREAgent in the settings.',
        links: [
          { text: 'SREAgent Documentation', url: 'https://learn.microsoft.com/en-us/azure/app-service/sre-agent-overview' }
        ]
      },
      {
        title: 'Configure monitoring settings',
        description: 'Set up monitoring thresholds and alerts for SREAgent to respond to.',
        links: [
          { text: 'Azure Monitor', url: 'https://azure.microsoft.com/en-us/services/monitor/' }
        ]
      },
      {
        title: 'Define remediation policies',
        description: 'Configure automated remediation policies for common issues detected by SREAgent.'
      },
      {
        title: 'Connect repository for monitoring',
        description: 'Link your code repository to enable SREAgent to analyze code-related performance issues.'
      }
    ],
    useCases: [
      'Automated incident response',
      'Performance monitoring and optimization',
      'Proactive system maintenance',
      'Resource scaling recommendations'
    ],
    bestFor: [
      'Azure-hosted applications',
      'Teams with limited DevOps resources',
      'Applications requiring high reliability',
      'Systems with fluctuating load patterns'
    ]
  },
];

export default agents;
