import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

const CACHE_KEY = 'vat_videos_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return data;
  } catch { return null; }
}
function setCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatedVideos, setActivatedVideos] = useState(new Set());

  const activateVideo = useCallback((id) => {
    setActivatedVideos(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const cached = getCache();
    if (cached) { setVideos(cached); setLoading(false); return; }
    fetch(`${API_URL}/videos`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setVideos(data); setCache(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Detect video platform from URL
  const detectPlatform = (url) => {
    if (!url) return 'unknown';
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'facebook';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('vimeo.com')) return 'vimeo';
    if (urlLower.includes('dailymotion.com')) return 'dailymotion';
    if (urlLower.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) return 'direct';
    
    return 'direct'; // Default to direct for unknown URLs
  };

  // Get Vimeo video ID
  const getVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  // Get video thumbnail
  const getVideoThumbnail = (video) => {
    const url = video.src || video.url;
    const platform = video.type || detectPlatform(url);

    // YouTube thumbnail - use mqdefault for better quality
    if (platform === 'youtube') {
      const videoId = getYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }
    
    // Vimeo thumbnail - frame at 1 second
    if (platform === 'vimeo') {
      const vimeoId = getVimeoId(url);
      return vimeoId ? `https://vumbnail.com/${vimeoId}.jpg?t=1` : null;
    }
    
    // Instagram thumbnail
    if (platform === 'instagram') {
      const instaMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?]+)/);
      return instaMatch ? `https://www.instagram.com/p/${instaMatch[1]}/media/?size=l` : null;
    }
    
    // For direct/uploaded videos, use stored thumbnail only (no client-side generation)
    if (platform === 'direct' || platform === 'url' || platform === 'uploaded') {
      return video.thumbnail || null;
    }
    
    return video.thumbnail || null;
  };

  // DirectVideoThumbnail — no video download, static placeholder only
  const DirectVideoThumbnail = ({ video, onClick }) => {
    const thumbnailUrl = getVideoThumbnail(video);
    return (
      <button
        className="absolute inset-0 w-full h-full bg-black cursor-pointer group"
        onClick={onClick}
        aria-label={`Play ${video.title}`}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>
    );
  };

  // Render video based on type/platform
  const renderVideo = (video) => {
    if (!video) return null;

    const url = video.src || video.url;
    if (!url) return <p className="text-red-400 text-sm p-2">No video URL</p>;

    const platform = video.type || detectPlatform(url);

    switch (platform) {
      case 'youtube': {
        const videoId = getYouTubeId(url);
        if (!videoId) return <p className="text-red-400 text-sm p-2">Invalid YouTube URL</p>;
        if (!activatedVideos.has(video._id)) {
          // Show lightweight thumbnail facade instead of loading the full iframe
          const thumbnailUrl = getVideoThumbnail(video);
          return (
            <button
              className="relative w-full h-full bg-black rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => activateVideo(video._id)}
              aria-label={`Play ${video.title}`}
            >
              <img
                src={thumbnailUrl}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
              />
              {/* Play button overlay */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          );
        }
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
            title={video.title}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      case 'facebook': {
        const encodedUrl = encodeURIComponent(url);
        if (!activatedVideos.has(video._id)) {
          return (
            <button
              className="relative w-full h-full bg-[#1877F2] rounded-lg overflow-hidden cursor-pointer group flex flex-col items-center justify-center gap-2"
              onClick={() => activateVideo(video._id)}
              aria-label={`Play ${video.title}`}
            >
              {/* Facebook logo */}
              <svg className="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              <span className="text-white text-xs font-medium opacity-80">Click to play</span>
              <span className="absolute bottom-2 right-2 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          );
        }
        return (
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=1`}
            title={video.title}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      }

      case 'instagram': {
        const instaMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?]+)/);
        if (instaMatch) {
          if (!activatedVideos.has(video._id)) {
            return (
              <button
                className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer group flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                onClick={() => activateVideo(video._id)}
                aria-label={`Play ${video.title}`}
              >
                {/* Instagram logo */}
                <svg className="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.497 5.783 2.226 7.149 2.163 8.415 2.105 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.013 7.053.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.053.013 8.333 0 8.741 0 12c0 3.259.013 3.668.072 4.948.085 1.856.601 3.698 1.942 5.039 1.341 1.341 3.183 1.857 5.039 1.942C8.333 23.987 8.741 24 12 24s3.667-.013 4.947-.072c1.856-.085 3.698-.601 5.039-1.942 1.341-1.341 1.857-3.183 1.942-5.039.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.667-.072-4.947-.085-1.856-.601-3.698-1.942-5.039C20.645.673 18.803.157 16.947.072 15.667.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="text-white text-xs font-medium opacity-80">Click to play</span>
                <span className="absolute bottom-2 right-2 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </button>
            );
          }
          return (
            <iframe
              src={`https://www.instagram.com/p/${instaMatch[1]}/embed`}
              title={video.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allowFullScreen
            />
          );
        }
        return <p className="text-red-400 text-sm p-2">Invalid Instagram URL</p>;
      }

      case 'vimeo': {
        const vimeoId = getVimeoId(url);
        if (!vimeoId) return <p className="text-red-400 text-sm p-2">Invalid Vimeo URL</p>;
        
        if (!activatedVideos.has(video._id)) {
          const thumbnailUrl = getVideoThumbnail(video);
          return (
            <button
              className="relative w-full h-full bg-black rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => activateVideo(video._id)}
              aria-label={`Play ${video.title}`}
            >
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                />
              )}
              {/* Play button overlay */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          );
        }
        
        return (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={video.title}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }

      case 'url':
      case 'direct':
      case 'uploaded':
      default: {
        // Handle different video sources
        let videoSrc = url;
        
        // For uploaded videos with file path, construct full URL
        if (video.type === 'uploaded' && url.startsWith('/uploads')) {
          videoSrc = `${API_URL.replace('/api', '')}${url}`;
        }
        // For legacy base64 videos, use as-is
        else if (url.startsWith('data:video/')) {
          videoSrc = url;
        }
        
        // If video hasn't been activated, show thumbnail facade
        if (!activatedVideos.has(video._id)) {
          return (
            <div className="relative w-full h-full bg-black">
              <DirectVideoThumbnail video={video} onClick={() => activateVideo(video._id)} />
            </div>
          );
        }
        
        return (
          <video
            src={videoSrc}
            title={video.title}
            className="w-full h-full rounded-lg object-contain bg-black"
            controls
            autoPlay
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        );
      }
    }
  };



  if (loading) {
    return (
      <div className="w-full py-8 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm">Loading videos...</div>
      </div>
    );
  }

  // Default welcome video for new school
  const defaultVideo = {
    _id: 'default',
    title: 'Welcome to Vatsalya International School',
    src: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    type: 'youtube',
    description: 'Discover our nurturing Pre-Primary program'
  };

  const displayVideos = videos.length > 0 ? videos : [defaultVideo];

  return (
    <div className="flex-shrink-0">
      <div className="flex flex-col gap-4">
        {displayVideos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Video Container */}
            <div className="relative w-72 h-40 bg-gray-900">
              {renderVideo(video)}
            </div>
            {/* Video Title */}
            {video.title && (
              <div className="p-2 bg-white">
                <p className="text-sm font-medium text-gray-800 truncate">{video.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoPlayer;
