import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';
import agents from '../data/agents';
import AgentCard from './AgentCard';
import Modal from './ui/Modal';

interface RepoData {
  org: string;
  repo: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
}

interface AnalysisResults {
  agentId: string;
  repoName: string;
  analysis: string;
  isLoading: boolean;
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
            setRepoData({
              org,
              repo,
              fullName: data.full_name,
              description: data.description,
              language: data.language,
              stars: data.stars,
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
    setAnalysisResults({ agentId, repoName, analysis: '', isLoading: true });
    setModalOpen(true);

    try {
      const [owner, r] = repoName.split('/');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo: r, agent_id: agentId }),
      });
      const data = await res.json();
      setAnalysisResults({
        agentId,
        repoName,
        analysis: data.error ? `Error: ${data.error}` : data.analysis,
        isLoading: false,
      });
    } catch (err) {
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
            <p className="repo-description">{repoData!.description}</p>
            
            <div className="repo-meta-inline">
              <div className="repo-meta-item">
                <span className="meta-label">Language:</span> {repoData!.language}
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
              <a
                href={`https://github.com/${repoData!.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-link-header"
              >
                View on GitHub <ExternalLink style={{ width: '14px', height: '14px', marginLeft: '0.25rem' }} />
              </a>
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
            <p>Analyzing repository contents...</p>
          </div>
        ) : (
          <div
            className="analysis-content"
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
        )}
      </Modal>
    </>
  );
};

export default RepoPage;
