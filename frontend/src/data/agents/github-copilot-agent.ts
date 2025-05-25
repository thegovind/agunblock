import { Agent } from '../../types/agent';

const githubCopilotAgent: Agent = {
  id: 'github-copilot-agent',
  name: 'GitHub Copilot Coding Agent',
  description:
    'Autonomous coding agent embedded in GitHub that works independently on issues. Uses GitHub Actions compute environment to fix bugs, implement features, improve test coverage, and update documentation. Pushes commits to draft PRs and iterates based on feedback.',
  provider: 'GitHub (Microsoft)',
  category: 'async-swe',
  url: 'https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/',
  logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
  getStarted: 'Enable Copilot Agent in repository settings, then assign GitHub issues to Copilot.',
  strengths: [
    'Autonomous GitHub issue completion',
    'GitHub Actions secure environment',
    'Real-time progress tracking',
    'PR review iteration',
    'Vision model support',
    'Branch protection compliance',
    'Custom repository instructions',
    'Model Context Protocol (MCP) extensibility',
  ],
  integration: 'GitHub Issues & Pull Requests',
  prerequisites: [
    'GitHub Copilot Pro+ or Enterprise subscription',
    'Repository with write access permissions',
    'Organization/enterprise admin enablement',
    'Repository-specific agent enablement'
  ],
  setupSteps: [
    {
      title: 'Subscribe to GitHub Copilot Pro+ or Enterprise',
      description: 'Ensure you have an active subscription. Starting June 4, 2025, the agent uses premium requests.',
      links: [
        { text: 'Copilot Plans', url: 'https://github.com/features/copilot' },
        { text: 'Enterprise Features', url: 'https://docs.github.com/en/enterprise-cloud@latest/copilot' }
      ]
    },
    {
      title: 'Enable Organization/Enterprise Policy',
      description: 'Organization or enterprise admin must enable Copilot coding agent policy in settings.',
      links: [
        { text: 'Enterprise Setup Guide', url: 'https://docs.github.com/en/enterprise-cloud@latest/copilot/using-github-copilot/coding-agent/enabling-copilot-coding-agent' },
        { text: 'Organization Settings', url: 'https://github.com/settings/organizations' }
      ]
    },
    {
      title: 'Enable Agent for Repositories',
      description: 'Enable Copilot coding agent for specific repositories where you want to use it.',
      links: [
        { text: 'Repository Enablement Guide', url: 'https://docs.github.com/en/enterprise-cloud@latest/copilot/using-github-copilot/coding-agent/enabling-copilot-coding-agent' }
      ]
    },
    {
      title: 'Create Well-Scoped Issues',
      description: 'Write clear issues with complete acceptance criteria, problem descriptions, and file directions for best results.',
      links: [
        { text: 'Best Practices Guide', url: 'https://docs.github.com/en/enterprise-cloud@latest/copilot/using-github-copilot/coding-agent/best-practices-for-using-copilot-to-work-on-tasks' }
      ]
    },
    {
      title: 'Add Custom Repository Instructions (Optional)',
      description: 'Create .github/copilot-instructions.md with project-specific guidelines, build/test commands, and coding standards.',
      links: [
        { text: 'Custom Instructions Guide', url: 'https://docs.github.com/en/enterprise-cloud@latest/copilot/using-github-copilot/coding-agent/best-practices-for-using-copilot-to-work-on-tasks#adding-custom-instructions-to-your-repository' }
      ]
    },
    {
      title: 'Assign Issues to Copilot',
      description: 'Assign issues to "Copilot" from the assignees menu. Copilot will add 👀 reaction and start working in background.'
    }
  ],
  useCases: [
    'Low-to-medium complexity feature development',
    'Bug fixes with clear reproduction steps',
    'Improving test coverage and writing unit tests',
    'Documentation updates and improvements',
    'Code refactoring and technical debt reduction',
    'Accessibility improvements',
    'UI/UX feature implementations',
    'API integration and endpoint development',
    'Database schema updates',
    'Cross-repo changes (limited support)',
  ],
  bestFor: [
    'Well-tested codebases with clear structure',
    'Teams with established coding standards',
    'Projects with comprehensive documentation',
    'Repositories with good CI/CD pipelines',
    'Organizations prioritizing security compliance',
    'Teams managing large backlogs of smaller tasks',
    'Projects requiring consistent code quality',
    'Development workflows emphasizing code review'
  ]
};

export default githubCopilotAgent;
