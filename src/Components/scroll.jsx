import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

// Default placeholder images if none from database
const DEFAULT_IMAGES = [
  { src: 'https://picsum.photos/1200/400?random=1', alt: 'School Image 1' },
  { src: 'https://picsum.photos/1200/400?random=2', alt: 'School Image 2' },
  { src: 'https://picsum.photos/1200/400?random=3', alt: 'School Image 3' },
  { src: 'https://picsum.photos/1200/400?random=4', alt: 'School Image 4' },
];

function ImageCarousel({ interval = 3000, category = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState(DEFAULT_IMAGES);

  // Fetch images from MongoDB
  useEffect(() => {
    const fetchImages = async () => {
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
    <div className="relative w-full overflow-hidden shadow-lg">
      {/* Images Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
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
