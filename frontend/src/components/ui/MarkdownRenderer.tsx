import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className, style }) => {
  const renderMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 style="color: #4ade80; font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #00bcf2; font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem 0; border-bottom: 2px solid rgba(0,188,242,0.3); padding-bottom: 0.5rem;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #ffffff; font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem 0;">$1</h1>')
      .replace(/^#### (.*$)/gm, '<h4 style="color: #e5e5e5; font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem 0;">$1</h4>')
      .replace(/^##### (.*$)/gm, '<h5 style="color: #e5e5e5; font-size: 1rem; font-weight: 600; margin: 1rem 0 0.5rem 0;">$1</h5>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff; font-weight: 600;">$1</strong>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: #0f0f0f; color: #4ade80; padding: 1rem; border-radius: 8px; margin: 1rem 0; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); font-family: Monaco, Consolas, \'Liberation Mono\', \'Courier New\', monospace; line-height: 1.4;"><code>$1</code></pre>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.1); color: #4ade80; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: Monaco, Consolas, \'Liberation Mono\', \'Courier New\', monospace; font-size: 0.9em;">$1</code>')
      
      // Lists
      .replace(/^[\s]*-[\s]+(.*$)/gm, '<li style="margin: 0.5rem 0; padding-left: 0.5rem; color: #e5e5e5;">$1</li>')
      .replace(/^[\s]*\*[\s]+(.*$)/gm, '<li style="margin: 0.5rem 0; padding-left: 0.5rem; color: #e5e5e5;">$1</li>')
      .replace(/^[\s]*\d+\.[\s]+(.*$)/gm, '<li style="margin: 0.5rem 0; padding-left: 0.5rem; color: #e5e5e5; list-style-type: decimal;">$1</li>')
      
      // Wrap consecutive list items in ul tags
      .replace(/(<li[^>]*>.*<\/li>)\s*(?=<li)/g, '$1')
      .replace(/(<li[^>]*>.*?<\/li>)(?!\s*<li)/g, '<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc; color: #e5e5e5;">$1</ul>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #00bcf2; text-decoration: none; border-bottom: 1px solid rgba(0,188,242,0.3); transition: all 0.2s ease;">$1</a>')
      
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      
      // Clean up any remaining markdown artifacts
      .replace(/^\s*---\s*$/gm, '<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem 0;">')
      
      // Blockquotes
      .replace(/^>\s*(.*$)/gm, '<blockquote style="border-left: 4px solid #00bcf2; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #cccccc; background: rgba(0,188,242,0.05); padding: 1rem; border-radius: 0 8px 8px 0;">$1</blockquote>');
  };

  return (
    <div 
      className={className}
      style={{
        lineHeight: '1.6',
        color: '#e5e5e5',
        ...style
      }}
      dangerouslySetInnerHTML={{ 
        __html: renderMarkdown(content) 
      }}
    />
  );
};

export default MarkdownRenderer; 