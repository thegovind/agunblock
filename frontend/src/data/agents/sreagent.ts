import { Agent } from '../../types/agent';

const sreAgent: Agent = {
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
};

export default sreAgent;
