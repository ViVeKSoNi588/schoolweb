import { useState, useEffect } from 'react';
import Navbar from './nav';
import API_URL from '../config';

// Calculate current academic year (June-May cycle)
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  // If current month is June or later, academic year is current-next
  // Otherwise, it's previous-current
  if (month >= 6) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
};

function VideoGallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [loading, setLoading] = useState(true);
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
      video.muted = true; // Mute to allow autoplay if needed
      video.preload = 'metadata';

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = 1; // Seek to 1 second after metadata is loaded
      });

      video.addEventListener('seeked', () => {
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
          resolve('/video-placeholder.jpg');
        } finally {
          video.remove();
        }
      });

      video.addEventListener('error', () => {
        console.error('Error loading video for thumbnail');
        video.remove();
        resolve('/video-placeholder.jpg');
      });

      // Timeout fallback
      setTimeout(() => {
        video.remove();
        resolve('/video-placeholder.jpg');
      }, 5000);
    });
  };

  // Handle body scroll lock when video modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedVideo]);

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (selectedYear !== 'all') {
          params.append('year', selectedYear);
        }
        const url = `${API_URL}/video-gallery${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        setGalleryVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedCategory, selectedYear]);

  // Video categories
  const categories = [
    { id: 'all', name: 'All Videos', icon: '🎬' },
    { id: 'events', name: 'School Events', icon: '🎉' },
    { id: 'sports', name: 'Sports Day', icon: '⚽' },
    { id: 'Republic', name: 'Republic Day', icon: '🎭' },
    { id: 'classroom', name: 'Classroom Activities', icon: '📚' },
    { id: 'campus', name: 'Campus Tour', icon: '🏫' },
  ];

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
    if (urlLower.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) return 'direct';
    
    return 'direct';
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

    // YouTube thumbnail - get frame at 1 second
    if (platform === 'youtube') {
      const videoId = getYouTubeId(url);
      // Use frame 1 (approximately 1 second into the video)
      return videoId ? `https://img.youtube.com/vi/${videoId}/1.jpg` : '/video-placeholder.jpg';
    }
    
    // Vimeo thumbnail - get frame at 1 second
    if (platform === 'vimeo') {
      const vimeoId = getVimeoId(url);
      if (vimeoId) {
        // Use vumbnail service with time parameter (1 second)
        return `https://vumbnail.com/${vimeoId}.jpg?t=1`;
      }
    }
    
    // Instagram thumbnail (using embed screenshot service)
    if (platform === 'instagram') {
      const instaMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?]+)/);
      if (instaMatch) {
        // Use Instagram's image endpoint
        return `https://www.instagram.com/p/${instaMatch[1]}/media/?size=l`;
      }
    }
    
    // For direct videos, check if we have a generated thumbnail
    if (platform === 'direct' || platform === 'url') {
      if (generatedThumbnails[video._id]) {
        return generatedThumbnails[video._id];
      }
      // Return custom thumbnail or placeholder while generating
      return video.thumbnail || '/video-placeholder.jpg';
    }
    
    // For other platforms or if we have a custom thumbnail
    return video.thumbnail || '/video-placeholder.jpg';
  };

  // VideoThumbnail component to handle async loading
  const VideoThumbnail = ({ video }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(getVideoThumbnail(video));
    const [isLoading, setIsLoading] = useState(false);
    const platform = video.type || detectPlatform(video.src);

    useEffect(() => {
      // Generate thumbnail for direct videos if not already generated
      if ((platform === 'direct' || platform === 'url') && !generatedThumbnails[video._id] && !video.thumbnail) {
        setIsLoading(true);
        generateVideoThumbnail(video.src, video._id).then((thumbnail) => {
          setThumbnailUrl(thumbnail);
          setIsLoading(false);
        });
      }
    }, [video._id, video.src, video.thumbnail, platform]);

    return (
      <>
        <img
          src={thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        
        {/* Fallback Icon */}
        <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <span className="text-6xl">🎬</span>
        </div>

        {/* Loading indicator for thumbnail generation */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </>
    );
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const navigateVideo = (direction) => {
    const currentIndex = galleryVideos.findIndex(vid => vid._id === selectedVideo._id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex === galleryVideos.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? galleryVideos.length - 1 : currentIndex - 1;
    }
    setSelectedVideo(galleryVideos[newIndex]);
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
        let videoSrc = url;
        
        if (video.type === 'uploaded' && url.startsWith('/uploads')) {
          videoSrc = `${API_URL.replace('/api', '')}${url}`;
        } else if (url.startsWith('data:video/')) {
          videoSrc = url;
        }
        
        return (
          <video
            src={videoSrc}
            title={video.title}
            className="w-full h-full rounded-lg object-contain bg-black"
            controls
            autoPlay
            poster={video.thumbnail || ''}
          >
            Your browser does not support the video tag.
          </video>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-200 text-sm font-semibold px-5 py-2 rounded-full mb-6 border border-white/20">
            🎬 SCHOOL MOMENTS
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Video <span className="text-yellow-400">Gallery</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto">
            Watch the vibrant moments and cherished memories from our school's journey
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Year Selector */}
          <div className="flex justify-center mb-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Years</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
          {/* Category Selector */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-900 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading videos...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryVideos.map((video, index) => (
                <div
                  key={video._id}
                  onClick={() => openVideoModal(video)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Video Thumbnail */}
                  <VideoThumbnail video={video} />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-semibold text-lg mb-1">{video.title}</h3>
                      {video.category && (
                        <span className="text-blue-300 text-sm capitalize">{video.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {galleryVideos.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No videos in this category</h3>
                <p className="text-gray-500">Check back later for new videos!</p>
              </div>
            )}

            {/* Video Count */}
            {galleryVideos.length > 0 && (
              <div className="text-center mt-8">
                <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
                  Showing {galleryVideos.length} videos
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeVideoModal}
        >
          {/* Close Button */}
          <button
            onClick={closeVideoModal}
            className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          {galleryVideos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateVideo('prev'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateVideo('next'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Video Container */}
          <div 
            className="max-w-5xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              {renderVideo(selectedVideo)}
            </div>
            <div className="text-center mt-4">
              <h3 className="text-white text-xl font-semibold">{selectedVideo.title}</h3>
              {selectedVideo.category && (
                <p className="text-gray-400 capitalize">{selectedVideo.category}</p>
              )}
              {selectedVideo.description && (
                <p className="text-gray-500 mt-2 text-sm">{selectedVideo.description}</p>
              )}
            </div>
          </div>

          {/* Keyboard Navigation Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-sm hidden md:block">
            Use ← → arrows to navigate • Press ESC to close
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Vatsalya International School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default VideoGallery;
