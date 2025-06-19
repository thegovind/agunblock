import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import './App.css';

import HomePage from './components/HomePage';
import RepoPage from './components/RepoPage';
import AdminConsole from './components/AdminConsole';

/**
 * Main App component that handles routing
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/:org/:repo" element={<RepoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
