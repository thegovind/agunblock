export interface SetupStep {
  title: string;
  description: string;
  links?: { text: string; url: string }[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: 'code-completion' | 'async-swe' | 'cli' | 'devops';
  url: string;
  logo: string;
  getStarted: string;
  strengths: string[];
  integration: string;
  prerequisites?: string[];
  setupSteps?: SetupStep[];
  useCases?: string[];
  bestFor?: string[];
}

export type AgentCategory = 'all' | 'code-completion' | 'async-swe' | 'cli' | 'devops';
