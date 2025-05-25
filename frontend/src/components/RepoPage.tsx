import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';
import agents from '../data/agents';
import AgentCard from './AgentCard';
import Modal from './ui/Modal';

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

const RepoPage: React.FC = () => {
  const { org, repo } = useParams<{ org: string; repo: string }>();

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* fetch real repo data */
  useEffect(() => {
    const fetchRepoData = async () => {
      if (org && repo) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/repo-info/${org}/${repo}`);
          
          if (response.ok) {
            const data = await response.json();
            
            const orgLogoUrl = `https://github.com/${org}.png`;
            
            const updatedAt = data.updated_at ? new Date(data.updated_at).toLocaleDateString() : undefined;
            
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
          } else {
            setError('Repository not found or failed to fetch data');
          }
        } catch (err) {
          setError(`Error fetching repository: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          setLoading(false);
        }
      } else {
        setError('Invalid repository information');
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [org, repo]);

  const analyzeRepository = async (agentId: string, repoName: string) => {
    setAnalysisResults({ 
      agentId, 
      repoName, 
      analysis: '', 
      isLoading: true,
      setupCommands: undefined
    });
    setModalOpen(true);

    try {
      const [owner, r] = repoName.split('/');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      console.log(`Starting analysis for ${repoName} with agent ${agentId}...`);
      
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo: r, agent_id: agentId }),
      });
      
      const data = await res.json();
      console.log(`Analysis completed for ${repoName}`);
      
      setAnalysisResults({
        agentId,
        repoName,
        analysis: data.error ? `Error: ${data.error}` : data.analysis,
        isLoading: false,
        setupCommands: data.setup_commands
      });
    } catch (err) {
      console.error(`Error analyzing repository: ${err}`);
      setAnalysisResults({
        agentId,
        repoName,
        analysis: `Error analyzing repository: ${
          err instanceof Error ? err.message : String(err)
        }`,
        isLoading: false,
      });
    }
  };

  /* reusable nav */
  const Nav = () => (
    <nav>
      <div className="nav-container">
        <Link to="/" className="logo" aria-label="AGUnblock home">
          <img src={logo} alt="AGUnblock logo" className="logo-img" />
        </Link>

        <div className="nav-links">
          <a href="/#agents">Agents</a>
          <a
            href="https://github.com/microsoft/agunblock"
            className="github-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="ms-Icon ms-Icon--GitGraph" />
            <span>Explore on GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );

  if (loading)
    return (
      <>
        <div className="bg-animation" />
        <Nav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-teal mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Loading repository information...
            </p>
          </div>
        </div>
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
        <div className="repo-header-content">
          <Link to="/" className="back-link">
            <span>←</span> Back to Home
          </Link>
          <h1 className="repo-title">
            <Github className="mr-2" />
            {repoData!.fullName}
          </h1>
        </div>
        
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

        {['code-completion', 'async-swe', 'cli', 'devops'].map((cat) => (
          <div key={cat} className="agent-category-group">
            <h3 className="agent-category-title">
              {cat === 'code-completion'
                ? 'Code Completion Agents'
                : cat === 'async-swe'
                ? 'Async SWE Agents'
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
                  onAnalyzeClick={analyzeRepository}
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
            <div
              className="analysis-content mb-6"
              dangerouslySetInnerHTML={{
                __html: analysisResults?.analysis
                  ? analysisResults.analysis
                      .replace(/\n\n/g, '<br><br>')
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\#\#\# (.*?)(<br>)/g, '<h3>$1</h3>')
                      .replace(/\#\# (.*?)(<br>)/g, '<h2>$1</h2>')
                      .replace(/\#\#\#\# (.*?)(<br>)/g, '<h4>$1</h4>')
                      .replace(/\#\#\#\#\# (.*?)(<br>)/g, '<h5>$1</h5>')
                      .replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>')
                      .replace(/\`(.*?)\`/g, '<code>$1</code>')
                      .replace(/\- (.*?)(<br>)/g, '<li>$1</li>')
                      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
                      .replace(/<\/ul><ul>/g, '')
                  : '',
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
                    <h3 className="text-lg font-semibold mb-2 capitalize">{key.replace('_', ' ')}</h3>
                    <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto">
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
    </>
  );
};

export default RepoPage;
