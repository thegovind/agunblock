import ghCopilotLogo from '../assets/gh-copilot-logo.png';
import codingAgentLogo from '../assets/coding-agent-logo.png';
import devinLogo from '../assets/devin-logo.png';
import openaiLogo from '../assets/openai-logo.png';
import sreAgentLogo from '../assets/sre-agent-logo.png';

/**
 * Helper function to get agent logo based on agent ID
 */
export const getAgentLogo = (agentId: string): string => {
  switch (agentId) {
    case 'github-copilot-completions':
      return ghCopilotLogo;
    case 'github-copilot-agent':
      return codingAgentLogo;
    case 'devin':
      return devinLogo;
    case 'codex-cli':
      return openaiLogo;
    case 'sreagent':
      return sreAgentLogo;
    default:
      return ghCopilotLogo; // fallback logo
  }
};
