import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, Users, Zap, Shield, Globe, Code, Brain } from 'lucide-react';
import logo from '../assets/logo.png';

const AzureOpenAITeamPage: React.FC = () => {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/microsoft/gitagu');
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

      <nav>
        <div className="nav-container">
          <Link to="/" className="logo" aria-label="gitagu home">
            <img src={logo} alt="gitagu logo" className="logo-img" />
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>
            <a href="#services">Services</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
            <a
              href="https://github.com/microsoft/gitagu"
              className="github-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              microsoft/gitagu {starCount && `⭐ ${starCount}`}
            </a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Azure OpenAI Team</h1>
          <p className="hero-subtitle">
            Empowering developers with cutting-edge AI capabilities through Azure OpenAI Service
          </p>
          
          <div className="hero-cta-section">
            <a
              href="https://azure.microsoft.com/en-us/products/ai-services/openai-service"
              className="analyze-btn-hero"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Azure OpenAI <ExternalLink size={16} style={{ marginLeft: '0.5rem' }} />
            </a>
            <a
              href="#contact"
              className="analyze-btn-hero secondary"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      <section className="categories" id="services">
        <div className="categories-content">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive AI solutions for modern development workflows
          </p>

          <div className="agents-grid">
            <div className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">
                  <Brain size={32} style={{ color: 'var(--azure-teal)' }} />
                </div>
                <div className="agent-info">
                  <h3>GPT Models</h3>
                  <div className="agent-type">Language Models</div>
                </div>
              </div>
              <p className="agent-description">
                Access to GPT-4, GPT-3.5, and other state-of-the-art language models through Azure's secure infrastructure.
              </p>
              <ul className="agent-features">
                <li>Enterprise-grade security and compliance</li>
                <li>Global availability with low latency</li>
                <li>Flexible pricing and scaling options</li>
                <li>Integration with Azure ecosystem</li>
              </ul>
            </div>

            <div className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">
                  <Code size={32} style={{ color: 'var(--azure-green)' }} />
                </div>
                <div className="agent-info">
                  <h3>Codex Integration</h3>
                  <div className="agent-type">Code Generation</div>
                </div>
              </div>
              <p className="agent-description">
                AI-powered code generation and completion capabilities integrated with development tools and workflows.
              </p>
              <ul className="agent-features">
                <li>Natural language to code translation</li>
                <li>Code completion and suggestions</li>
                <li>Multi-language support</li>
                <li>IDE and CLI integrations</li>
              </ul>
            </div>

            <div className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">
                  <Shield size={32} style={{ color: 'var(--azure-orange)' }} />
                </div>
                <div className="agent-info">
                  <h3>Enterprise Solutions</h3>
                  <div className="agent-type">Custom Deployments</div>
                </div>
              </div>
              <p className="agent-description">
                Tailored AI solutions for enterprise customers with dedicated support and custom model fine-tuning.
              </p>
              <ul className="agent-features">
                <li>Private model deployments</li>
                <li>Custom fine-tuning services</li>
                <li>24/7 enterprise support</li>
                <li>Compliance and governance tools</li>
              </ul>
            </div>

            <div className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">
                  <Zap size={32} style={{ color: 'var(--azure-teal)' }} />
                </div>
                <div className="agent-info">
                  <h3>AI Foundry</h3>
                  <div className="agent-type">Development Platform</div>
                </div>
              </div>
              <p className="agent-description">
                Comprehensive platform for building, deploying, and managing AI applications with Azure AI Foundry.
              </p>
              <ul className="agent-features">
                <li>Model catalog and marketplace</li>
                <li>MLOps and deployment tools</li>
                <li>Monitoring and analytics</li>
                <li>Collaborative development environment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="integration" id="team">
        <div className="integration-content">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">
            Dedicated professionals working to democratize AI through Azure OpenAI Service
          </p>

          <div className="integration-grid">
            <div className="integration-item">
              <div className="integration-icon">
                <Users size={32} style={{ color: 'var(--azure-green)' }} />
              </div>
              <h3>Engineering Excellence</h3>
              <p>
                Our engineering team builds robust, scalable AI infrastructure that powers millions of applications worldwide.
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">
                <Brain size={32} style={{ color: 'var(--azure-teal)' }} />
              </div>
              <h3>Research & Innovation</h3>
              <p>
                Leading research in AI safety, alignment, and capabilities to ensure responsible AI development and deployment.
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">
                <Shield size={32} style={{ color: 'var(--azure-orange)' }} />
              </div>
              <h3>Security & Compliance</h3>
              <p>
                Ensuring enterprise-grade security, privacy, and compliance across all Azure OpenAI services and deployments.
              </p>
            </div>
            <div className="integration-item">
              <div className="integration-icon">
                <Globe size={32} style={{ color: 'var(--azure-green)' }} />
              </div>
              <h3>Global Support</h3>
              <p>
                Providing world-class customer support and developer relations across all regions and time zones.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.7' }}>
              To democratize access to advanced AI capabilities through Azure OpenAI Service, enabling developers and organizations 
              to build intelligent applications that transform industries and improve lives while maintaining the highest standards 
              of safety, security, and responsible AI practices.
            </p>
          </div>
        </div>
      </section>

      <section className="categories" id="contact">
        <div className="categories-content">
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-subtitle">
            Connect with our team for support, partnerships, or collaboration opportunities
          </p>

          <div className="integration-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="integration-item">
              <div className="integration-icon">
                <Mail size={32} style={{ color: 'var(--azure-teal)' }} />
              </div>
              <h3>General Inquiries</h3>
              <p>
                For general questions about Azure OpenAI Service, pricing, or capabilities.
              </p>
              <a
                href="https://azure.microsoft.com/en-us/products/ai-services/openai-service"
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn primary"
                style={{ marginTop: '1rem' }}
              >
                Contact Sales <ExternalLink size={16} />
              </a>
            </div>
            <div className="integration-item">
              <div className="integration-icon">
                <Code size={32} style={{ color: 'var(--azure-green)' }} />
              </div>
              <h3>Developer Support</h3>
              <p>
                Technical support, documentation, and developer resources for Azure OpenAI integration.
              </p>
              <a
                href="https://docs.microsoft.com/en-us/azure/cognitive-services/openai/"
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn primary"
                style={{ marginTop: '1rem' }}
              >
                View Documentation <ExternalLink size={16} />
              </a>
            </div>
            <div className="integration-item">
              <div className="integration-icon">
                <Users size={32} style={{ color: 'var(--azure-orange)' }} />
              </div>
              <h3>Community</h3>
              <p>
                Join our developer community to share experiences, get help, and collaborate on projects.
              </p>
              <a
                href="https://github.com/microsoft/gitagu"
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn primary"
                style={{ marginTop: '1rem' }}
              >
                Join Community <ExternalLink size={16} />
              </a>
            </div>
            <div className="integration-item">
              <div className="integration-icon">
                <Shield size={32} style={{ color: 'var(--azure-teal)' }} />
              </div>
              <h3>Enterprise Partnerships</h3>
              <p>
                Custom solutions, enterprise agreements, and strategic partnerships for large organizations.
              </p>
              <a
                href="https://azure.microsoft.com/en-us/solutions/ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn primary"
                style={{ marginTop: '1rem' }}
              >
                Enterprise Solutions <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Ready to Get Started?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Explore Azure OpenAI Service and start building intelligent applications today.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://azure.microsoft.com/en-us/free/"
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn primary"
              >
                Start Free Trial <ExternalLink size={16} />
              </a>
              <a
                href="https://ai.azure.com"
                target="_blank"
                rel="noopener noreferrer"
                className="agent-btn secondary"
              >
                Azure AI Foundry <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <p style={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Microsoft Corporation. Azure OpenAI Team - 
            Empowering developers with responsible AI through Azure.
          </p>
        </div>
      </footer>
    </>
  );
};

export default AzureOpenAITeamPage;
