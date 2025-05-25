import { useState, useCallback } from 'react';

interface AnalysisProgressUpdate {
  step: number;
  step_name: string;
  status: 'starting' | 'in_progress' | 'completed' | 'failed';
  message: string;
  progress_percentage: number;
  elapsed_time?: number;
  details?: Record<string, any>;
}

interface AnalysisResults {
  agentId: string;
  repoName: string;
  analysis: string;
  setupCommands?: {
    prerequisites: string;
    dependencies: string;
    run_app: string;
    linting: string;
    testing: string;
  };
}

interface StreamingAnalysisState {
  isAnalyzing: boolean;
  progress: number;
  currentStep: number;
  progressUpdates: AnalysisProgressUpdate[];
  results: AnalysisResults | null;
  error: string | null;
}

export const useStreamingAnalysis = () => {
  const [state, setState] = useState<StreamingAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    currentStep: 0,
    progressUpdates: [],
    results: null,
    error: null,
  });

  const startAnalysis = useCallback(async (agentId: string, owner: string, repo: string) => {
    setState({
      isAnalyzing: true,
      progress: 0,
      currentStep: 1,
      progressUpdates: [],
      results: null,
      error: null,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/analyze-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          agent_id: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'error') {
                setState(prev => ({
                  ...prev,
                  isAnalyzing: false,
                  error: data.error,
                }));
                return;
              }
              
              if (data.type === 'final_result') {
                setState(prev => ({
                  ...prev,
                  isAnalyzing: false,
                  results: data.data,
                  progress: 100,
                }));
                return;
              }
              
              if (data.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  isAnalyzing: false,
                }));
                return;
              }

              // Handle progress update
              if (data.step && data.status) {
                setState(prev => ({
                  ...prev,
                  currentStep: data.step,
                  progress: data.progress_percentage || prev.progress,
                  progressUpdates: [...prev.progressUpdates, data],
                }));
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming analysis error:', error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      progress: 0,
      currentStep: 0,
      progressUpdates: [],
      results: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startAnalysis,
    reset,
  };
}; 