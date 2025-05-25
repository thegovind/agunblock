import React from 'react';
import { Agent } from '../../types/agent';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, agent }) => {
  if (!isOpen) return null;

  const showDevinScreenshots = agent.id === 'devin';

  return (
    <div className="fullscreen-modal-overlay">
      <div className="fullscreen-modal-container">
        <div className="fullscreen-modal-header">
          <div className="fullscreen-modal-logo">
            <img src="/agunblock-logo.svg" alt="AGUnblock Logo" className="modal-logo" />
          </div>
          <h2 className="fullscreen-modal-title">Setup Guide: {agent.name}</h2>
          <button className="fullscreen-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="fullscreen-modal-content">
          <div className="setup-modal-content">
            {agent.prerequisites && agent.prerequisites.length > 0 && (
              <div className="setup-section">
                <h3 className="setup-section-title">Prerequisites</h3>
                <ul className="setup-prerequisites">
                  {agent.prerequisites.map((prereq, index) => (
                    <li key={index} className="setup-prerequisite-item">
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {agent.setupSteps && agent.setupSteps.length > 0 && (
              <div className="setup-section">
                <h3 className="setup-section-title">Setup Steps</h3>
                <div className="setup-steps">
                  {agent.setupSteps.map((step, index) => (
                    <div key={index} className="setup-step">
                      <div className="setup-step-number">{index + 1}</div>
                      <div className="setup-step-content">
                        <h4 className="setup-step-title">{step.title}</h4>
                        <p className="setup-step-description">{step.description}</p>
                        
                        {/* Show Devin screenshots for specific steps */}
                        {showDevinScreenshots && step.title === 'Set up New Repository' && (
                          <div className="setup-step-screenshots">
                            <div className="screenshot-container">
                              <img 
                                src="/devin-template-button.png" 
                                alt="Devin From Template Button" 
                                className="setup-screenshot"
                              />
                              <p className="screenshot-caption">Click on "+ From Template" to create a new project</p>
                            </div>
                          </div>
                        )}
                        
                        {showDevinScreenshots && step.title === 'Choose Project Type' && (
                          <div className="setup-step-screenshots">
                            <div className="screenshot-container">
                              <img 
                                src="/devin-project-types.png" 
                                alt="Devin Project Types" 
                                className="setup-screenshot"
                              />
                              <p className="screenshot-caption">Select Frontend, Backend, or Fullstack project type</p>
                            </div>
                          </div>
                        )}
                        
                        {step.links && step.links.length > 0 && (
                          <div className="setup-step-links">
                            {step.links.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="setup-link"
                              >
                                {link.text} <span className="external-link-icon">↗</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="setup-actions">
              <button className="setup-btn primary" onClick={onClose}>
                Got it
              </button>
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="setup-btn secondary"
              >
                Visit Official Site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;
