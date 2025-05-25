import React from 'react';
import Modal from './Modal';
import { Agent } from '../../types/agent';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, agent }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Setup Guide: ${agent.name}`}
    >
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
    </Modal>
  );
};

export default SetupModal;
