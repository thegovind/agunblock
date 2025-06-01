import { Agent } from '../../types/agent';

const devin: Agent = {
  id: 'devin',
  name: 'Cognition Devin',
  description:
    'Your collaborative AI teammate that can write, run and test code. Devin excels at handling small tasks in parallel, code migrations, PR reviews, and building integrations before they hit your backlog.',
  provider: 'Microsoft',
  category: 'async-swe',
  url: 'https://aka.ms/devin',
  logo: 'https://cognition.ai/images/devin-logo.svg',
  getStarted: 'Available via Azure Marketplace deployment.',
  strengths: [
    'Tackles many small tasks in parallel before they hit your backlog',
    'Code migrations and framework upgrades (JS to TS, Angular 16→18)',
    'PR reviews, unit tests, and reproducing bugs',
    'Building integrations with unfamiliar APIs and internal tools',
    'Embedded VS Code IDE with real-time collaboration',
    'Conversational interface with browser automation',
    'GitHub, Slack, and Jira integrations',
    'DeepWiki codebase analysis and documentation',
    'Continuous learning from codebase patterns',
  ],
  integration: 'Azure Marketplace',
  prerequisites: [
    'Azure subscription with appropriate permissions',
    'GitHub repository with appropriate permissions',
    'Understanding that Devin works best on junior engineer level tasks'
  ],
  setupSteps: [
    {
      title: 'Deploy Devin from Azure Marketplace',
      description: 'Navigate to Azure Marketplace and deploy Devin to your Azure subscription.',
      links: [
        { text: 'Azure Marketplace', url: 'https://aka.ms/devin' }
      ]
    },
    {
      title: 'Setup Devin for Enterprise',
      description: 'Learn about enterprise use cases and best practices for using Devin effectively at scale. Understanding how to slice work into isolated, repetitive subtasks is crucial for maximizing ROI.',
      links: [
        { text: 'Enterprise Use Cases Guide', url: 'https://docs.devin.ai/enterprise/use-cases/guide' }
      ]
    },
    {
      title: 'Configure GitHub Integration',
      description: 'Connect your GitHub account to Devin to enable repository access and code changes.',
      links: [
        { text: 'Devin GitHub Integration Guide', url: 'https://docs.devin.ai/integrations/github-integration-guide' },
        { text: 'GitHub Settings', url: 'https://github.com/settings/applications' }
      ]
    },
    {
      title: 'Set up New Repository',
      description: 'For a new repo, go to Devin\'s Workspace after deployment. Click on "+ From Template" to create a new project from a template. You\'ll be guided to first create a repo in GitHub and then select it in Devin.',
      links: [
        { text: 'Devin Workspace', url: 'https://app.devin.ai/workspace' },
        { text: 'Video Guide', url: 'https://www.youtube.com/watch?v=fgSzneNlpZs' },
        { text: 'Setup Documentation', url: 'https://docs.devin.ai/onboard-devin/repo-setup' }
      ]
    },
    {
      title: 'Choose Project Type',
      description: 'Select the type of project you want to create (Frontend, Backend, or Fullstack). Devin will set up the repository with the appropriate dependencies and configuration.',
    },
    {
      title: 'Configure Devin\'s Machine',
      description: 'Complete the setup process by configuring Devin\'s Machine for your project. This will enable Devin to work effectively with your codebase.'
    },
    {
      title: 'Connect Integrations',
      description: 'Connect Devin with GitHub, Slack, Jira, and enable DeepWiki for enhanced codebase analysis and DeepSearch for semantic code search.',
      links: [
        { text: 'DeepWiki Integration', url: 'https://deepwiki.com' }
      ]
    }
  ],
  useCases: [
    'Targeted refactors and small feature requests',
    'Improving test coverage and writing unit tests',
    'Investigating and fixing CI failures',
    'Language migrations (JavaScript to TypeScript)',
    'Framework upgrades (Angular 16 → 18)',
    'PR reviews and codebase Q&A with DeepWiki',
    'Building integrations with unfamiliar APIs',
    'Creating prototypes and internal tools',
    'Cross-repo dependency management',
    'Multi-repository refactoring projects',
  ],
  bestFor: [
    'Junior engineer level complexity tasks',
    'Tasks that are quick to verify (CI passes, deployments)',
    'Smaller, clearly scoped development tasks',
    'Teams wanting to prevent small tasks from hitting their backlog',
    'Collaborative development with embedded IDE takeover'
  ]
};

export default devin;
