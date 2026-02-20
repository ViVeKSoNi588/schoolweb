import { useState, useEffect, useCallback, useMemo } from 'react';
import API_URL from '../config';

// Get base URL without /api for static files
const BASE_URL = API_URL.replace('/api', '');

const DEFAULT_IMAGES = [
  { src: 'https://picsum.photos/1200/400?random=1', alt: 'Placeholder 1' },
  { src: 'https://picsum.photos/1200/400?random=2', alt: 'Placeholder 2' },
];

function ImageCarousel({ interval = 3000, category = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());

  /**
   * ROOT CAUSE FIX: URL Normalizer
   * This function identifies if the link is Google Drive, External, or Local
   * and formats it correctly BEFORE the browser tries to request it.
   */
  const cleanImageUrl = useCallback((image) => {
    if (!image) return '';
    
    // Check all possible field names from MongoDB
    let path = image.src || image.url || image.imageUrl || '';
    if (!path) return '';

    // 1. Handle Google Drive Links
    if (path.includes('drive.google.com')) {
      // Extracts the File ID whether it's /d/ID/view or ?id=ID
      const regExp = /(?:id=|\/d\/)([\w-]+)/;
      const match = path.match(regExp);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }

    // 2. Handle Absolute URLs (http/https) or Base64
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path;
    }

    // 3. Handle Relative Local Paths (e.g., /uploads/image.jpg)
    // Ensures we don't double-slash
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${cleanBase}${cleanPath}`;
  }, []);

  // Pre-calculate URLs to avoid recalculating on every render
  const formattedImages = useMemo(() => {
    return images.map(img => ({
      ...img,
      displayUrl: cleanImageUrl(img)
    }));
  }, [images, cleanImageUrl]);

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  // Fetch from MongoDB
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const url = category 
          ? `${API_URL}/images?category=${category}` 
          : `${API_URL}/images`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setImages(data);
          }
        }
      } catch (error) {
        console.error('Fetch error, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [category]);

  // Auto-scroll
  useEffect(() => {
    if (formattedImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === formattedImages.length - 1 ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [formattedImages.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? formattedImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === formattedImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden shadow-lg bg-gray-900 ">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Track */}
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {formattedImages.map((image, index) => (
          <div key={image._id || index} className="min-w-full flex items-center justify-center relative bg-black">
            {/* Skeleton for individual image loading */}
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <span className="text-gray-600 text-xs">Loading Image...</span>
              </div>
            )}
            
            <img
              src={image.displayUrl}
              alt={image.alt || 'Carousel Image'}
              loading={index === 0 ? 'eager' : 'lazy'}
              onLoad={() => handleImageLoad(index)}
              className={`w-full object-cover transition-opacity duration-500 ${
                loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ minHeight: '400px', maxHeight: '500px' }}
            />
          </div>
        ))}
      </div>

      {/* Navigation UI */}
      {formattedImages.length > 1 && (
        <>
          <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all z-10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all z-10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
            {formattedImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 transition-all rounded-full ${index === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;