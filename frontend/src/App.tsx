import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';

import HomePage from './components/HomePage';
import RepoPage from './components/RepoPage';
import AzureOpenAITeamPage from './components/AzureOpenAITeamPage';

/**
 * Main App component that handles routing
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/azure-openai-team" element={<AzureOpenAITeamPage />} />
        <Route path="/:org/:repo" element={<RepoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
