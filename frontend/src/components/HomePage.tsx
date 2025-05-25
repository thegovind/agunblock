import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AgentCategory } from '../types/agent';
import agents from '../data/agents';
import AgentCard from './AgentCard';
import logo from '../assets/logo.png';

const HomePage: React.FC = () => {
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
    useState<AgentCategory>('all');
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

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-content">
          <h1>Streamline Your Development with AI Agents for Every Stage</h1>
          <p className="hero-subtitle">
            Discover, configure, and integrate powerful AI agents into your development workflow. Automate repetitive tasks, accelerate coding, and focus on delivering value to your users.
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
          Find the perfect AI assistant for each stage of your development lifecycle
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
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* ---------- INTEGRATION STRIP ---------- */}
      <section className="integration" id="integration">
        <div className="integration-content">
          <h2 className="section-title">Microsoft Ecosystem Integration</h2>
          <p className="section-subtitle">
            Leverage the full power of Microsoft's AI and cloud services for your development workflow
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
          <p style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Microsoft Corporation. AGUnblock is an
            open source project.
          </p>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
