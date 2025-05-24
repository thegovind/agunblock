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
import logo from './assets/logo.png';
import './App.css';
import Modal from './components/ui/Modal';

/* ------------------------------------------------------------------------- */
/* AGENT CATALOG                                                             */
/* ------------------------------------------------------------------------- */
const agents = [
  {
    id: 'github-copilot-completions',
    name: 'GitHub Copilot (Code Completions)',
    description:
      'AI pair programmer that suggests code completions as you type in your IDE. Available for VS Code, JetBrains, and more.',
    provider: 'GitHub (Microsoft)',
    category: 'code-completion',
    url: 'https://github.com/features/copilot',
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
    getStarted: 'Enable in your IDE via the GitHub Copilot extension.',
    strengths: [
      'Real-time code suggestions',
      'Context-aware completions',
      'Supports multiple languages',
      'IDE integration',
    ],
    integration: 'IDE plugin',
  },
  {
    id: 'github-copilot-agent',
    name: 'GitHub Copilot Coding Agent',
    description:
      'Asynchronous agent that autonomously completes GitHub Issues by creating pull requests, running CI/CD, and iterating on feedback. Assign issues to the agent to automate feature additions, bug fixes, refactoring, and more.',
    provider: 'GitHub (Microsoft)',
    category: 'async-swe',
    url: 'https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/',
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png',
    getStarted: 'Assign issues to Copilot Agent in your GitHub repository.',
    strengths: [
      'Automated PRs',
      'CI/CD integration',
      'Issue-driven automation',
      'Iterative code improvement',
    ],
    integration: 'GitHub Issues & PRs',
  },
  {
    id: 'devin',
    name: 'Devin',
    description:
      'An autonomous AI software engineer, available via Azure Marketplace, that can plan and execute complex tasks across the SDLC.',
    provider: 'Microsoft',
    category: 'async-swe',
    url: 'https://aka.ms/devin',
    logo: 'https://cognition.ai/images/devin-logo.svg',
    getStarted: 'Available via Azure Marketplace.',
    strengths: [
      'End-to-end development',
      'Autonomous problem solving',
      'Complex reasoning',
      'Multi-step planning',
    ],
    integration: 'Azure Marketplace',
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description:
      'Command-line interface for code generation using natural language, compatible with both OpenAI and Azure OpenAI endpoints.',
    provider: 'OpenAI',
    category: 'cli',
    url: 'https://github.com/openai/codex?tab=readme-ov-file#environment-variables-setup',
    logo: 'https://openai.com/content/images/2021/08/codex-1.jpg',
    getStarted: 'Install via pip and configure with your OpenAI or Azure OpenAI API key.',
    strengths: [
      'Command-line integration',
      'Code generation from comments',
      'API understanding',
      'Language translation',
    ],
    integration: 'OpenAI & Azure OpenAI',
  },
  {
    id: 'sreagent',
    name: 'SREAgent',
    description:
      'Microsoft\'s AI agent for Site Reliability Engineering tasks, integrated with Azure App Service. Helps maintain system reliability and performance.',
    provider: 'Microsoft',
    category: 'devops',
    url: 'https://learn.microsoft.com/en-us/azure/app-service/sre-agent-overview',
    logo: 'https://azure.microsoft.com/images/product-logos/sreagent.svg',
    getStarted: 'Available directly in Azure App Service.',
    strengths: [
      'Incident response',
      'Performance optimization',
      'System monitoring',
      'Automated remediation',
    ],
    integration: 'Azure App Service',
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
    useState<'all' | 'code-completion' | 'async-swe' | 'cli' | 'devops'>('all');
  const filteredAgents = agents.filter(
    (a) => activeCategory === 'all' || a.category === activeCategory
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
            <img src={logo} alt="AGUnblock logo" className="logo-img" />
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
          <h1>Unlock SDLC Agents to turbocharge Your Development Workflow</h1>
          <p className="hero-subtitle">
            Configure your repo to be leveraged by different AI agents - so your SDLC lifecycle can be automated and you can focus on user needs.
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
            <a
              href="#"
              style={{ color: 'var(--azure-teal)', textDecoration: 'none', cursor: 'pointer' }}
              onClick={e => { e.preventDefault(); setRepoInput('Azure-Samples/snippy'); }}
            >
              Azure-Samples/snippy
            </a>{' '}
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
          {(['all', 'code-completion', 'async-swe', 'cli', 'devops'] as const).map(
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
                  : cat === 'code-completion'
                  ? 'Code Completion Agent'
                  : cat === 'async-swe'
                  ? 'Async SWE Agent'
                  : cat === 'cli'
                  ? 'CLI-based Sync Agent'
                  : 'DevOps Agent'}
              </div>
            )
          )}
        </div>

        <div className="agents-grid">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="agent-card" data-category={agent.category}>
              <div className="agent-header">
                <div className="agent-icon">
                  {agent.category === 'code-completion' && '🐙'}
                  {agent.category === 'async-swe' && '🤖'}
                  {agent.category === 'cli' &&
                    (agent.id === 'claude-code' ? '🎭' : '🔧')}
                  {agent.category === 'devops' && '⚡'}
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
          <img src={logo} alt="AGUnblock logo" className="logo-img" />
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
                <div key={agent.id} className="agent-card" data-category={agent.category}>
                  <div className="agent-header">
                    <div className="agent-icon">
                      {agent.category === 'code-completion' && '🐙'}
                      {agent.category === 'async-swe' && '🤖'}
                      {agent.category === 'cli' &&
                        (agent.id === 'claude-code' ? '🎭' : '🔧')}
                      {agent.category === 'devops' && '⚡'}
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

                  <ul className="agent-features">
                    <li>How to use with {repoData!.fullName}:</li>
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
        ))}
      </div>

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
