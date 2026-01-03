import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';

function BulletinBoard({ className = '' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Default announcements if none from database
  const defaultAnnouncements = [
    { _id: '1', title: 'Admissions Open', content: 'Admissions for 2026-27 academic year are now open!', type: 'important', date: new Date().toISOString() },
    { _id: '2', title: 'Annual Day', content: 'Annual Day celebration on 15th February 2026', type: 'event', date: new Date().toISOString() },
    { _id: '3', title: 'PTM Notice', content: 'Parent-Teacher Meeting scheduled for 20th January', type: 'notice', date: new Date().toISOString() },
    { _id: '4', title: 'Holiday Notice', content: 'School will remain closed on 26th January - Republic Day', type: 'holiday', date: new Date().toISOString() },
    { _id: '5', title: 'Sports Day', content: 'Inter-house Sports Competition on 10th February', type: 'event', date: new Date().toISOString() },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/content?collection=announcements`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setAnnouncements(data);
        } else {
          setAnnouncements(defaultAnnouncements);
        }
      } else {
        setAnnouncements(defaultAnnouncements);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setAnnouncements(defaultAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || announcements.length === 0) return;

    const scrollContainer = scrollRef.current;
    let animationId;
    let scrollSpeed = 0.5;

    const scroll = () => {
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollContainer.scrollTop = 0;
      } else {
        scrollContainer.scrollTop += scrollSpeed;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, announcements]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'important':
        return 'bg-red-50 border-l-red-500 text-red-800';
      case 'event':
        return 'bg-blue-50 border-l-blue-500 text-blue-800';
      case 'holiday':
        return 'bg-green-50 border-l-green-500 text-green-800';
      case 'notice':
        return 'bg-yellow-50 border-l-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-50 border-l-gray-500 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'important': return '🔴';
      case 'event': return '📅';
      case 'holiday': return '🎉';
      case 'notice': return '📢';
      default: return '📌';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h3 className="text-white font-bold">Notice Board</h3>
          <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            {announcements.length} Updates
          </span>
        </div>
      </div>

      {/* Scrolling Content */}
      <div
        ref={scrollRef}
        className="h-48 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="p-3 space-y-2">
          {/* Duplicate announcements for seamless loop */}
          {[...announcements, ...announcements].map((item, index) => (
            <div
              key={`${item._id}-${index}`}
              className={`p-3 rounded-lg border-l-4 ${getTypeStyles(item.type || 'notice')} transition-all hover:scale-[1.02] cursor-pointer`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm">{getTypeIcon(item.type || 'notice')}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-xs opacity-80 line-clamp-2">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t">
        <p className="text-xs text-gray-500 text-center">
          Hover to pause • Auto-scrolling
        </p>
      </div>
    </div>
  );
}

export default BulletinBoard;
