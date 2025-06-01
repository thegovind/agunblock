import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Plus, Play } from 'lucide-react';
import SetupModal from './SetupModal';
import agents from '../../data/agents';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'creating' | 'created' | 'error';
  sessionId?: string;
  sessionUrl?: string;
  error?: string;
}

interface MultiDevinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiDevinModal: React.FC<MultiDevinModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [userRequest, setUserRequest] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [snapshot, setSnapshot] = useState('');
  const [playbook, setPlaybook] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const [hasBreakdown, setHasBreakdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        // Restore body scroll when modal is closed
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  // Helper function to extract repo name from GitHub URL
  const extractRepoName = (url: string): string => {
    if (!url.trim()) return '';
    
    try {
      // Handle various GitHub URL formats
      const cleanUrl = url.trim();
      
      // Remove .git suffix if present
      const withoutGit = cleanUrl.replace(/\.git$/, '');
      
      // Extract owner/repo from GitHub URLs
      const githubMatch = withoutGit.match(/github\.com\/([^\/]+\/[^\/\?#]+)/);
      if (githubMatch) {
        return githubMatch[1];
      }
      
      // If it's already in owner/repo format
      if (withoutGit.match(/^[^\/]+\/[^\/]+$/)) {
        return withoutGit;
      }
      
      return '';
    } catch {
      return '';
    }
  };

  const breakdownTasks = async () => {
    if (!userRequest.trim()) {
      alert('Please enter a request to break down');
      return;
    }

    setIsBreakingDown(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/breakdown-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: userRequest.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to breakdown tasks');
      }

      const data = await response.json();
      const newTasks: Task[] = data.tasks.map((task: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        status: 'pending' as const,
      }));

      setTasks(newTasks);
      setHasBreakdown(true);
    } catch (error) {
      console.error('Error breaking down tasks:', error);
      alert('Failed to break down tasks. Please try again.');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const createDevinSession = async (task: Task) => {
    if (!apiKey.trim()) {
      alert('Please enter your Devin API key');
      return;
    }

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, status: 'creating' } : t
      )
    );

    try {
      // Build the prompt with optional repo prefix
      let finalPrompt = `${task.title}\n\n${task.description}`;
      
      const repoName = extractRepoName(repoUrl);
      if (repoName) {
        finalPrompt = `Using repo https://github.com/${repoName}, do this task - ${task.title}\n\n${task.description}`;
      }

      const sessionPayload: any = {
        api_key: apiKey,
        prompt: finalPrompt,
      };

      if (snapshot.trim()) {
        sessionPayload.snapshot_id = snapshot.trim();
      }

      if (playbook.trim()) {
        sessionPayload.playbook_id = playbook.trim();
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/create-devin-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Devin API error: ${response.status} - ${errorData}`);
      }

      const sessionData = await response.json();
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                status: 'created',
                sessionId: sessionData.session_id,
                sessionUrl: sessionData.session_url,
              }
            : t
        )
      );
    } catch (error) {
      console.error('Error creating Devin session:', error);
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? {
                ...t,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : t
        )
      );
    }
  };

  const resetModal = () => {
    setApiKey('');
    setUserRequest('');
    setRepoUrl('');
    setSnapshot('');
    setPlaybook('');
    setTasks([]);
    setHasBreakdown(false);
    setIsBreakingDown(false);
  };

  const modalContent = (
    <div className="fullscreen-modal-overlay" onClick={handleOverlayClick}>
      <div className="fullscreen-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="fullscreen-modal-header">
          <h2 className="fullscreen-modal-title">Multi Devin Session Manager</h2>
          <div className="modal-close-section">
            <span className="modal-close-tip">Press ESC to close</span>
            <button className="fullscreen-modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="fullscreen-modal-content">
        {/* API Key Section */}
        <div className="form-section">
          <label className="form-label">
            Devin API Key
            <a
              href="https://app.devin.ai/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="api-key-link"
            >
              <ExternalLink size={16} />
              Get your API key
            </a>
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter your Devin API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="form-help">
            First, get your API key from{' '}
            <a
              href="https://app.devin.ai/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              Devin's settings page
            </a>
          </p>
        </div>

        {/* User Request Section */}
        <div className="form-section">
          <label className="form-label">
            Your Request
            <a
              href="https://deepwiki.com"
              target="_blank"
              rel="noopener noreferrer"
              className="api-key-link"
            >
              <ExternalLink size={16} />
              Need help breaking down tasks?
            </a>
          </label>
          <textarea
            className="form-textarea"
            placeholder="Describe the work you want Devin to do. This will be broken down into multiple tasks..."
            rows={4}
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
          />
        </div>

        {/* Repository URL Section */}
        <div className="form-section">
          <label className="form-label">Context Repository URL (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://github.com/owner/repo or owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <p className="form-help">
            If provided, tasks will be prefixed with "Using repo owner/repo" for better context
          </p>
        </div>

        {/* Optional Fields */}
        <div className="form-row">
          <div className="form-section">
            <label className="form-label">
              Snapshot (Optional)
              <button
                type="button"
                className="api-key-link"
                onClick={() => setSetupModalOpen(true)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <ExternalLink size={16} />
                Create new
              </button>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Snapshot reference"
              value={snapshot}
              onChange={(e) => setSnapshot(e.target.value)}
            />
          </div>
          <div className="form-section">
            <label className="form-label">
              Playbook (Optional)
              <a
                href="https://docs.devin.ai/product-guides/creating-playbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                <ExternalLink size={16} />
                Create new
              </a>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Playbook reference"
              value={playbook}
              onChange={(e) => setPlaybook(e.target.value)}
            />
          </div>
        </div>

        {/* Breakdown Button */}
        {!hasBreakdown && (
          <div className="form-section">
            <button
              className="btn-primary"
              onClick={breakdownTasks}
              disabled={isBreakingDown || !userRequest.trim()}
            >
              <Plus size={16} />
              {isBreakingDown ? 'Breaking down tasks...' : 'Break down into tasks'}
            </button>
          </div>
        )}

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="tasks-section">
            <div className="tasks-header">
              <h3>Tasks</h3>
              <button
                className="btn-secondary"
                onClick={() => {
                  setTasks([]);
                  setHasBreakdown(false);
                }}
              >
                Reset Tasks
              </button>
            </div>

            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-content">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    {task.error && (
                      <p className="task-error">Error: {task.error}</p>
                    )}
                    {task.sessionUrl && (
                      <a
                        href={task.sessionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="task-session-link"
                      >
                        <ExternalLink size={16} />
                        View Session
                      </a>
                    )}
                  </div>
                  <div className="task-actions">
                    {task.status === 'pending' && (
                      <button
                        className="btn-primary btn-small"
                        onClick={() => createDevinSession(task)}
                        disabled={!apiKey.trim()}
                      >
                        <Play size={16} />
                        Create Session
                      </button>
                    )}
                    {task.status === 'creating' && (
                      <div className="task-status creating">Creating...</div>
                    )}
                    {task.status === 'created' && (
                      <div className="task-status created">✓ Created</div>
                    )}
                    {task.status === 'error' && (
                      <button
                        className="btn-primary btn-small"
                        onClick={() => createDevinSession(task)}
                        disabled={!apiKey.trim()}
                      >
                        <Play size={16} />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={resetModal}>
            Reset All
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Get Devin agent data for SetupModal
  const devinAgent = agents.find(agent => agent.id === 'devin');

  // Use portal to render modal outside the main component tree
  const modalPortal = document.getElementById('modal-portal');
  
  return (
    <>
      {modalPortal && createPortal(modalContent, modalPortal)}
      
      {devinAgent && (
        <SetupModal 
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
          agent={devinAgent}
        />
      )}
    </>
  );
};

export default MultiDevinModal; 