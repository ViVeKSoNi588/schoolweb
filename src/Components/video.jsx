import { useState, useEffect } from 'react';
import API_URL from '../config';

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/videos`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
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
        return (
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false`}
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
        
        return (
          <video
            src={videoSrc}
            title={video.title}
            className="w-full h-full rounded-lg object-contain bg-black"
            controls
            poster={video.thumbnail || ''}
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
