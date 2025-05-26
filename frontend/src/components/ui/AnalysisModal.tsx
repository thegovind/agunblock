import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useStreamingAnalysis } from '../../hooks/useStreamingAnalysis';
import MarkdownRenderer from './MarkdownRenderer';

// Note: These interfaces are defined in the hook, keeping here for reference
// interface AnalysisProgressUpdate {
//   step: number;
//   step_name: string;
//   status: 'starting' | 'in_progress' | 'completed' | 'failed';
//   message: string;
//   progress_percentage: number;
//   elapsed_time?: number;
//   details?: Record<string, any>;
// }

// interface AnalysisResults {
//   agentId: string;
//   repoName: string;
//   analysis: string;
//   setupCommands?: {
//     prerequisites: string;
//     dependencies: string;
//     run_app: string;
//     linting: string;
//     testing: string;
//   };
// }

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  repoName: string;
  agentId: string;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  agentName,
  repoName,
  agentId
}) => {
  const {
    isAnalyzing,
    progress,
    currentStep,
    progressUpdates,
    results,
    error,
    startAnalysis,
    // reset - currently unused
  } = useStreamingAnalysis();
  
  const [startTime, setStartTime] = useState<Date | null>(null);

  const steps = [
    {
      id: 1,
      name: "Analyzing Repository Content",
      description: "Azure AI Agents analyzes README and repository structure",
      icon: <Loader2 className="w-5 h-5" />
    },
    {
      id: 2,
      name: "Identifying Configuration Files",
      description: "Scanning for important configuration and dependency files",
      icon: <Loader2 className="w-5 h-5" />
    },
    {
      id: 3,
      name: "Extracting Setup Instructions",
      description: "Generating tailored setup commands and instructions",
      icon: <Loader2 className="w-5 h-5" />
    }
  ];

  const handleStartAnalysis = async () => {
    setStartTime(new Date());
    const [owner, repo] = repoName.split('/');
    await startAnalysis(agentId, owner, repo);
  };

  const getStepStatus = (stepId: number) => {
    const stepUpdates = progressUpdates.filter(u => u.step === stepId);
    if (stepUpdates.length === 0) {
      return currentStep > stepId ? 'completed' : currentStep === stepId ? 'in_progress' : 'pending';
    }
    const latestUpdate = stepUpdates[stepUpdates.length - 1];
    return latestUpdate.status;
  };

  const getStepIcon = (stepId: number) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'completed':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
        );
      case 'in_progress':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--elegant-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(55, 65, 81, 0.3)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}>
            <Loader2 style={{ width: '18px', height: '18px', color: 'white' }} className="animate-spin" />
          </div>
        );
      case 'failed':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
        );
      default:
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid var(--border-color)',
            background: 'var(--card-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {stepId}
          </div>
        );
    }
  };

  const getCurrentMessage = () => {
    if (progressUpdates.length === 0) return "Preparing to analyze...";
    const latest = progressUpdates[progressUpdates.length - 1];
    return latest.message;
  };

  const getElapsedTime = () => {
    if (!startTime) return "0s";
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return `${elapsed}s`;
  };

  const formatDuration = (seconds: number) => {
    return seconds < 60 ? `${seconds.toFixed(1)}s` : `${(seconds / 60).toFixed(1)}m`;
  };

  if (!isOpen) return null;

  // Add keyframes for pulse animation
  React.useEffect(() => {
    const styleId = 'analysis-modal-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const modal = (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: results ? '90vw' : '800px', width: results ? '90vw' : 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            Setup {repoName} for {agentName}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {/* Experimental Notice */}
          <div className="experimental-notice" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="experimental-badge">
                EXPERIMENTAL
              </div>
              <span className="experimental-title">
                Powered by Azure AI Foundry Agent Service
              </span>
            </div>
            <p className="experimental-description">
              This AI agent analysis feature is currently experimental and under active development. 
              <strong> Coming soon:</strong> Repository indexing and caching capabilities for faster analysis and improved results.
            </p>
          </div>

          {!isAnalyzing && !results && !error && (
            <div className="analysis-start">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'var(--elegant-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 8px 24px rgba(55, 65, 81, 0.3)'
                }}>
                  <Loader2 style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>
                  Ready to Analyze Repository
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: '2rem',
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}>
                  This will analyze <strong>{repoName}</strong> and generate tailored setup instructions for <strong>{agentName}</strong>.
                  The process involves 3 main steps and typically takes 30-60 seconds.
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '2rem' 
                }}>
                  {steps.map(step => (
                    <div key={step.id} style={{ 
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'var(--elegant-primary)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '700',
                          boxShadow: '0 6px 16px rgba(55, 65, 81, 0.4)',
                          transition: 'transform 0.2s ease'
                        }}>
                          {step.id}
                        </div>
                        <h4 style={{ 
                          fontWeight: '600', 
                          color: 'var(--text-primary)',
                          fontSize: '1rem',
                          margin: '0 0 0.5rem 0',
                          lineHeight: '1.3'
                        }}>
                          {step.name}
                        </h4>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--text-secondary)',
                          lineHeight: '1.5',
                          margin: 0,
                          maxWidth: '200px'
                        }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleStartAnalysis}
                  className="agent-btn primary"
                  style={{ 
                    fontSize: '1rem',
                    padding: '0.875rem 2rem',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  Start Analysis
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="analysis-progress">
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1rem' 
                }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    Analyzing Repository
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)' 
                  }}>
                    <Clock style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
                    {getElapsedTime()}
                  </div>
                </div>
                
                <div style={{ 
                  width: '100%', 
                  backgroundColor: 'var(--border-color)', 
                  borderRadius: '6px', 
                  height: '8px', 
                  marginBottom: '1rem',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      background: 'var(--elegant-primary)',
                      height: '100%',
                      borderRadius: '6px',
                      transition: 'width 0.5s ease',
                      width: `${progress}%`
                    }}
                  />
                </div>
                
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  textAlign: 'center',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  {getCurrentMessage()}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {steps.map(step => {
                  const status = getStepStatus(step.id);
                  const stepUpdates = progressUpdates.filter(u => u.step === step.id);
                  const isActive = currentStep === step.id;
                  
                  let backgroundColor = 'var(--card-bg)';
                  let borderColor = 'var(--border-color)';
                  
                  if (isActive) {
                    backgroundColor = 'rgba(55, 65, 81, 0.05)';
                    borderColor = 'rgba(55, 65, 81, 0.3)';
                  } else if (status === 'completed') {
                    backgroundColor = 'rgba(16, 185, 129, 0.05)';
                    borderColor = 'rgba(16, 185, 129, 0.3)';
                  } else if (status === 'failed') {
                    backgroundColor = 'rgba(239, 68, 68, 0.05)';
                    borderColor = 'rgba(239, 68, 68, 0.3)';
                  }
                  
                  return (
                    <div 
                      key={step.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        backgroundColor,
                        border: `1px solid ${borderColor}`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ flexShrink: 0, marginTop: '0.125rem', marginRight: '1rem' }}>
                        {getStepIcon(step.id)}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          marginBottom: '0.5rem' 
                        }}>
                          <h4 style={{ 
                            fontWeight: '600',
                            color: isActive ? 'var(--elegant-secondary)' : 'var(--text-primary)',
                            margin: 0,
                            fontSize: '1rem'
                          }}>
                            {step.name}
                          </h4>
                          {stepUpdates.length > 0 && stepUpdates[stepUpdates.length - 1].elapsed_time && (
                            <span style={{ 
                              fontSize: '0.875rem', 
                              color: 'var(--text-secondary)' 
                            }}>
                              {formatDuration(stepUpdates[stepUpdates.length - 1].elapsed_time!)}
                            </span>
                          )}
                        </div>
                        
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--text-secondary)', 
                          marginBottom: stepUpdates.length > 0 ? '0.75rem' : 0,
                          margin: 0,
                          lineHeight: '1.4',
                          opacity: 0.8
                        }}>
                          {step.description}
                        </p>
                        
                        {stepUpdates.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                            {stepUpdates.slice(-2).map((update, idx) => (
                              <div key={idx} style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--text-primary)', 
                                backgroundColor: 'var(--card-bg)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                              }}>
                                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                  {update.message}
                                </div>
                                {update.details && (
                                  <div style={{ 
                                    marginTop: '0.25rem', 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.7rem'
                                  }}>
                                    {Object.entries(update.details).slice(0, 2).map(([key, value]) => (
                                      <div key={key} style={{ marginBottom: '0.125rem' }}>
                                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value).slice(0, 50) : String(value).slice(0, 50)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {results && (
            <div className="analysis-results">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <CheckCircle style={{ 
                  width: '64px', 
                  height: '64px', 
                  color: '#10b981',
                  margin: '0 auto 1rem auto',
                  display: 'block'
                }} />
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#059669',
                  marginBottom: '0.5rem'
                }}>
                  Analysis Complete!
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Successfully analyzed <strong>{repoName}</strong> for <strong>{agentName}</strong> in {getElapsedTime()}
                </p>
              </div>

              {agentId === 'devin' && (
                <div style={{ 
                  background: 'rgba(55, 65, 81, 0.05)',
                  border: '1px solid rgba(55, 65, 81, 0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h4 style={{ 
                    fontWeight: '600', 
                    marginBottom: '1rem',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    fontSize: '1.25rem'
                  }}>
                    🚀 Next Steps: Get Devin Set Up
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    <a
                      href="https://aka.ms/devin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="setup-link"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: 'var(--card-bg)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(55, 65, 81, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>📦</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', color: 'var(--azure-teal)' }}>Install Devin</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Azure Marketplace</div>
                      </div>
                    </a>
                    
                    <a
                      href="https://app.devin.ai/workspace"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="setup-link"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: 'var(--card-bg)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(55, 65, 81, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🏠</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', color: 'var(--azure-teal)' }}>Devin Workspace</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Add your repo</div>
                      </div>
                    </a>
                    
                    <a
                      href="https://docs.devin.ai/integrations/gh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="setup-link"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: 'var(--card-bg)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(55, 65, 81, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🔗</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', color: 'var(--azure-teal)' }}>GitHub Integration</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Setup guide</div>
                      </div>
                    </a>
                    
                    <a
                      href="https://www.youtube.com/watch?v=fgSzneNlpZs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="setup-link"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: 'var(--card-bg)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(55, 65, 81, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>🎥</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', color: 'var(--azure-teal)' }}>Video Walkthrough</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quick setup guide</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              <div style={{ 
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  color: 'var(--text-primary)'
                }}>
                  Analysis Results
                </h4>
                <div style={{ width: '100%' }}>
                  <MarkdownRenderer 
                    content={results.analysis}
                    style={{
                      background: '#1a1a1a',
                      padding: '2rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      fontSize: '1rem',
                      minHeight: '300px'
                    }}
                  />
                </div>

                {results.setupCommands && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ 
                      fontWeight: '600', 
                      marginBottom: '1rem',
                      color: 'var(--text-primary)'
                    }}>
                      Setup Commands
                    </h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                      gap: '1.5rem' 
                    }}>
                      {Object.entries(results.setupCommands).map(([key, value]) => (
                        <div key={key} style={{ 
                          background: 'var(--card-bg)',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <h5 style={{ 
                            fontWeight: '600', 
                            marginBottom: '0.5rem', 
                            textTransform: 'capitalize',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                          }}>
                            {key.replace('_', ' ')}
                          </h5>
                          <code style={{ 
                            fontSize: '0.8rem',
                            background: '#1a1a1a',
                            color: '#4ade80',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            display: 'block',
                            fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.4'
                          }}>
                            {value}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center' }}>
              <AlertCircle style={{ 
                width: '64px', 
                height: '64px', 
                color: '#ef4444',
                margin: '0 auto 1rem auto',
                display: 'block'
              }} />
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#dc2626',
                marginBottom: '0.5rem'
              }}>
                Analysis Failed
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '1rem' 
              }}>
                An error occurred while analyzing <strong>{repoName}</strong>
              </p>
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'left',
                marginBottom: '1rem'
              }}>
                <code style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</code>
              </div>
              <button 
                onClick={handleStartAnalysis}
                className="agent-btn primary"
                style={{
                  fontSize: '0.95rem',
                  padding: '0.75rem 1.5rem'
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default AnalysisModal; 