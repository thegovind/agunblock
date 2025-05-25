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
}

export type AgentCategory = 'all' | 'code-completion' | 'async-swe' | 'cli' | 'devops';
