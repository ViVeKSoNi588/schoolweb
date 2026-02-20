import { useState, useEffect } from 'react';
import Navbar from './nav';
import API_URL from '../config';

// Get base URL without /api for static files
const BASE_URL = API_URL.replace('/api', '');

// Helper to get full image URL
const getImageUrl = (src) => {
  if (!src) return '';
  // If it's a full URL (http/https) or base64, return as-is
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  // If it's a relative path (uploaded file), prepend base URL
  return `${BASE_URL}${src}`;
};

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

function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState(getCurrentAcademicYear());
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle body scroll lock when lightbox is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  // Fetch gallery images from database
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (selectedYear !== 'all') {
          params.append('year', selectedYear);
        }
        const url = `${API_URL}/gallery${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        setGalleryImages(data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory, selectedYear]);

  // Gallery categories
  const categories = [
    { id: 'all', name: 'All Photos', icon: '📷' },
    { id: 'events', name: 'School Events', icon: '🎉' },
    { id: 'sports', name: 'Sports Day', icon: '⚽' },
    { id: 'cultural', name: 'Cultural Programs', icon: '🎭' },
    { id: 'classroom', name: 'Classroom Activities', icon: '📚' },
    { id: 'campus', name: 'Campus', icon: '🏫' },
  ];

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const currentIndex = galleryImages.findIndex(img => img._id === selectedImage._id);
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    }
    setSelectedImage(galleryImages[newIndex]);
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
            📸 SCHOOL MEMORIES
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-yellow-400">Gallery</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto">
            Explore the vibrant moments and cherished memories from our school's journey
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

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading gallery...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={image._id}
                  onClick={() => openLightbox(image)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={getImageUrl(image.src)}
                    alt={image.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                      <span className="text-blue-300 text-sm capitalize">{image.category}</span>
                    </div>
                  </div>

                  {/* Zoom Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {galleryImages.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📷</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No photos in this category</h3>
                <p className="text-gray-500">Check back later for new photos!</p>
              </div>
            )}

            {/* Photo Count */}
            {galleryImages.length > 0 && (
              <div className="text-center mt-8">
                <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
                  Showing {galleryImages.length} photos
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Container */}
          <div 
            className="max-w-5xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(selectedImage.src)}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center mt-4">
              <h3 className="text-white text-xl font-semibold">{selectedImage.title}</h3>
              <p className="text-gray-400 capitalize">{selectedImage.category}</p>
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

export default Gallery;