import { useState, useEffect } from 'react';
import Content from './Content';
import API_URL from '../config';

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
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
        if (data.length > 0) {
          setCurrentVideo(data[0]);
        }
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

  // Render video based on type
  const renderVideo = (video) => {
    if (!video) return null;

    if (video.type === 'youtube') {
      const videoId = getYouTubeId(video.src);
      if (!videoId) return <p className="text-red-400 text-sm">Invalid YouTube URL</p>;
      
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
    } else {
      // Uploaded video or direct URL
      return (
        <video
          src={video.src}
          title={video.title}
          className="w-full h-full rounded-lg object-contain bg-black"
          controls
          poster={video.thumbnail || ''}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  if (loading) {
    return (
      <div className="w-full py-8 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm">Loading videos...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null; // Don't show anything if no videos
  }

  return (
    <div className="flex-shrink-0">
      <div className="flex flex-col gap-4">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Video Container - Rectangle */}
            <div className="relative w-72 h-40 bg-gray-900">
              {currentVideo?._id === video._id ? (
                renderVideo(video)
              ) : (
                <div 
                  onClick={() => setCurrentVideo(video)}
                  className="w-full h-full cursor-pointer relative group"
                >
                  {/* Thumbnail */}
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : video.type === 'youtube' ? (
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(video.src)}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-3xl">🎥</span>
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-gray-800 text-sm ml-0.5">▶</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoPlayer;
