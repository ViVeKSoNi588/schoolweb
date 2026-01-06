import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

// Get base URL without /api for static files
const BASE_URL = API_URL.replace('/api', '');

// Default placeholder images if none from database
const DEFAULT_IMAGES = [
  { src: 'https://picsum.photos/1200/400?random=1', alt: 'School Image 1' },
  { src: 'https://picsum.photos/1200/400?random=2', alt: 'School Image 2' },
  { src: 'https://picsum.photos/1200/400?random=3', alt: 'School Image 3' },
  { src: 'https://picsum.photos/1200/400?random=4', alt: 'School Image 4' },
];

// Helper to get full image URL
const getImageUrl = (image) => {
  if (!image.src) return '';
  // If it's a full URL (http/https) or base64, return as-is
  if (image.src.startsWith('http') || image.src.startsWith('data:')) {
    return image.src;
  }
  // If it's a relative path (uploaded file), prepend base URL
  return `${BASE_URL}${image.src}`;
};

function ImageCarousel({ interval = 3000, category = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Track when an image loads
  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  // Preload images for smoother experience
  useEffect(() => {
    images.forEach((image, index) => {
      const img = new Image();
      img.onload = () => handleImageLoad(index);
      img.src = getImageUrl(image);
    });
  }, [images, handleImageLoad]);

  // Fetch images from MongoDB
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
          if (data.length > 0) {
            setImages(data);
          }
        }
      } catch {
        console.log('Using default images');
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [category]);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden shadow-lg bg-gray-900">
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/70 text-sm">Loading images...</p>
          </div>
        </div>
      )}

      {/* Images Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={image._id || index} className="min-w-full flex items-center justify-center relative">
            {/* Show skeleton while image loads */}
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <img
              src={getImageUrl(image)}
              alt={image.alt}
              className={`w-full h-auto transition-opacity duration-300 ${loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`}
              style={{ maxHeight: '70vh' }}
              loading="lazy"
              onLoad={() => handleImageLoad(index)}
            />
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-900 p-2 rounded-full shadow-md transition-all"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-900 p-2 rounded-full shadow-md transition-all"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;
