import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
  useNavigate,
} from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import AgUnblockLogo from './assets/agunblock-logo.svg';
import './App.css';
import Modal from './components/ui/Modal';

/* ------------------------------------------------------------------------- */
/* AGENT CATALOG                                                             */
/* ------------------------------------------------------------------------- */
const agents = [
  {
    id: 'github-copilot',
    name: 'GitHub Copilot Coding Agent',
    description:
      'An AI-powered coding assistant that helps developers write better code faster.',
    provider: 'GitHub (Microsoft)',
    type: 'coding',
    url: 'https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/',
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
    getStarted: 'Available directly in GitHub. Enable through GitHub settings.',
    strengths: [
      'Code completion',
      'Natural language to code',
      'Context-aware suggestions',
      'Multi-file understanding',
    ],
    integration: 'Built directly into GitHub',
  },
  {
    id: 'devin',
    name: 'Cognition Devin',
    description:
      'An autonomous AI software engineer that can understand, plan, and execute complex software development tasks.',
    provider: 'Cognition (Available via Azure)',
    type: 'autonomous',
    url: 'https://cognition.ai/blog/devin-2',
    logo: 'https://cognition.ai/images/devin-logo.svg',
    getStarted: 'Available via Azure marketplace.',
    strengths: [
      'End-to-end development',
      'Autonomous problem solving',
      'Complex reasoning',
      'Multi-step planning',
    ],
    integration: 'Available through Azure marketplace',
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description:
      'A command-line interface powered by OpenAI Codex for code generation and assistance.',
    provider: 'OpenAI',
    type: 'cli',
    url: 'https://github.com/openai/codex',
    logo: 'https://openai.com/content/images/2021/08/codex-1.jpg',
    getStarted: 'Available via Azure OpenAI Service.',
    strengths: [
      'Command-line integration',
      'Code generation from comments',
      'API understanding',
      'Language translation',
    ],
    integration: 'Use with Azure OpenAI Service',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description:
      'An AI assistant specialized in understanding and generating code across multiple programming languages.',
    provider: 'Anthropic',
    type: 'cli',
    url: 'https://github.com/anthropics/claude-code',
    logo: 'https://anthropic.com/images/claude-logo.svg',
    getStarted: 'Available via API integration.',
    strengths: [
      'Code explanation',
      'Bug identification',
      'Documentation generation',
      'Refactoring assistance',
    ],
    integration: 'Use with Azure OpenAI Service',
  },
  {
    id: 'sreagent',
    name: 'SREAgent',
    description:
      'An AI agent specialized in Site Reliability Engineering tasks, helping maintain system reliability and performance.',
    provider: 'Microsoft',
    type: 'sre',
    url: 'https://azure.microsoft.com/services/sreagent',
    logo: 'https://azure.microsoft.com/images/product-logos/sreagent.svg',
    getStarted: 'Available directly in Azure.',
    strengths: [
      'Incident response',
      'Performance optimization',
      'System monitoring',
      'Automated remediation',
    ],
    integration: 'Built into Azure services',
  },
];

/* ------------------------------------------------------------------------- */
/* HOMEPAGE                                                                  */
/* ------------------------------------------------------------------------- */
function HomePage() {
  const navigate = useNavigate();
  const [repoInput, setRepoInput] = useState('');

  const analyzeRepo = () => {
    const value = repoInput.trim();
    if (!value) {
      alert('Please enter a GitHub repository URL or owner/repo format');
      return;
    }

    let owner: string | undefined;
    let repo: string | undefined;

    if (value.includes('github.com')) {
      const match = value.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
      if (match) {
        owner = match[1];
        repo = match[2].replace('.git', '');
      }
    } else if (value.includes('/')) {
      [owner, repo] = value.split('/');
    }

    if (owner && repo) navigate(`/${owner}/${repo}`);
    else alert('Invalid repository format. Use owner/repo or a GitHub URL');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') analyzeRepo();
  };

  const [activeCategory, setActiveCategory] =
    useState<'all' | 'coding' | 'autonomous' | 'sre' | 'cli'>('all');
  const filteredAgents = agents.filter(
    (a) => activeCategory === 'all' || a.type === activeCategory
  );

  /* smooth-scroll + nav shadow */
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'A' && t.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = t.getAttribute('href')!.substring(1);
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };
    const handleScroll = () => {
      const nav = document.querySelector('nav') as HTMLElement | null;
      if (nav) {
        if (window.scrollY > 50) {
          nav.style.background = 'rgba(31,31,31,1)';
          nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
        } else {
          nav.style.background = 'rgba(31,31,31,0.98)';
          nav.style.boxShadow = 'none';
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="bg-animation" />

      {/* ---------- NAV ---------- */}
      <nav>
        <div className="nav-container">
          <Link to="/" className="logo" aria-label="AGUnblock home">
            <AgUnblockLogo className="logo-svg" />
          </Link>

          <div className="nav-links">
            <a href="#agents">Agents</a>
            <a href="#integration">Integration</a>
            <a href="#docs">Documentation</a>
            <a
              href="https://github.com/microsoft/agunblock"
              className="github-btn"
            >
              <i className="ms-Icon ms-Icon--GitGraph" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-content">
          <h1>Unlock AI Agents for Your Development Workflow</h1>
          <p className="hero-subtitle">
            Discover and integrate powerful AI coding agents into your SDLC.
            From GitHub Copilot to Devin, find the perfect AI assistant for your
            project.
          </p>

          <div className="repo-input-container">
            <input
              type="text"
              className="repo-input"
              placeholder="Enter GitHub repo URL or owner/repo"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="analyze-btn" onClick={analyzeRepo}>
              Analyze
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Try:&nbsp;
            <code style={{ color: 'var(--azure-teal)' }}>microsoft/vscode</code>{' '}
            or paste any GitHub URL
          </p>
        </div>
      </section>

      {/* ---------- AGENT CATEGORIES ---------- */}
      <section className="categories" id="agents">
        <h2 className="section-title">AI Agents by Category</h2>
        <p className="section-subtitle">
          Choose the right agent for your development needs
        </p>

        <div className="category-tabs">
          {(['all', 'coding', 'autonomous', 'sre', 'cli'] as const).map(
            (cat) => (
              <div
                key={cat}
                className={`category-tab ${
                  activeCategory === cat ? 'active' : ''
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all'
                  ? 'All Agents'
                  : cat === 'coding'
                  ? 'Coding Agents'
                  : cat === 'autonomous'
                  ? 'Autonomous Agents'
                  : cat === 'sre'
                  ? 'SRE & DevOps'
                  : 'CLI Based Agents'}
              </div>
            )
          )}
        </div>

        <div className="agents-grid">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="agent-card" data-category={agent.type}>
              <div className="agent-header">
                <div className="agent-icon">
                  {agent.type === 'coding' && '🐙'}
                  {agent.type === 'autonomous' && '🤖'}
                  {agent.type === 'cli' &&
                    (agent.id === 'claude-code' ? '🎭' : '🔧')}
                  {agent.type === 'sre' && '⚡'}
                </div>
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  <div className="agent-type">
                    {agent.type === 'coding'
                      ? 'Coding Assistant'
                      : agent.type === 'autonomous'
                      ? 'Autonomous Agent'
                      : agent.type === 'cli'
                      ? 'CLI Tool'
                      : 'SRE & DevOps'}
                  </div>
                </div>
              </div>

              <p className="agent-description">{agent.description}</p>

              <ul className="agent-features">
                {agent.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <div className="agent-actions">
                <a href={agent.url} className="agent-btn primary">
                  Get Started
                </a>
                <a href="#" className="agent-btn secondary">
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- INTEGRATION STRIP ---------- */}
      <section className="integration" id="integration">
        <div className="integration-content">
          <h2 className="section-title">Microsoft Ecosystem Integration</h2>
          <p className="section-subtitle">
            Seamlessly integrate AI agents into your Microsoft development stack
          </p>

          <div className="integration-grid">
            <div className="integration-item">
              <div className="integration-icon">☁️</div>
              <h3>Azure Integration</h3>
              <p>
                Deploy agents via Azure Marketplace or use Azure OpenAI for
                custom implementations
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">📦</div>
              <h3>GitHub Integration</h3>
              <p>
                Native support for GitHub repositories with Copilot and other
                agents
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">🔄</div>
              <h3>DevOps Pipeline</h3>
              <p>
                Integrate agents into your CI/CD workflows for automated
                development
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">🛡️</div>
              <h3>Enterprise Ready</h3>
              <p>
                Security, compliance, and governance features for enterprise
                deployments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Contributing</a>
            <a href="#">License</a>
            <a href="#">Privacy</a>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Microsoft Corporation. AGUnblock is an
            open source project.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ------------------------------------------------------------------------- */
/* REPO PAGE                                                                 */
/* ------------------------------------------------------------------------- */
function RepoPage() {
  const { org, repo } = useParams<{ org: string; repo: string }>();

  const [repoData, setRepoData] = useState<{
    org: string;
    repo: string;
    fullName: string;
    description: string;
    language: string;
    stars: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    agentId: string;
    repoName: string;
    analysis: string;
    isLoading: boolean;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* fetch mock repo data */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (org && repo) {
        setRepoData({
          org,
          repo,
          fullName: `${org}/${repo}`,
          description:
            'Repository information would be fetched from GitHub API in a production environment.',
          language: 'JavaScript',
          stars: 1024,
        });
        setLoading(false);
      } else {
        setError('Invalid repository information');
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
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
          <AgUnblockLogo className="logo-svg" />
        </Link>

        <div className="nav-links">
          <a href="/#agents">Agents</a>
          <a href="/#integration">Integration</a>
          <a href="/#docs">Documentation</a>
          <a
            href="https://github.com/microsoft/agunblock"
            className="github-btn"
          >
            <i className="ms-Icon ms-Icon--GitGraph" />
            <span>Star on GitHub</span>
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
      </div>

      {/* ---------- MAIN ---------- */}
      <div className="repo-container">
        <div className="repo-info-card">
          <h2 className="repo-info-title">Repository Information</h2>
          <p className="text-text-secondary">{repoData!.description}</p>

          <div className="repo-meta">
            <div className="repo-meta-item">Language: {repoData!.language}</div>
            <div className="repo-meta-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
          </div>

          <a
            href={`https://github.com/${repoData!.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            View on GitHub <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>

        {/* ---------- AGENT LIST FOR THIS REPO ---------- */}
        <h2 className="section-title">AI Agents for This Repository</h2>
        <p className="section-subtitle">
          Discover how to use these agents with {repoData!.fullName}
        </p>

        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card" data-category={agent.type}>
              <div className="agent-header">
                <div className="agent-icon">
                  {agent.type === 'coding' && '🐙'}
                  {agent.type === 'autonomous' && '🤖'}
                  {agent.type === 'cli' &&
                    (agent.id === 'claude-code' ? '🎭' : '🔧')}
                  {agent.type === 'sre' && '⚡'}
                </div>
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  <div className="agent-type">
                    {agent.type === 'coding'
                      ? 'Coding Assistant'
                      : agent.type === 'autonomous'
                      ? 'Autonomous Agent'
                      : agent.type === 'cli'
                      ? 'CLI Tool'
                      : 'SRE & DevOps'}
                  </div>
                </div>
              </div>

              <p className="agent-description">{agent.description}</p>

              <ul className="agent-features">
                <li>How to use with {repoData!.fullName}:</li>
                {agent.id === 'github-copilot' && (
                  <>
                    <li>Open this repository in GitHub or VS Code</li>
                    <li>Enable GitHub Copilot in your editor</li>
                    <li>Start coding and receive AI-powered suggestions</li>
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
                <button
                  className="agent-btn secondary"
                  onClick={() =>
                    analyzeRepository(agent.id, repoData!.fullName)
                  }
                >
                  Analyze Repository
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- INTEGRATION STRIP ---------- */}
      <section className="integration" id="integration">
        <div className="integration-content">
          <h2 className="section-title">Microsoft Ecosystem Integration</h2>
          <p className="section-subtitle">
            Seamlessly integrate AI agents into your Microsoft development stack
          </p>

          <div className="integration-grid">
            <div className="integration-item">
              <div className="integration-icon">☁️</div>
              <h3>Azure Integration</h3>
              <p>
                Deploy agents via Azure Marketplace or use Azure OpenAI for
                custom implementations
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">📦</div>
              <h3>GitHub Integration</h3>
              <p>
                Native support for GitHub repositories with Copilot and other
                agents
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">🔄</div>
              <h3>DevOps Pipeline</h3>
              <p>
                Integrate agents into your CI/CD workflows for automated
                development
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">🛡️</div>
              <h3>Enterprise Ready</h3>
              <p>
                Security, compliance, and governance features for enterprise
                deployments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Contributing</a>
            <a href="#">License</a>
            <a href="#">Privacy</a>
          </div>
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
}

/* ------------------------------------------------------------------------- */
/* APP WRAPPER                                                               */
/* ------------------------------------------------------------------------- */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:org/:repo" element={<RepoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
