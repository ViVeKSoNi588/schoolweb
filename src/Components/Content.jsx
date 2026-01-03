import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

// Reusable Content component
// Usage: <Content id="unique_content_id" />
// Add content in Admin Panel -> Database -> sitecontents collection

function Content({ id, className = '' }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/content/${id}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id, fetchContent]);

  if (loading) {
    return <div className="animate-pulse text-gray-400 text-sm">Loading...</div>;
  }

  if (!content || (!content.title && !content.content && (!content.items || content.items.length === 0))) {
    return null; // Don't render anything if no content
  }

  return (
    <div className={`bg-white rounded-xl p-6 text-center ${className}`}>
      {content.title && (
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{content.title}</h2>
      )}
      {content.content && (
        <p className="text-lg text-gray-600 mb-4 whitespace-pre-line">{content.content}</p>
      )}
      {content.items && content.items.length > 0 && (
        <ul className="space-y-3 inline-block text-left">
          {content.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700 text-lg">
              <span className="text-blue-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Content;
