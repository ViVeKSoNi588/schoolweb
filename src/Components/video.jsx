import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatedVideos, setActivatedVideos] = useState(new Set());
  const [generatedThumbnails, setGeneratedThumbnails] = useState({});

  // Generate thumbnail from direct video URL
  const generateVideoThumbnail = async (videoUrl, videoId) => {
    // Check if already generated
    if (generatedThumbnails[videoId]) {
      return generatedThumbnails[videoId];
    }

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.currentTime = 1; // Seek to 1 second

      video.addEventListener('loadeddata', () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          
          // Cache the generated thumbnail
          setGeneratedThumbnails(prev => ({ ...prev, [videoId]: thumbnail }));
          
          resolve(thumbnail);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          resolve(null);
        } finally {
          video.remove();
        }
      });

      video.addEventListener('error', () => {
        console.error('Error loading video for thumbnail');
        video.remove();
        resolve(null);
      });

      // Timeout fallback
      setTimeout(() => {
        video.remove();
        resolve(null);
      }, 5000);
    });
  };

  const activateVideo = useCallback((id) => {
    setActivatedVideos(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

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

  // Get video thumbnail
  const getVideoThumbnail = (video) => {
    const url = video.src || video.url;
    const platform = video.type || detectPlatform(url);

    // YouTube thumbnail - frame at 1 second
    if (platform === 'youtube') {
      const videoId = getYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/1.jpg` : null;
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
    
    // For direct videos, check if we have a generated thumbnail
    if (platform === 'direct' || platform === 'url' || platform === 'uploaded') {
      if (generatedThumbnails[video._id]) {
        return generatedThumbnails[video._id];
      }
      return video.thumbnail || null;
    }
    
    return video.thumbnail || null;
  };

  // DirectVideoThumbnail component for direct videos
  const DirectVideoThumbnail = ({ video, onClick }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(getVideoThumbnail(video));
    const [isLoading, setIsLoading] = useState(false);
    const platform = video.type || detectPlatform(video.src);

    useEffect(() => {
      // Generate thumbnail for direct videos if not already generated
      if ((platform === 'direct' || platform === 'url' || platform === 'uploaded') && !generatedThumbnails[video._id] && !video.thumbnail) {
        setIsLoading(true);
        let videoSrc = video.src;
        if (video.type === 'uploaded' && video.src.startsWith('/uploads')) {
          videoSrc = `${API_URL.replace('/api', '')}${video.src}`;
        }
        generateVideoThumbnail(videoSrc, video._id).then((thumbnail) => {
          if (thumbnail) {
            setThumbnailUrl(thumbnail);
          }
          setIsLoading(false);
        });
      }
    }, [video._id, video.src, video.thumbnail, video.type, platform]);

    if (!thumbnailUrl && !isLoading) {
      return null; // Let video element use its own poster
    }

    return (
      <button
        className="absolute inset-0 w-full h-full bg-black cursor-pointer group"
        onClick={onClick}
        aria-label={`Play ${video.title}`}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-200"
          />
        )}
        {/* Play button overlay */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {/* Loading indicator */}
        {isLoading && (
          <span className="absolute top-2 right-2">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
        )}
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
              <video
                src={videoSrc}
                title={video.title}
                className="w-full h-full rounded-lg object-contain bg-black"
                preload="none"
                poster={video.thumbnail || ''}
              >
                Your browser does not support the video tag.
              </video>
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
            poster={getVideoThumbnail(video) || video.thumbnail || ''}
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
