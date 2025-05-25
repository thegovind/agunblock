import { Agent } from '../../types/agent';

const githubCopilotCompletions: Agent = {
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
};

export default githubCopilotCompletions;
