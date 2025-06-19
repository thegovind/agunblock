import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import MarkdownEditor from './MarkdownEditor';
import { Agent } from '../../types/agent';
import { ContentItem } from '../../types/content';

interface CreateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Agent | ContentItem) => void;
  type: 'agents' | 'topics' | 'resources';
  item: Agent | ContentItem | null;
}

const CreateEditDialog: React.FC<CreateEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  item
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    } else {
      if (type === 'topics') {
        setFormData({
          title: '',
          description: '',
          content: '',
          category: 'guide',
          tags: [],
          published: false
        });
      } else if (type === 'resources') {
        setFormData({
          title: '',
          description: '',
          content: '',
          type: 'documentation',
          url: '',
          tags: [],
          published: false
        });
      } else if (type === 'agents') {
        setFormData({
          name: '',
          description: '',
          provider: '',
          category: 'code-completion',
          url: '',
          logo: '',
          getStarted: '',
          strengths: [],
          integration: '',
          prerequisites: [],
          setupSteps: [],
          useCases: [],
          bestFor: []
        });
      }
    }
  }, [item, type]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  const handleArrayChange = (field: string, value: string) => {
    const items = value.split('\n').map(item => item.trim()).filter(item => item);
    handleInputChange(field, items);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title && !formData.name) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description) {
      newErrors.description = 'Description is required';
    }

    if (type === 'topics' || type === 'resources') {
      if (!formData.content) {
        newErrors.content = 'Content is required';
      }
    }

    if (type === 'agents') {
      if (!formData.provider) {
        newErrors.provider = 'Provider is required';
      }
      if (!formData.url) {
        newErrors.url = 'URL is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const now = new Date().toISOString();
    const itemToSave = {
      ...formData,
      ...(item ? {} : { createdAt: now }),
      updatedAt: now
    };

    onSave(itemToSave);
  };

  const renderTopicFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category || 'guide'}
          onChange={(e) => handleInputChange('category', e.target.value)}
        >
          <option value="guide">Guide</option>
          <option value="best-practices">Best Practices</option>
          <option value="tutorial">Tutorial</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="ai, agents, getting-started"
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content *</label>
        <MarkdownEditor
          value={formData.content || ''}
          onChange={(value) => handleInputChange('content', value)}
          className={errors.content ? 'error' : ''}
        />
        {errors.content && <span className="error-message">{errors.content}</span>}
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.published || false}
            onChange={(e) => handleInputChange('published', e.target.checked)}
          />
          Published
        </label>
      </div>
    </>
  );

  const renderResourceFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          value={formData.type || 'documentation'}
          onChange={(e) => handleInputChange('type', e.target.value)}
        >
          <option value="documentation">Documentation</option>
          <option value="tutorial">Tutorial</option>
          <option value="guide">Guide</option>
          <option value="reference">Reference</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="url">External URL</label>
        <input
          id="url"
          type="url"
          value={formData.url || ''}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="devin, api, documentation"
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content *</label>
        <MarkdownEditor
          value={formData.content || ''}
          onChange={(value) => handleInputChange('content', value)}
          className={errors.content ? 'error' : ''}
        />
        {errors.content && <span className="error-message">{errors.content}</span>}
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.published || false}
            onChange={(e) => handleInputChange('published', e.target.checked)}
          />
          Published
        </label>
      </div>
    </>
  );

  const renderAgentFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="provider">Provider *</label>
        <input
          id="provider"
          type="text"
          value={formData.provider || ''}
          onChange={(e) => handleInputChange('provider', e.target.value)}
          className={errors.provider ? 'error' : ''}
        />
        {errors.provider && <span className="error-message">{errors.provider}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category || 'code-completion'}
          onChange={(e) => handleInputChange('category', e.target.value)}
        >
          <option value="code-completion">Code Completion</option>
          <option value="async-swe">Async SWE</option>
          <option value="cli">CLI Tools</option>
          <option value="devops">DevOps</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="url">URL *</label>
        <input
          id="url"
          type="url"
          value={formData.url || ''}
          onChange={(e) => handleInputChange('url', e.target.value)}
          className={errors.url ? 'error' : ''}
        />
        {errors.url && <span className="error-message">{errors.url}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="logo">Logo URL</label>
        <input
          id="logo"
          type="url"
          value={formData.logo || ''}
          onChange={(e) => handleInputChange('logo', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="getStarted">Get Started Text</label>
        <input
          id="getStarted"
          type="text"
          value={formData.getStarted || ''}
          onChange={(e) => handleInputChange('getStarted', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="strengths">Strengths (one per line)</label>
        <textarea
          id="strengths"
          value={formData.strengths?.join('\n') || ''}
          onChange={(e) => handleArrayChange('strengths', e.target.value)}
          rows={5}
          placeholder="Enter each strength on a new line"
        />
      </div>
    </>
  );

  const getTitle = () => {
    const action = item ? 'Edit' : 'Create';
    const itemType = type.slice(0, -1); // Remove 's' from end
    return `${action} ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      maxWidth="90vw"
    >
      <form onSubmit={handleSubmit} className="create-edit-form">
        {type === 'topics' && renderTopicFields()}
        {type === 'resources' && renderResourceFields()}
        {type === 'agents' && renderAgentFields()}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="save-button">
            {item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEditDialog;
