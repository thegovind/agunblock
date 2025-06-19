export interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'documentation' | 'tutorial' | 'guide' | 'reference';
  url?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export type ContentItem = Topic | Resource;
