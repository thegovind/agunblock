import { Agent } from '../../types/agent';

const devin: Agent = {
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
};

export default devin;
