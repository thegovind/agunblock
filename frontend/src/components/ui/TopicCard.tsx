import React from 'react';
import { Agent } from '../../types/agent';
import { Topic, Resource, ContentItem } from '../../types/content';

interface TopicCardProps {
  item: Agent | ContentItem;
  type: 'agents' | 'topics' | 'resources';
  onEdit: () => void;
  onDelete?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ item, type, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (item: ContentItem) => {
    if ('published' in item) {
      return (
        <span className={`status-badge ${item.published ? 'published' : 'draft'}`}>
          {item.published ? 'Published' : 'Draft'}
        </span>
      );
    }
    return null;
  };

  const getTags = (item: Agent | ContentItem) => {
    if (type === 'agents') {
      const agent = item as Agent;
      return agent.strengths?.slice(0, 3) || [];
    } else {
      const contentItem = item as ContentItem;
      return contentItem.tags || [];
    }
  };

  const getCategory = (item: Agent | ContentItem) => {
    if (type === 'agents') {
      const agent = item as Agent;
      return agent.category;
    } else if (type === 'topics') {
      const topic = item as Topic;
      return topic.category;
    } else if (type === 'resources') {
      const resource = item as Resource;
      return resource.type;
    }
    return '';
  };

  const getProvider = (item: Agent | ContentItem) => {
    if (type === 'agents') {
      const agent = item as Agent;
      return agent.provider;
    }
    return null;
  };

  const getUrl = (item: Agent | ContentItem) => {
    if (type === 'agents') {
      const agent = item as Agent;
      return agent.url;
    } else if (type === 'resources') {
      const resource = item as Resource;
      return resource.url;
    }
    return null;
  };

  return (
    <div className="topic-card">
      <div className="card-header">
        <div className="card-title-row">
          <h3 className="card-title">{'title' in item ? item.title : 'name' in item ? item.name : ''}</h3>
          {type !== 'agents' && getStatusBadge(item as ContentItem)}
        </div>
        <div className="card-meta">
          <span className="category-badge">{getCategory(item)}</span>
          {getProvider(item) && (
            <span className="provider-badge">{getProvider(item)}</span>
          )}
        </div>
      </div>

      <div className="card-content">
        <p className="card-description">{item.description}</p>
        
        {getUrl(item) && (
          <div className="card-url">
            <a href={getUrl(item)!} target="_blank" rel="noopener noreferrer">
              View External Link →
            </a>
          </div>
        )}

        <div className="card-tags">
          {getTags(item).slice(0, 4).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
          {getTags(item).length > 4 && (
            <span className="tag-more">+{getTags(item).length - 4} more</span>
          )}
        </div>

        {type !== 'agents' && (
          <div className="card-dates">
            <span className="date-info">
              Created: {formatDate((item as ContentItem).createdAt)}
            </span>
            <span className="date-info">
              Updated: {formatDate((item as ContentItem).updatedAt)}
            </span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button className="action-button edit-button" onClick={onEdit}>
          Edit
        </button>
        {onDelete && (
          <button className="action-button delete-button" onClick={onDelete}>
            Delete
          </button>
        )}
        {type === 'agents' && (
          <button className="action-button view-button">
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default TopicCard;
