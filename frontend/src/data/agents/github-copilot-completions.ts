import { Agent } from '../../types/agent';

const githubCopilotCompletions: Agent = {
  id: 'github-copilot-completions',
  name: 'GitHub Copilot (Code Completions)',
  description:
    'AI pair programmer that provides code suggestions directly in your editor as you type. Offers inline completions, Next Edit Suggestions (NES), and Agent Mode for autonomous multi-file editing with natural language task specification.',
  provider: 'GitHub (Microsoft)',
  category: 'code-completion',
  url: 'https://github.com/features/copilot',
  logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
  getStarted: 'Install the GitHub Copilot extension and sign in with your GitHub account. Free plan available with monthly limits.',
  strengths: [
    'Real-time inline code suggestions',
    'Next Edit Suggestions (NES) for predictive editing',
    'Agent Mode for autonomous multi-file editing',
    'Natural language task specification and planning',
    'Alternative suggestion options',
    'Partial acceptance with Ctrl+Right',
    'Comment-to-code generation',
    'Context-aware completions from open files',
    'Tool invocation and terminal command execution',
    'Self-healing through iterative improvements',
    'Supports 40+ programming languages',
    'Deep IDE integration (VS Code, JetBrains, etc.)',
  ],
  integration: 'IDE Extension',
  prerequisites: [
    'GitHub account (free or paid plan)',
    'Compatible IDE (VS Code 1.99+ for Agent Mode, JetBrains IDEs, Neovim, etc.)',
    'Internet connection for API access'
  ],
  setupSteps: [
    {
      title: 'Sign up for GitHub Copilot',
      description: 'Sign up for the free plan (monthly limits) or subscribe to Copilot Individual/Business for unlimited usage.',
      links: [
        { text: 'GitHub Copilot Free Plan', url: 'https://github.com/features/copilot' },
        { text: 'Copilot Pricing', url: 'https://github.com/features/copilot#pricing' }
      ]
    },
    {
      title: 'Install GitHub Copilot Extension',
      description: 'Install the GitHub Copilot extension in VS Code or the plugin for your preferred IDE.',
      links: [
        { text: 'VS Code Extension', url: 'https://marketplace.visualstudio.com/items?itemName=GitHub.copilot' },
        { text: 'JetBrains Plugin', url: 'https://plugins.jetbrains.com/plugin/17718-github-copilot' }
      ]
    },
    {
      title: 'Authenticate with GitHub',
      description: 'Sign in to your GitHub account when prompted by the extension. The extension will guide you through the authentication process.'
    },
    {
      title: 'Enable Agent Mode (VS Code 1.99+)',
      description: 'For VS Code users, enable the "chat.agent.enabled" setting to unlock Agent Mode for autonomous multi-file editing with natural language prompts.',
      links: [
        { text: 'Agent Mode Guide', url: 'https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode' }
      ]
    },
    {
      title: 'Enable Next Edit Suggestions (Optional)',
      description: 'For VS Code users, enable the "github.copilot.nextEditSuggestions.enabled" setting for predictive editing that suggests your next code changes.',
      links: [
        { text: 'Next Edit Suggestions Guide', url: 'https://code.visualstudio.com/docs/copilot/ai-powered-suggestions#_next-edit-suggestions' }
      ]
    },
    {
      title: 'Configure Settings',
      description: 'Customize Copilot behavior, including suggestion display, keyboard shortcuts, agent mode settings, and language-specific preferences through your IDE.'
    }
  ],
  useCases: [
    'Writing boilerplate code and repetitive patterns',
    'Multi-file refactoring and code restructuring',
    'High-level feature implementation across multiple files',
    'Learning new APIs and frameworks through suggestions',
    'Exploring alternative implementations and approaches',
    'Converting comments to code implementations',
    'Catching typos and fixing simple coding mistakes',
    'Automated testing and build task execution',
    'Complex codebase modifications with natural language',
    'Cross-repo coordination (limited context)',
  ],
  bestFor: [
    'Individual developers and teams',
    'Rapid prototyping and development',
    'Learning new programming languages',
    'Routine coding tasks and boilerplate generation',
    'Complex multi-file development tasks',
    'Projects requiring autonomous code planning',
    'Teams needing AI-assisted refactoring',
    'Projects with good context from open files'
  ]
};

export default githubCopilotCompletions;
