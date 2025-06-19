import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Enter your markdown content here...'
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className={`markdown-editor ${className}`}>
      <div className="editor-tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="markdown-textarea"
            rows={15}
          />
        ) : (
          <div className="markdown-preview">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="preview-empty">Nothing to preview yet. Switch to Edit tab to add content.</p>
            )}
          </div>
        )}
      </div>

      <div className="editor-help">
        <details>
          <summary>Markdown Help</summary>
          <div className="help-content">
            <p><strong>Headers:</strong> # H1, ## H2, ### H3</p>
            <p><strong>Bold:</strong> **bold text**</p>
            <p><strong>Code:</strong> `inline code` or ```code block```</p>
            <p><strong>Lists:</strong> - item or 1. item</p>
            <p><strong>Links:</strong> [text](url)</p>
            <p><strong>Quotes:</strong> &gt; quote text</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default MarkdownEditor;
