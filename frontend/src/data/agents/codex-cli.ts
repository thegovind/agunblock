import { Agent } from '../../types/agent';

const codexCli: Agent = {
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
};

export default codexCli;
