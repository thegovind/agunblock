import React from 'react';
import { Agent } from '../types/agent';
import { getAgentLogo } from '../utils/agentUtils';

interface AgentCardProps {
  agent: Agent;
  showAnalyzeButton?: boolean;
  repoName?: string;
  onAnalyzeClick?: (agentId: string, repoName: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  showAnalyzeButton = false, 
  repoName = '', 
  onAnalyzeClick 
}) => {
  return (
    <div className="agent-card" data-category={agent.category}>
      <div className="agent-header">
        <div className="agent-icon">
          <img 
            src={getAgentLogo(agent.id)} 
            alt={`${agent.name} logo`}
            className="agent-logo"
          />
        </div>
        <div className="agent-info">
          <h3>{agent.name}</h3>
          <div className="agent-type">
            {agent.category === 'code-completion'
              ? 'Code Completion Agent'
              : agent.category === 'async-swe'
              ? 'Async SWE Agent'
              : agent.category === 'cli'
              ? 'CLI Tool'
              : 'DevOps Agent'}
          </div>
        </div>
      </div>

      <p className="agent-description">{agent.description}</p>

      {!showAnalyzeButton ? (
        <ul className="agent-features">
          {agent.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : (
        <ul className="agent-features">
          <li>How to use with {repoName}:</li>
          {agent.id === 'github-copilot-agent' && (
            <>
              <li>Assign issues to Copilot Agent in your GitHub repository</li>
              <li>Automate feature additions, bug fixes, refactoring, and more</li>
            </>
          )}
          {agent.id === 'devin' && (
            <>
              <li>Access Devin through Azure marketplace</li>
              <li>Clone this repository using git</li>
              <li>Ask Devin to analyze and work with your codebase</li>
            </>
          )}
          {agent.id === 'codex-cli' && (
            <>
              <li>Set up Azure OpenAI Service with Codex</li>
              <li>Clone this repository locally</li>
              <li>Use the Codex CLI to generate code or assist with tasks</li>
            </>
          )}
          {agent.id === 'claude-code' && (
            <>
              <li>Access Claude Code through Azure OpenAI Service</li>
              <li>Share repository code with Claude</li>
              <li>
                Ask for code explanations or refactoring suggestions
              </li>
            </>
          )}
          {agent.id === 'sreagent' && (
            <>
              <li>Set up SREAgent in your Azure environment</li>
              <li>Connect your repository for monitoring</li>
              <li>
                Configure alerts and automated remediation policies
              </li>
            </>
          )}
        </ul>
      )}

      <div className="agent-actions">
        <a 
          href={agent.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="agent-btn primary"
        >
          Get Started
        </a>
        <a href="#" className="agent-btn secondary">
          Learn More
        </a>
        {showAnalyzeButton && onAnalyzeClick && (
          <button
            className="agent-btn secondary"
            onClick={() => onAnalyzeClick(agent.id, repoName)}
          >
            Analyze Repository
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentCard;
