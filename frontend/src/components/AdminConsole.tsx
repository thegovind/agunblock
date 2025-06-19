import React, { useState } from 'react';
import { Agent } from '../types/agent';
import { Topic, Resource, ContentItem } from '../types/content';
import agents from '../data/agents';
import TopicCard from './ui/TopicCard';
import CreateEditDialog from './ui/CreateEditDialog';

interface AdminConsoleProps {}

const AdminConsole: React.FC<AdminConsoleProps> = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'topics' | 'resources'>('agents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Agent | ContentItem | null>(null);
  
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: 'Getting Started with AI Agents',
      description: 'A comprehensive guide to understanding and implementing AI agents in your development workflow.',
      content: '# Getting Started with AI Agents\n\nAI agents are transforming how we approach software development...',
      category: 'guide',
      tags: ['ai', 'agents', 'getting-started'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      published: true
    },
    {
      id: '2',
      title: 'Best Practices for Code Completion',
      description: 'Learn how to maximize productivity with AI-powered code completion tools.',
      content: '# Best Practices for Code Completion\n\nCode completion tools can significantly boost your productivity...',
      category: 'best-practices',
      tags: ['code-completion', 'productivity', 'tips'],
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      published: true
    }
  ]);

  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Devin API Documentation',
      description: 'Complete API reference for integrating with Devin AI agent.',
      content: '# Devin API Documentation\n\n## Authentication\n\nTo authenticate with the Devin API...',
      type: 'documentation',
      url: 'https://docs.devin.ai/api',
      tags: ['devin', 'api', 'documentation'],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-10T09:00:00Z',
      published: true
    }
  ]);

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'agents':
        return agents;
      case 'topics':
        return topics;
      case 'resources':
        return resources;
      default:
        return [];
    }
  };

  const getFilteredItems = () => {
    const items = getCurrentItems();
    return items.filter(item => {
      const title = 'title' in item ? item.title : 'name' in item ? item.name : '';
      const matchesSearch = title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === 'agents') {
        const agent = item as Agent;
        const matchesCategory = filterCategory === 'all' || agent.category === filterCategory;
        return matchesSearch && matchesCategory;
      }
      
      if (activeTab === 'topics') {
        const topic = item as Topic;
        const matchesCategory = filterCategory === 'all' || topic.category === filterCategory;
        return matchesSearch && matchesCategory;
      }
      
      if (activeTab === 'resources') {
        const resource = item as Resource;
        const matchesCategory = filterCategory === 'all' || resource.type === filterCategory;
        return matchesSearch && matchesCategory;
      }
      
      return matchesSearch;
    });
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (item: Agent | ContentItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: Agent | ContentItem) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'topics') {
        setTopics(topics.filter(t => t.id !== item.id));
      } else if (activeTab === 'resources') {
        setResources(resources.filter(r => r.id !== item.id));
      }
    }
  };

  const handleSave = (item: Agent | ContentItem) => {
    if (activeTab === 'topics') {
      const topic = item as Topic;
      if (selectedItem) {
        setTopics(topics.map(t => t.id === topic.id ? topic : t));
      } else {
        setTopics([...topics, { ...topic, id: Date.now().toString() }]);
      }
    } else if (activeTab === 'resources') {
      const resource = item as Resource;
      if (selectedItem) {
        setResources(resources.map(r => r.id === resource.id ? resource : r));
      } else {
        setResources([...resources, { ...resource, id: Date.now().toString() }]);
      }
    }
    
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const getCategoryOptions = () => {
    switch (activeTab) {
      case 'agents':
        return [
          { value: 'all', label: 'All Categories' },
          { value: 'code-completion', label: 'Code Completion' },
          { value: 'async-swe', label: 'Async SWE' },
          { value: 'cli', label: 'CLI Tools' },
          { value: 'devops', label: 'DevOps' }
        ];
      case 'topics':
        return [
          { value: 'all', label: 'All Categories' },
          { value: 'guide', label: 'Guides' },
          { value: 'best-practices', label: 'Best Practices' },
          { value: 'tutorial', label: 'Tutorials' }
        ];
      case 'resources':
        return [
          { value: 'all', label: 'All Types' },
          { value: 'documentation', label: 'Documentation' },
          { value: 'tutorial', label: 'Tutorial' },
          { value: 'guide', label: 'Guide' },
          { value: 'reference', label: 'Reference' }
        ];
      default:
        return [{ value: 'all', label: 'All' }];
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="admin-console">
      <div className="admin-header">
        <h1>Admin Console</h1>
        <p>Manage agents, topics, and resources</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          Agents ({agents.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          Topics ({topics.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources ({resources.length})
        </button>
      </div>

      <div className="admin-controls">
        <div className="search-filter-row">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {getCategoryOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {activeTab !== 'agents' && (
            <button 
              className="create-button"
              onClick={handleCreate}
            >
              Create New {activeTab.slice(0, -1)}
            </button>
          )}
        </div>
      </div>

      <div className="admin-grid">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab} found matching your criteria.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <TopicCard
              key={item.id}
              item={item}
              type={activeTab}
              onEdit={() => handleEdit(item)}
              onDelete={activeTab !== 'agents' ? () => handleDelete(item) : undefined}
            />
          ))
        )}
      </div>

      {isCreateDialogOpen && (
        <CreateEditDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={handleSave}
          type={activeTab}
          item={null}
        />
      )}

      {isEditDialogOpen && selectedItem && (
        <CreateEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSave}
          type={activeTab}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default AdminConsole;
