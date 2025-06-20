import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

interface NavigationProps {
  showAgentsLink?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ showAgentsLink = true }) => {
  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="logo" aria-label="agentunblock home">
          <img src={logo} alt="agentunblock logo" className="logo-img" />
        </Link>

        <div className="nav-links">
          {showAgentsLink && <a href={showAgentsLink ? "#agents" : "/#agents"}>Agents</a>}
          <a
            href="https://github.com/thegovind/agunblock"
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
};

export default Navigation;
