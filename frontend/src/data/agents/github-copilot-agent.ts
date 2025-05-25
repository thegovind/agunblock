import { Agent } from '../../types/agent';

const githubCopilotAgent: Agent = {
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
};

export default githubCopilotAgent;
