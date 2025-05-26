import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, ExternalLink, Book, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import agents from '../data/agents';
import AgentCard from './AgentCard';
import Modal from './ui/Modal';
import AnalysisModal from './ui/AnalysisModal';
import MarkdownRenderer from './ui/MarkdownRenderer';

const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    CSharp: '#178600',
    'C#': '#178600',
    C: '#555555',
    'C++': '#f34b7d',
    Go: '#00ADD8',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Rust: '#dea584',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    PowerShell: '#012456',
  };
  
  return colors[language] || '#8257e5'; // Default purple color if language not found
};

interface RepoData {
  org: string;
  repo: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  orgLogoUrl?: string;
  updatedAt?: string;
}

interface AnalysisResults {
  agentId: string;
  repoName: string;
  analysis: string;
  isLoading: boolean;
  setupCommands?: {
    prerequisites: string;
    dependencies: string;
    run_app: string;
    linting: string;
    testing: string;
  };
}

interface LoadingState {
  fetchingRepo: boolean;
  fetchingOrgInfo: boolean;
  analyzingAgents: boolean;
  completed: boolean;
}

const RepoPage: React.FC = () => {
  const { org, repo } = useParams<{ org: string; repo: string }>();

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<LoadingState>({
    fetchingRepo: false,
    fetchingOrgInfo: false,
    analyzingAgents: false,
    completed: false
  });
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, _setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string} | null>(null);
  const [starCount, setStarCount] = useState<number | null>(null);



  /* fetch GitHub star count */
  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/microsoft/agunblock');
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch (error) {
        console.log('Failed to fetch star count:', error);
      }
    };

    fetchStarCount();
  }, []);

  /* fetch real repo data */
  useEffect(() => {
    const fetchRepoData = async () => {
      if (org && repo) {
        try {
          // Reset loading states
          setLoadingStates({
            fetchingRepo: true,
            fetchingOrgInfo: false,
            analyzingAgents: false,
            completed: false
          });

          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          
          // Phase 1: Fetch repository data
          setTimeout(() => {
            setLoadingStates(prev => ({
              ...prev,
              fetchingRepo: false,
              fetchingOrgInfo: true
            }));
          }, 800);

          const response = await fetch(`${apiUrl}/api/repo-info/${org}/${repo}`);
          
          if (response.ok) {
            const data = await response.json();
            
            // Phase 2: Process organization info and start analyzing agents
            setTimeout(() => {
              setLoadingStates(prev => ({
                ...prev,
                fetchingOrgInfo: false,
                analyzingAgents: true
              }));
            }, 600);

            const orgLogoUrl = `https://github.com/${org}.png`;
            const updatedAt = data.updated_at ? new Date(data.updated_at).toLocaleDateString() : undefined;
            
            // Phase 3: Complete repo data loading and finish analysis
            setTimeout(() => {
              setRepoData({
                org,
                repo,
                fullName: data.full_name,
                description: data.description,
                language: data.language,
                stars: data.stars,
                orgLogoUrl,
                updatedAt
              });

              setLoadingStates(prev => ({
                ...prev,
                analyzingAgents: false,
                completed: true
              }));

              setTimeout(() => {
                setLoading(false);
              }, 500);
            }, 1000);

          } else {
            setError('Repository not found or failed to fetch data');
            setLoading(false);
          }
        } catch (err) {
          setError(`Error fetching repository: ${err instanceof Error ? err.message : String(err)}`);
          setLoading(false);
        }
      } else {
        setError('Invalid repository information');
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [org, repo]);

  const openAnalysisModal = (agentId: string, _repoName: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent({ id: agentId, name: agent.name });
      setAnalysisModalOpen(true);
    }
  };

  // Legacy function - currently unused, kept for reference
  // const analyzeRepository = async (agentId: string, repoName: string) => {
  //   setAnalysisResults({ 
  //     agentId, 
  //     repoName, 
  //     analysis: '', 
  //     isLoading: true,
  //     setupCommands: undefined
  //   });
  //   setModalOpen(true);

  //   try {
  //     const [owner, r] = repoName.split('/');
  //     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
  //     console.log(`Starting analysis for ${repoName} with agent ${agentId}...`);
      
  //     const res = await fetch(`${apiUrl}/api/analyze`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ owner, repo: r, agent_id: agentId }),
  //     });
      
  //     const data = await res.json();
  //     console.log(`Analysis completed for ${repoName}`);
      
  //     setAnalysisResults({
  //       agentId,
  //       repoName,
  //       analysis: data.error ? `Error: ${data.error}` : data.analysis,
  //       isLoading: false,
  //       setupCommands: data.setup_commands
  //     });
  //   } catch (err) {
  //     console.error(`Error analyzing repository: ${err}`);
  //     setAnalysisResults({
  //       agentId,
  //       repoName,
  //       analysis: `Error analyzing repository: ${
  //         err instanceof Error ? err.message : String(err)
  //       }`,
  //       isLoading: false,
  //     });
  //   }
  // };

  /* reusable nav */
  const Nav = () => (
    <nav>
      <div className="nav-container">
        <Link to="/" className="logo" aria-label="AGUnblock home">
          <img src={logo} alt="AGUnblock logo" className="logo-img" />
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <a
            href="https://github.com/microsoft/agunblock"
            className="github-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            microsoft/agunblock {starCount && `⭐ ${starCount}`}
          </a>
        </div>
      </div>
    </nav>
  );

  const LoadingProgress = () => (
    <div className="loading-page-container">
      <div className="loading-container">
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-azure-teal mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Loading Repository Data
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Fetching information for {org}/{repo}
          </p>
        </div>

        <div className="loading-steps">
          <div className="loading-step">
            <div className="step-indicator">
              {loadingStates.fetchingRepo ? (
                <div className="loading-spinner"></div>
              ) : (
                <CheckCircle size={20} style={{ color: 'var(--azure-green)' }} />
              )}
            </div>
            <div className="step-content">
              <div className="step-title">Fetching Repository Information</div>
              <div className="step-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: loadingStates.fetchingRepo ? '100%' : '100%',
                    backgroundColor: loadingStates.fetchingRepo ? 'var(--azure-teal)' : 'var(--azure-green)'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="loading-step">
            <div className="step-indicator">
              {loadingStates.fetchingOrgInfo ? (
                <div className="loading-spinner"></div>
              ) : loadingStates.fetchingRepo ? (
                <div className="step-number">2</div>
              ) : (
                <CheckCircle size={20} style={{ color: 'var(--azure-green)' }} />
              )}
            </div>
            <div className="step-content">
              <div className="step-title">Loading Organization Details</div>
              <div className="step-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: loadingStates.fetchingRepo ? '0%' : loadingStates.fetchingOrgInfo ? '100%' : '100%',
                    backgroundColor: loadingStates.fetchingOrgInfo ? 'var(--azure-teal)' : !loadingStates.fetchingRepo ? 'var(--azure-green)' : 'transparent'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="loading-step">
            <div className="step-indicator">
              {loadingStates.analyzingAgents ? (
                <div className="loading-spinner"></div>
              ) : (loadingStates.fetchingOrgInfo || loadingStates.fetchingRepo) ? (
                <div className="step-number">3</div>
              ) : (
                <CheckCircle size={20} style={{ color: 'var(--azure-green)' }} />
              )}
            </div>
            <div className="step-content">
              <div className="step-title">Analyzing Compatible Agents</div>
              <div className="step-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: (loadingStates.fetchingRepo || loadingStates.fetchingOrgInfo) ? '0%' : loadingStates.analyzingAgents ? '100%' : '100%',
                    backgroundColor: loadingStates.analyzingAgents ? 'var(--azure-teal)' : loadingStates.completed ? 'var(--azure-green)' : 'transparent'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {loadingStates.completed && (
          <div className="loading-complete">
            <CheckCircle size={24} style={{ color: 'var(--azure-green)', marginRight: '0.5rem' }} />
            <span style={{ color: 'var(--azure-green)' }}>Repository data loaded successfully!</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading)
    return (
      <>
        <div className="bg-animation" />
        <Nav />
        <LoadingProgress />
      </>
    );

  if (error)
    return (
      <>
        <div className="bg-animation" />
        <Nav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <Link to="/" className="mt-4 inline-block agent-btn primary">
              Return to Home
            </Link>
          </div>
        </div>
      </>
    );

  return (
    <>
      <div className="bg-animation" />
      <Nav />

      {/* ---------- REPO HEADER ---------- */}
      <div className="repo-header">
        <div style={{ height: '1rem' }}></div>
        
        {/* ---------- REPO INFO CARD IN HEADER ---------- */}
        <div className="repo-info-card-header">
          <div className="repo-info-content">
            <div className="repo-card-flex">
              {/* Organization Logo */}
              <div className="repo-org-logo">
                {repoData!.orgLogoUrl && (
                  <img 
                    src={repoData!.orgLogoUrl} 
                    alt={`${repoData!.org} logo`} 
                    className="org-logo-img"
                  />
                )}
              </div>
              
              {/* Repository Info */}
              <div className="repo-card-details">
                <h2 className="repo-name">{repoData!.repo}</h2>
                <div className="repo-full-path">
                  <a 
                    href={`https://github.com/${repoData!.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repoData!.fullName} <ExternalLink style={{ width: '12px', height: '12px', marginLeft: '0.25rem' }} />
                  </a>
                </div>
                <p className="repo-description">{repoData!.description}</p>
                
                <div className="repo-meta-inline">
                  <div className="repo-meta-item">
                    <div className="language-indicator" style={{ 
                      backgroundColor: getLanguageColor(repoData!.language),
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '6px'
                    }}></div>
                    {repoData!.language}
                  </div>
                  <div className="repo-meta-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      style={{ marginRight: '0.25rem', verticalAlign: 'middle' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    {repoData!.stars} stars
                  </div>
                  {repoData!.updatedAt && (
                    <div className="repo-meta-item">
                      <span>Updated on {repoData!.updatedAt}</span>
                    </div>
                  )}
                </div>
                
                <div className="repo-actions">
                  <a
                    href={`https://github.com/${repoData!.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link-button"
                  >
                    <Github size={16} style={{ marginRight: '0.5rem' }} />
                    View on GitHub
                  </a>
                  <a
                    href={`https://deepwiki.com/${repoData!.fullName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link-button secondary"
                  >
                    <Book size={16} style={{ marginRight: '0.5rem' }} />
                    View on DeepWiki
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="repo-main-centered">
        {/* ---------- AGENT LIST FOR THIS REPO ---------- */}
        <h2 className="section-title">AI Agents for This Repository</h2>
        <p className="section-subtitle">
          Discover how to use these agents with {repoData!.fullName}
        </p>

        {/* Experimental Notice */}
        <div className="experimental-notice" style={{
          background: 'linear-gradient(135deg, #5c2d91 0%, #7c3aed 100%)',
          border: '1px solid #8b5cf6',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              EXPERIMENTAL
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
              Powered by Azure AI Foundry Agent Service
            </span>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            lineHeight: '1.4',
            opacity: 0.95 
          }}>
            This AI agent analysis feature is currently experimental and under active development. 
            <strong> Coming soon:</strong> Repository indexing and caching capabilities for faster analysis.
          </p>
        </div>

        {['async-swe', 'code-completion', 'cli', 'devops'].map((cat) => (
          <div key={cat} className="agent-category-group">
            <h3 className="agent-category-title">
              {cat === 'async-swe'
                ? 'Async SWE Agents'
                : cat === 'code-completion'
                ? 'Code Completion Agents'
                : cat === 'cli'
                ? 'CLI Tools'
                : 'DevOps Agents'}
            </h3>
            <div className="agents-grid">
              {agents.filter((a) => a.category === cat).map((agent) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  showAnalyzeButton={true}
                  repoName={repoData!.fullName}
                  onAnalyzeClick={openAnalysisModal}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- FOOTER ---------- */}
      <footer>
        <div className="footer-content">
          <p style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Microsoft Corporation. AGUnblock is an
            open source project.
          </p>
        </div>
      </footer>

      {/* ---------- ANALYSIS MODAL ---------- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${
          analysisResults?.agentId
            ? agents.find((a) => a.id === analysisResults.agentId)?.name
            : ''
        } Analysis for ${analysisResults?.repoName ?? ''}`}
        maxWidth={analysisResults && !analysisResults.isLoading ? "90vw" : "800px"}
      >
        {analysisResults?.isLoading ? (
          <div className="analysis-loading">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-teal mx-auto mb-4"></div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Analyzing repository contents...</p>
              <p className="text-sm text-gray-500">
                Azure AI Agents is analyzing the repository structure and identifying configuration files.
                This may take a few moments.
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-azure-teal h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="analysis-results">
            {/* Analysis content */}
            <MarkdownRenderer
              content={analysisResults?.analysis || ''}
              className="analysis-content mb-6"
              style={{
                background: '#1a1a1a',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                minHeight: '300px'
              }}
            />
            
            {/* Setup Commands Section */}
            {analysisResults?.setupCommands && (
              <div className="setup-commands-section">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Devin Setup Commands</h2>
                <p className="mb-4">
                  These commands can be used to configure Devin's machine for working with this repository:
                </p>
                
                {Object.entries(analysisResults.setupCommands).map(([key, value]) => (
                  <div key={key} className="setup-command-group mb-4">
                    <h3 className="text-lg font-semibold mb-2 capitalize" style={{ color: 'var(--text-primary)' }}>{key.replace('_', ' ')}</h3>
                    <pre style={{ 
                      background: '#1a1a1a',
                      color: '#4ade80',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      overflowX: 'auto',
                      fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                    }}>
                      <code>{value}</code>
                    </pre>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> These commands were automatically extracted from the repository's 
                    configuration files and may need adjustments based on your specific environment.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ---------- NEW STREAMING ANALYSIS MODAL ---------- */}
      {selectedAgent && (
        <AnalysisModal
          isOpen={analysisModalOpen}
          onClose={() => {
            setAnalysisModalOpen(false);
            setSelectedAgent(null);
          }}
          agentName={selectedAgent.name}
          repoName={repoData!.fullName}
          agentId={selectedAgent.id}
        />
      )}
    </>
  );
};

export default RepoPage;
