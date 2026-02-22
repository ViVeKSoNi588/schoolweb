import { useState, useEffect } from 'react';
import API_URL from '../config';

function AdminPanel() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  
  // Database state
  const [activeTab, setActiveTab] = useState('database');
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [documents, setDocuments] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Image management
  const [newImage, setNewImage] = useState({ src: '', alt: '', order: 0, isActive: true, category: 'home' });
  const [editingImage, setEditingImage] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'upload'
  const [uploadPreview, setUploadPreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
  // Multiple image upload with metadata
  const [selectedImages, setSelectedImages] = useState([]); // Array of { data, name, size, alt, category, order, isActive }
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Video management
  const [newVideo, setNewVideo] = useState({ title: '', description: '', src: '', type: 'youtube', order: 0, isActive: true });
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoUploadMode, setVideoUploadMode] = useState('youtube'); // 'youtube', 'url', or 'upload'
  const [videoUploadPreview, setVideoUploadPreview] = useState('');
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Multiple video upload with metadata
  const [selectedVideos, setSelectedVideos] = useState([]); // Array of { data, name, size, title, description, order, isActive }
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Document management
  const [newDocument, setNewDocument] = useState('{}');
  const [editingDocument, setEditingDocument] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  // Import/Export
  const [importData, setImportData] = useState('');

  // Site Content Management (for sitecontents collection)
  const [newSiteContent, setNewSiteContent] = useState({ key: '', title: '', content: '', items: [], isActive: true });
  const [editingSiteContent, setEditingSiteContent] = useState(null);
  const [newItemInput, setNewItemInput] = useState('');

  // Feedback management
  const [feedbackFilter, setFeedbackFilter] = useState('all'); // 'all', 'unread', 'read'

  // Gallery management
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [galleryType, setGalleryType] = useState('photo'); // 'photo' or 'video'
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true, year: '2025-26' });
  const [newGalleryVideo, setNewGalleryVideo] = useState({ src: '', title: '', category: 'events', description: '', type: 'youtube', order: 0, isActive: true, year: '2025-26' });
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState(null);
  const [editingGalleryVideo, setEditingGalleryVideo] = useState(null);
  const [galleryUploadMode, setGalleryUploadMode] = useState('url'); // 'url' or 'upload'
  const [galleryUploadPreview, setGalleryUploadPreview] = useState('');
  const [galleryPhotoUploading, setGalleryPhotoUploading] = useState(false);
  const [galleryPhotoUploadProgress, setGalleryPhotoUploadProgress] = useState(0);
  
  // Multiple gallery uploads with metadata
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState([]); // Array of { data, name, size, title, description, category, year, order, isActive }
  const [currentGalleryPhotoIndex, setCurrentGalleryPhotoIndex] = useState(0);
  const [selectedGalleryVideos, setSelectedGalleryVideos] = useState([]); // Array of { data, name, size, title, description, category, year, type, order, isActive }
  const [currentGalleryVideoIndex, setCurrentGalleryVideoIndex] = useState(0);
  const [galleryVideoUploadMode, setGalleryVideoUploadMode] = useState('url'); // 'url' or 'upload'
  const [galleryVideoUploadPreview, setGalleryVideoUploadPreview] = useState('');
  const [galleryVideoUploading, setGalleryVideoUploading] = useState(false);
  const [galleryVideoUploadProgress, setGalleryVideoUploadProgress] = useState(0);
  const [galleryCategory, setGalleryCategory] = useState('all'); // filter for viewing

  // Curriculum management
  const [curriculumData, setCurriculumData] = useState([]);
  const [newCurriculum, setNewCurriculum] = useState({
    level: 'preprimary',
    title: '',
    age: '',
    description: '',
    subjects: [],
    streams: [],
    highlights: [],
    isActive: true,
    order: 0
  });
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const [newSubjectInput, setNewSubjectInput] = useState({ name: '', icon: '📚' });
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newStreamInput, setNewStreamInput] = useState('');

  // Annual Events management
  const [annualEvents, setAnnualEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    month: 'January',
    date: '',
    title: '',
    type: 'event',
    icon: '📅',
    description: '',
    isActive: true,
    order: 0
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventMonthFilter, setEventMonthFilter] = useState('all');

  // ============ REUSABLE COMPONENTS ============
  
  // Progress Bar Component
  const ProgressBar = ({ progress, label }) => (
    progress > 0 && (
      <div className="mt-2">
        <p className="text-gray-400 text-sm mb-1">{label || 'Uploading...'} {progress}%</p>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  );

  // Thumbnail Navigation Component
  const ThumbnailNav = ({ items, currentIndex, onClick, icon = '🖼️' }) => (
    <div className="grid grid-cols-6 gap-2 mt-3">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onClick(idx)}
          className={`aspect-square rounded p-2 flex flex-col items-center justify-center text-xs ${
            idx === currentIndex
              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {item.data?.startsWith('data:image') ? (
            <img src={item.data} alt="" className="w-full h-full object-cover rounded" />
          ) : (
            <>
              <div className="text-lg">{icon}</div>
              <div className="truncate w-full text-center">{idx + 1}</div>
            </>
          )}
        </button>
      ))}
    </div>
  );

  // Navigation Buttons Component
  const NavButtons = ({ currentIndex, total, onPrev, onNext }) => (
    <div className="flex gap-2">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );

  // Form Select Component
  const FormSelect = ({ value, onChange, options, className = "" }) => (
    <select
      value={value}
      onChange={onChange}
      className={`bg-gray-600 text-white p-2 rounded ${className}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  // Category Options
  const CATEGORY_OPTIONS = [
    { value: 'events', label: '🎉 School Events' },
    { value: 'sports', label: '⚽ Sports Day' },
    { value: 'cultural', label: '🎭 Cultural Programs' },
    { value: 'classroom', label: '📚 Classroom Activities' },
    { value: 'campus', label: '🏫 Campus Tour' },
    { value: 'other', label: '🎬 Other' }
  ];

  const YEAR_OPTIONS = [
    { value: '2025-26', label: '📅 2025-26' },
    { value: '2024-25', label: '📅 2024-25' },
    { value: '2023-24', label: '📅 2023-24' },
    { value: '2022-23', label: '📅 2022-23' }
  ];

  // ============ HELPER FUNCTIONS ============
  
  // Generic file upload handler
  const handleMultiFileSelect = async (e, fileType, maxCount, maxSize, existingItems, setItems, setCurrentIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > maxCount) {
      alert(`Maximum ${maxCount} files allowed at once`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      const isValid = fileType === 'image' ? file.type.startsWith('image/') : file.type.startsWith('video/');
      if (!isValid) {
        invalidFiles.push(`${file.name}: Invalid file type`);
        return;
      }
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name}: Exceeds ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      alert('Some files were skipped:\n' + invalidFiles.join('\n'));
    }
    if (validFiles.length === 0) return;

    // Read all valid files
    const promises = validFiles.map((file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            data: reader.result,
            name: file.name,
            size: file.size,
            title: file.name.split('.')[0] || `File ${index + 1}`,
            alt: file.name.split('.')[0] || `File ${index + 1}`,
            category: 'events',
            year: '2025-26',
            order: index,
            isActive: true,
            description: ''
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const filesData = await Promise.all(promises);
    setItems(filesData);
    setCurrentIndex(0);
    return filesData;
  };

  // Helper functions for fetching data
  const fetchCollections = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/admin/collections`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) setCollections(await res.json());
    } catch {
      // Error fetching collections
    }
  };

  const fetchStats = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) setDbStats(await res.json());
    } catch {
      // Error fetching stats
    }
  };

  // Fetch videos for video tab
  const fetchVideos = async () => {
    try {
      setVideosLoading(true);
      const res = await fetch(`${API_URL}/admin/videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        setSelectedCollection('videos');
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch videos:', errorData);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setVideosLoading(false);
    }
  };

  // Fetch gallery photos
  const fetchGalleryPhotos = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGalleryPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  // Fetch gallery videos
  const fetchGalleryVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/video-gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGalleryVideos(data);
      }
    } catch (error) {
      console.error('Error fetching video gallery:', error);
    }
  };

  // Fetch curriculum data
  const fetchCurriculum = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/curriculum`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurriculumData(data);
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    }
  };

  // Fetch annual events
  const fetchAnnualEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/annual-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnualEvents(data);
      }
    } catch (error) {
      console.error('Error fetching annual events:', error);
    }
  };

  // Verify token on mount and load data
  useEffect(() => {
    const verifyAndLoad = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setIsLoggedIn(true);
          setLoading(true);
          await Promise.all([
            fetchCollections(token),
            fetchStats(token)
          ]);
          setLoading(false);
        } else {
          localStorage.removeItem('adminToken');
          setToken('');
        }
      } catch {
        localStorage.removeItem('adminToken');
        setToken('');
      }
    };
    verifyAndLoad();
  }, [token]);

  // Auto-load videos when switching to videos tab
  useEffect(() => {
    if (activeTab === 'videos' && isLoggedIn && token) {
      fetchVideos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn, token]);

  // Auto-load gallery when switching to gallery tab
  useEffect(() => {
    if (activeTab === 'gallery' && isLoggedIn && token) {
      fetchGalleryPhotos();
      fetchGalleryVideos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn, token]);

  // Auto-load curriculum when switching to curriculum tab
  useEffect(() => {
    if (activeTab === 'curriculum' && isLoggedIn && token) {
      fetchCurriculum();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn, token]);

  // Auto-load annual events when switching to events tab
  useEffect(() => {
    if (activeTab === 'events' && isLoggedIn && token) {
      fetchAnnualEvents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn, token]);

  // Mark feedback as read
  const markFeedbackAsRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/feedback/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDocuments('feedbacks');
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    }
  };

  // Delete feedback
  const deleteFeedback = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/collections/feedbacks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDocuments('feedbacks');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  // Helper to calculate days until auto-delete
  const getDaysUntilDelete = (readAt) => {
    if (!readAt) return null;
    const readDate = new Date(readAt);
    const deleteDate = new Date(readDate);
    deleteDate.setMonth(deleteDate.getMonth() + 3);
    const now = new Date();
    const diffTime = deleteDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const fetchDocuments = async (collectionName) => {
    try {
      setSelectedCollection(collectionName);
      const res = await fetch(`${API_URL}/admin/collections/${collectionName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch {
      // Error fetching documents
    }
  };

  // Reload all data
  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCollections(token),
      fetchStats(token)
    ]);
    setLoading(false);
  };

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        loadAllData();
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch {
      setLoginError('Connection error. Make sure backend is running.');
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) setShowSetup(false);
    } catch {
      alert('Setup error. Make sure backend is running.');
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset admin account? You will need to set new credentials.')) return;
    try {
      const newUser = prompt('Enter new username:');
      const newPass = prompt('Enter new password:');
      if (!newUser || !newPass) return;
      
      const res = await fetch(`${API_URL}/admin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUser, password: newPass })
      });
      const data = await res.json();
      alert(data.message);
    } catch {
      alert('Reset error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setIsLoggedIn(false);
  };

  // File upload handler - supports single and multiple
  const handleFileSelect = async (e) => {
    const filesData = await handleMultiFileSelect(e, 'image', 20, 10 * 1024 * 1024, newImage, setSelectedImages, setCurrentImageIndex);
    if (!filesData || filesData.length === 0) return;
    if (filesData.length === 1) {
      setUploadPreview(filesData[0].data);
      setNewImage(prev => ({ ...prev, alt: filesData[0].alt }));
    } else {
      setUploadPreview('');
    }
  };

  // Video file upload handler - supports single and multiple
  const handleVideoFileSelect = async (e) => {
    const filesData = await handleMultiFileSelect(e, 'video', 10, 50 * 1024 * 1024, newVideo, setSelectedVideos, setCurrentVideoIndex);
    if (!filesData || filesData.length === 0) return;
    if (filesData.length === 1) {
      setVideoUploadPreview(filesData[0].data);
      setNewVideo(prev => ({ ...prev, title: filesData[0].title }));
    } else {
      setVideoUploadPreview('');
    }
  };

  // Gallery photos handler - supports single and multiple
  const handleGalleryPhotoFileSelect = async (e) => {
    const filesData = await handleMultiFileSelect(e, 'image', 20, 10 * 1024 * 1024, newGalleryPhoto, setSelectedGalleryPhotos, setCurrentGalleryPhotoIndex);
    if (!filesData || filesData.length === 0) return;
    if (filesData.length === 1) {
      setGalleryUploadPreview(filesData[0].data);
      setNewGalleryPhoto(prev => ({ ...prev, title: filesData[0].title, src: filesData[0].data }));
    } else {
      setGalleryUploadPreview('');
    }
  };

  // Gallery videos handler - supports single and multiple
  const handleGalleryVideoFileSelect = async (e) => {
    const filesData = await handleMultiFileSelect(e, 'video', 10, 50 * 1024 * 1024, newGalleryVideo, setSelectedGalleryVideos, setCurrentGalleryVideoIndex);
    if (!filesData || filesData.length === 0) return;
    if (filesData.length === 1) {
      setGalleryVideoUploadPreview(filesData[0].data);
      setNewGalleryVideo(prev => ({ ...prev, title: filesData[0].title, src: filesData[0].data }));
    } else {
      setGalleryVideoUploadPreview('');
    }
  };

  // Video thumbnail upload handler
  const handleVideoThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file for thumbnail');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Thumbnail size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image handlers
  const handleAddImage = async (e) => {
    e.preventDefault();
    try {
      // Check if uploading multiple images
      if (selectedImages.length > 0) {
        setImageUploading(true);
        
        // Prepare images array with their metadata
        const images = selectedImages.map(img => ({
          imageData: img.data,
          alt: img.alt,
          order: img.order,
          isActive: img.isActive,
          category: img.category
        }));

        const res = await fetch(`${API_URL}/admin/images/batch-upload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ images })
        });

        const data = await res.json();
        setImageUploading(false);
        
        if (res.ok) {
          alert(`✅ Upload complete!\nSuccessful: ${data.successful.length}\nFailed: ${data.failed.length}`);
          setSelectedImages([]);
          setCurrentImageIndex(0);
          fetchDocuments('images');
        } else {
          alert('Upload failed: ' + (data.message || 'Unknown error'));
        }
        return;
      }

      // Single image upload
      if (uploadMode === 'upload' && uploadPreview) {
        // Upload image file
        setImageUploading(true);
        const res = await fetch(`${API_URL}/admin/images/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            imageData: uploadPreview,
            alt: newImage.alt,
            order: newImage.order,
            isActive: newImage.isActive,
            category: newImage.category
          })
        });
        setImageUploading(false);
        if (res.ok) {
          setNewImage({ src: '', alt: '', order: 0, isActive: true, category: 'home' });
          setUploadPreview('');
          fetchDocuments('images');
        } else {
          const data = await res.json();
          alert(data.message || 'Upload failed');
        }
      } else {
        // URL mode
        const res = await fetch(`${API_URL}/admin/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newImage)
        });
        if (res.ok) {
          setNewImage({ src: '', alt: '', order: 0, isActive: true, category: 'home' });
          fetchDocuments('images');
        }
      }
    } catch {
      setImageUploading(false);
      alert('Error adding image');
    }
  };

  const handleUpdateImage = async () => {
    try {
      await fetch(`${API_URL}/admin/images/${editingImage._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingImage)
      });
      setEditingImage(null);
      fetchDocuments('images');
    } catch {
      alert('Error updating image');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      await fetch(`${API_URL}/admin/images/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments('images');
    } catch {
      alert('Error deleting image');
    }
  };

  // Video handlers
  const handleAddVideo = async (e) => {
    e.preventDefault();
    
    // Check if uploading multiple videos
    if (selectedVideos.length > 0) {
      setVideoUploading(true);
      setUploadProgress(0);
      
      try {
        // Prepare videos array with their metadata
        const videos = selectedVideos.map(video => ({
          videoData: video.data,
          title: video.title,
          description: video.description,
          order: video.order,
          isActive: video.isActive
        }));

        const res = await fetch(`${API_URL}/admin/videos/batch-upload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ videos })
        });

        const data = await res.json();
        setVideoUploading(false);
        
        if (res.ok) {
          alert(`✅ Upload complete!\nSuccessful: ${data.successful.length}\nFailed: ${data.failed.length}`);
          setSelectedVideos([]);
          setCurrentVideoIndex(0);
          fetchVideos();
        } else {
          alert('Upload failed: ' + (data.message || 'Unknown error'));
        }
        return;
      } catch (error) {
        console.error('Batch upload error:', error);
        alert('Error uploading videos');
        setVideoUploading(false);
        return;
      }
    }

    // Single video upload - validate title is provided
    if (!newVideo.title || !newVideo.title.trim()) {
      alert('Please provide a video title');
      return;
    }
    
    setVideoUploading(true);
    setUploadProgress(0);
    
    try {
      if (videoUploadMode === 'upload' && videoUploadPreview) {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 500);
        
        // Upload video file
        const res = await fetch(`${API_URL}/admin/videos/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            videoData: videoUploadPreview,
            title: newVideo.title.trim(),
            description: newVideo.description || '',
            thumbnail: videoThumbnailPreview || null,
            order: newVideo.order || 0,
            isActive: newVideo.isActive !== false
          })
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        const data = await res.json();
        if (res.ok) {
          setNewVideo({ title: '', description: '', src: '', type: 'youtube', order: 0, isActive: true });
          setVideoUploadPreview('');
          setVideoThumbnailPreview('');
          fetchVideos();
          alert('Video uploaded successfully!');
        } else {
          alert('Upload failed: ' + (data.message || data.error || JSON.stringify(data)));
        }
      } else {
        // YouTube or URL mode
        if (!newVideo.src || !newVideo.src.trim()) {
          alert('Please provide a video URL');
          setVideoUploading(false);
          return;
        }
        
        const videoData = {
          title: newVideo.title.trim(),
          description: newVideo.description || '',
          src: newVideo.src.trim(),
          type: videoUploadMode,
          thumbnail: videoThumbnailPreview || null,
          order: newVideo.order || 0,
          isActive: newVideo.isActive !== false
        };
        
        const res = await fetch(`${API_URL}/admin/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(videoData)
        });
        const data = await res.json();
        if (res.ok) {
          setNewVideo({ title: '', description: '', src: '', type: 'youtube', order: 0, isActive: true });
          setVideoThumbnailPreview('');
          fetchVideos();
          alert('Video added successfully!');
        } else {
          alert('Failed to add video: ' + (data.message || data.error || JSON.stringify(data)));
        }
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video: ' + error.message);
    } finally {
      setVideoUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateVideo = async () => {
    try {
      console.log('Updating video:', editingVideo);
      const res = await fetch(`${API_URL}/admin/videos/${editingVideo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingVideo)
      });
      const data = await res.json();
      console.log('Update response:', res.status, data);
      if (res.ok) {
        alert('Video updated successfully!');
        setEditingVideo(null);
        fetchVideos();
      } else {
        alert('Failed to update video: ' + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating video: ' + error.message);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      console.log('Deleting video with ID:', id);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      const res = await fetch(`${API_URL}/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Delete response:', res.status, data);
      if (res.ok) {
        alert('Video deleted successfully!');
        fetchVideos();
      } else {
        alert('Failed to delete video: ' + (data.message || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting video: ' + error.message);
    }
  };

  // Extract YouTube video ID for thumbnail
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

  // Extract Vimeo video ID
  const getVimeoId = (url) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  // Extract Instagram ID
  const getInstagramId = (url) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?]+)/);
    return match ? match[1] : null;
  };

  // Get video thumbnail automatically
  const getVideoThumbnail = (video) => {
    if (!video || !video.src) return null;
    
    const url = video.src;
    const type = video.type;

    // YouTube thumbnail - frame at 1 second
    if (type === 'youtube') {
      const videoId = getYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/1.jpg` : null;
    }
    
    // Vimeo thumbnail - frame at 1 second
    if (type === 'vimeo') {
      const vimeoId = getVimeoId(url);
      return vimeoId ? `https://vumbnail.com/${vimeoId}.jpg?t=1` : null;
    }
    
    // Instagram thumbnail
    if (type === 'instagram') {
      const instaId = getInstagramId(url);
      return instaId ? `https://www.instagram.com/p/${instaId}/media/?size=l` : null;
    }
    
    // For direct videos, generate thumbnail from video
    if (type === 'direct' || type === 'url' || type === 'uploaded') {
      // If custom thumbnail exists, use it
      if (video.thumbnail) return video.thumbnail;
      
      // Otherwise, we'll need to generate it dynamically
      // For now, return null and let the fallback icon show
      return null;
    }
    
    // Return custom thumbnail if available
    return video.thumbnail || null;
  };

  // Collection handlers
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      await fetch(`${API_URL}/admin/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCollectionName })
      });
      setNewCollectionName('');
      fetchCollections();
    } catch (err) {
      console.error('Error creating collection:', err);
    }
  };

  const handleDropCollection = async (name) => {
    if (!confirm(`DROP collection "${name}"? This cannot be undone!`)) return;
    try {
      await fetch(`${API_URL}/admin/collections/${name}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCollection('');
      setDocuments([]);
      fetchCollections();
    } catch (err) {
      console.error('Error dropping collection:', err);
    }
  };

  // Document handlers
  const handleAddDocument = async () => {
    try {
      const doc = JSON.parse(newDocument);
      await fetch(`${API_URL}/admin/collections/${selectedCollection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(doc)
      });
      setNewDocument('{}');
      fetchDocuments(selectedCollection);
      fetchCollections();
    } catch {
      alert('Invalid JSON or error adding document');
    }
  };

  const handleUpdateDocument = async () => {
    try {
      const doc = JSON.parse(editingDocument.data);
      const res = await fetch(`${API_URL}/admin/collections/${selectedCollection}/${editingDocument._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(doc)
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Error: ' + (errorData.message || 'Failed to update'));
        return;
      }
      setEditingDocument(null);
      fetchDocuments(selectedCollection);
    } catch (err) {
      console.error('Update error:', err);
      alert('Invalid JSON or error updating document. Check console for details.');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await fetch(`${API_URL}/admin/collections/${selectedCollection}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocuments(selectedCollection);
      fetchCollections();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Import/Export handlers
  const handleImport = async () => {
    if (!selectedCollection) {
      alert('Select a collection first');
      return;
    }
    try {
      const documents = JSON.parse(importData);
      const arr = Array.isArray(documents) ? documents : [documents];
      
      await fetch(`${API_URL}/admin/import/${selectedCollection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documents: arr })
      });
      setImportData('');
      fetchDocuments(selectedCollection);
      fetchCollections();
      alert('Import successful!');
    } catch {
      alert('Invalid JSON or import error');
    }
  };

  const handleExport = async () => {
    if (!selectedCollection) {
      alert('Select a collection first');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/export/${selectedCollection}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCollection}_export.json`;
      a.click();
    } catch (err) {
      console.error('Error exporting:', err);
    }
  };

  // Site Content Handlers (for sitecontents collection)
  const handleAddSiteContent = async (e) => {
    e.preventDefault();
    if (!newSiteContent.key.trim()) {
      alert('Key is required');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSiteContent)
      });
      if (res.ok) {
        setNewSiteContent({ key: '', title: '', content: '', items: [], isActive: true });
        setNewItemInput('');
        fetchDocuments('sitecontents');
        alert('Content saved successfully!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    }
  };

  const handleUpdateSiteContent = async () => {
    if (!editingSiteContent.key.trim()) {
      alert('Key is required');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingSiteContent)
      });
      if (res.ok) {
        setEditingSiteContent(null);
        fetchDocuments('sitecontents');
        alert('Content updated successfully!');
      } else {
        alert('Failed to update content');
      }
    } catch {
      alert('Error updating content');
    }
  };

  const handleDeleteSiteContent = async (key) => {
    if (!confirm(`Delete content with key "${key}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/content/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDocuments('sitecontents');
      } else {
        alert('Failed to delete content');
      }
    } catch {
      alert('Error deleting content');
    }
  };

  const addItemToList = (isEditing = false) => {
    const input = isEditing ? editingSiteContent.newItem : newItemInput;
    if (!input?.trim()) return;
    
    if (isEditing) {
      setEditingSiteContent({
        ...editingSiteContent,
        items: [...(editingSiteContent.items || []), input.trim()],
        newItem: ''
      });
    } else {
      setNewSiteContent({
        ...newSiteContent,
        items: [...(newSiteContent.items || []), input.trim()]
      });
      setNewItemInput('');
    }
  };

  const removeItemFromList = (index, isEditing = false) => {
    if (isEditing) {
      const newItems = [...editingSiteContent.items];
      newItems.splice(index, 1);
      setEditingSiteContent({ ...editingSiteContent, items: newItems });
    } else {
      const newItems = [...newSiteContent.items];
      newItems.splice(index, 1);
      setNewSiteContent({ ...newSiteContent, items: newItems });
    }
  };

  // ============ LOGIN SCREEN ============
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/90 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white">🔐 Admin Panel</h1>
            <p className="text-gray-400 mt-2">Vatsalya International School</p>
          </div>
          
          {loginError && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4">
              {loginError}
            </div>
          )}
          
          <form onSubmit={showSetup ? handleSetup : handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
            >
              {showSetup ? '✨ Create Admin' : '🚀 Login'}
            </button>
          </form>
          
          <div className="mt-6 flex justify-between text-sm">
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="text-blue-400 hover:text-blue-300"
            >
              {showSetup ? '← Back to Login' : 'First time setup →'}
            </button>
            <button onClick={handleReset} className="text-red-400 hover:text-red-300">
              Reset Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎛️ Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {dbStats && `${dbStats.collections} collections • ${dbStats.documents} documents`}
            </span>
            <button
              onClick={loadAllData}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {['database', 'videos', 'gallery', 'curriculum', 'events', 'import-export'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'database' && '🗄️ Database'}
                {tab === 'videos' && '🎬 Videos'}
                {tab === 'gallery' && '🖼️ Gallery'}
                {tab === 'curriculum' && '📚 Curriculum'}
                {tab === 'events' && '📅 Calendar'}
                {tab === 'import-export' && '📦 Import/Export'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4">
        {loading && (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        )}

        {/* ============ DATABASE TAB ============ */}
        {activeTab === 'database' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Collections Sidebar */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <h2 className="text-lg font-bold mb-4">📁 Collections</h2>
              
              {/* Create Collection */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New collection"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="flex-1 p-2 bg-gray-700 rounded text-sm border border-gray-600"
                />
                <button onClick={handleCreateCollection} className="bg-green-600 hover:bg-green-700 px-3 rounded text-sm">+</button>
              </div>
              
              {/* Collection List */}
              <div className="space-y-1">
                {collections.map((col) => (
                  <div
                    key={col.name}
                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                      selectedCollection === col.name ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => fetchDocuments(col.name)}
                  >
                    <span className="truncate">{col.name}</span>
                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">{col.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents View */}
            <div className="lg:col-span-3 bg-gray-800 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">
                  {selectedCollection ? `📄 ${selectedCollection}` : '← Select a collection'}
                </h2>
                {selectedCollection && (
                  <button
                    onClick={() => handleDropCollection(selectedCollection)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                  >
                    Drop Collection
                  </button>
                )}
              </div>

              {/* IMAGES COLLECTION - Special UI */}
              {selectedCollection === 'images' && (
                <div className="space-y-4">
                  {/* Upload Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        uploadMode === 'url' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🔗 Add by URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        uploadMode === 'upload' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      📤 Upload File(s)
                    </button>
                  </div>

                  {/* Add Image Form */}
                  <form onSubmit={handleAddImage} className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                    {uploadMode === 'url' ? (
                      <input
                        type="url"
                        placeholder="Image URL (https://...)"
                        value={newImage.src}
                        onChange={(e) => setNewImage({ ...newImage, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    ) : (
                      <>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-600/50">
                          {selectedImages.length > 0 ? (
                            <div className="text-center">
                              <span className="text-3xl">✅</span>
                              <p className="text-blue-400 mt-1 font-semibold">{selectedImages.length} image(s) selected</p>
                              <p className="text-xs text-gray-400 mt-1">Total: {(selectedImages.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(2)}MB</p>
                            </div>
                          ) : uploadPreview ? (
                            <img src={uploadPreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                          ) : (
                            <div className="text-center">
                              <span className="text-3xl">📁</span>
                              <p className="text-gray-400 mt-1 text-sm">Click to select image(s)</p>
                              <p className="text-xs text-gray-500">Single or multiple files (max 10MB each)</p>
                            </div>
                          )}
                          <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                        </label>

                        {/* Multiple Files - Show Metadata Editor */}
                        {selectedImages.length > 1 && (
                          <div className="bg-blue-600/10 border-2 border-blue-500 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-blue-400">
                                📝 Editing Image {currentImageIndex + 1} of {selectedImages.length}
                              </h4>
                              <button
                                type="button"
                                onClick={() => setSelectedImages([])}
                                className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                              >
                                Clear All
                              </button>
                            </div>

                            {/* Current Image Preview */}
                            <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded">
                              <img 
                                src={selectedImages[currentImageIndex]?.data} 
                                alt="Preview" 
                                className="w-24 h-24 object-cover rounded border-2 border-blue-500"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{selectedImages[currentImageIndex]?.name}</p>
                                <p className="text-xs text-gray-400">
                                  Size: {(selectedImages[currentImageIndex]?.size / 1024).toFixed(0)}KB
                                </p>
                              </div>
                            </div>

                            {/* Metadata Inputs for Current Image */}
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Description (Alt text)"
                                value={selectedImages[currentImageIndex]?.alt || ''}
                                onChange={(e) => {
                                  const updated = [...selectedImages];
                                  updated[currentImageIndex].alt = e.target.value;
                                  setSelectedImages(updated);
                                }}
                                className="col-span-2 p-2 bg-gray-600 rounded border border-gray-500"
                              />
                              <select
                                value={selectedImages[currentImageIndex]?.category || 'home'}
                                onChange={(e) => {
                                  const updated = [...selectedImages];
                                  updated[currentImageIndex].category = e.target.value;
                                  setSelectedImages(updated);
                                }}
                                className="p-2 bg-gray-600 rounded border border-gray-500"
                              >
                                <option value="home">Home</option>
                                <option value="preprimary">Pre-Primary</option>
                                <option value="gallery">Gallery</option>
                                <option value="about">About</option>
                                <option value="events">Events</option>
                              </select>
                              <input
                                type="number"
                                placeholder="Order"
                                value={selectedImages[currentImageIndex]?.order || 0}
                                onChange={(e) => {
                                  const updated = [...selectedImages];
                                  updated[currentImageIndex].order = parseInt(e.target.value) || 0;
                                  setSelectedImages(updated);
                                }}
                                className="p-2 bg-gray-600 rounded border border-gray-500"
                              />
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                                disabled={currentImageIndex === 0}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 py-2 rounded font-medium"
                              >
                                ← Previous
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentImageIndex(Math.min(selectedImages.length - 1, currentImageIndex + 1))}
                                disabled={currentImageIndex === selectedImages.length - 1}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 py-2 rounded font-medium"
                              >
                                Next →
                              </button>
                            </div>

                            {/* Thumbnail Navigation */}
                            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-800/50 rounded">
                              {selectedImages.map((img, index) => (
                                <div 
                                  key={index} 
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`relative cursor-pointer rounded overflow-hidden border-2 ${
                                    index === currentImageIndex ? 'border-blue-500' : 'border-gray-600'
                                  }`}
                                >
                                  <img 
                                    src={img.data} 
                                    alt={img.name} 
                                    className="w-full h-16 object-cover"
                                  />
                                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 rounded-bl">
                                    {index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Form Fields - Show for URL mode or single file */}
                    {(uploadMode === 'url' || (uploadMode === 'upload' && selectedImages.length <= 1)) && (
                      <div className="grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={newImage.alt}
                          onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                          className="p-2 bg-gray-600 rounded border border-gray-500"
                          required
                        />
                        <select
                          value={newImage.category}
                          onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                          className="p-2 bg-gray-600 rounded border border-gray-500"
                        >
                          <option value="home">Home</option>
                          <option value="preprimary">Pre-Primary</option>
                          <option value="gallery">Gallery</option>
                          <option value="about">About</option>
                          <option value="events">Events</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Order"
                          value={newImage.order}
                          onChange={(e) => setNewImage({ ...newImage, order: parseInt(e.target.value) || 0 })}
                          className="p-2 bg-gray-600 rounded border border-gray-500"
                        />
                        <button 
                          type="submit"
                          disabled={(uploadMode === 'upload' && !uploadPreview && selectedImages.length === 0) || imageUploading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-medium flex items-center justify-center gap-2"
                        >
                          {imageUploading ? (
                            <>
                              <span className="animate-spin">⏳</span> Uploading...
                            </>
                          ) : (
                            '➕ Add'
                          )}
                        </button>
                      </div>
                    )}

                    {/* Upload All Button for Multiple Files */}
                    {uploadMode === 'upload' && selectedImages.length > 1 && (
                      <button 
                        type="submit"
                        disabled={imageUploading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        {imageUploading ? (
                          <>
                            <span className="animate-spin">⏳</span> Uploading {selectedImages.length} images...
                          </>
                        ) : (
                          <>🚀 Upload All {selectedImages.length} Images</>
                        )}
                      </button>
                    )}
                    
                    {/* Progress Bar */}
                    {imageUploading && uploadMode === 'upload' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-green-500 h-full transition-all duration-300 animate-pulse"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">
                          {selectedImages.length > 1 ? 'Uploading batch to Cloudinary...' : 'Uploading to Cloudinary...'}
                        </p>
                      </div>
                    )}
                  </form>

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-auto">
                    {documents.map((image) => {
                      // Build correct image URL
                      const imgSrc = image.src?.startsWith('/uploads') 
                        ? `${API_URL.replace('/api', '')}${image.src}` 
                        : image.src;
                      return (
                      <div key={image._id} className={`bg-gray-700/50 rounded-lg overflow-hidden ${!image.isActive && 'opacity-50'}`}>
                        <img src={imgSrc} alt={image.alt} className="w-full h-32 object-cover" />
                        
                        {editingImage?._id === image._id ? (
                          <div className="p-2 space-y-2">
                            <input
                              type="text"
                              value={editingImage.alt}
                              onChange={(e) => setEditingImage({ ...editingImage, alt: e.target.value })}
                              placeholder="Description"
                              className="w-full p-2 bg-gray-600 rounded text-sm"
                            />
                            <select
                              value={editingImage.category || 'home'}
                              onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                              className="w-full p-2 bg-gray-600 rounded text-sm"
                            >
                              <option value="home">Home</option>
                              <option value="preprimary">Pre-Primary</option>
                              <option value="gallery">Gallery</option>
                              <option value="about">About</option>
                              <option value="events">Events</option>
                            </select>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={editingImage.order}
                                onChange={(e) => setEditingImage({ ...editingImage, order: parseInt(e.target.value) || 0 })}
                                className="w-16 p-2 bg-gray-600 rounded text-sm"
                              />
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={editingImage.isActive}
                                  onChange={(e) => setEditingImage({ ...editingImage, isActive: e.target.checked })}
                                />
                                Active
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleUpdateImage} className="flex-1 bg-green-600 py-1 rounded text-xs">Save</button>
                              <button onClick={() => setEditingImage(null)} className="flex-1 bg-gray-600 py-1 rounded text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2">
                            <p className="font-medium truncate text-sm">{image.alt}</p>
                            <p className="text-xs text-gray-400">
                              Order: {image.order} • {image.isActive ? '✅' : '❌'}
                              {image.isUploaded && ' • 📤'}
                            </p>
                            <p className="text-xs text-blue-400 mt-1">📁 {image.category || 'home'}</p>
                            <div className="flex gap-2 mt-2">
                              <button 
                                onClick={() => setEditingImage(image)} 
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteImage(image._id)} 
                                className="flex-1 bg-red-600 hover:bg-red-700 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* ADMINS COLLECTION - Special UI */}
              {selectedCollection === 'admins' && (
                <div className="space-y-4">
                  <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-lg">
                    <p className="text-yellow-400 font-medium">⚠️ Admin Collection</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Manage admin accounts carefully. Passwords are hashed and cannot be viewed.
                    </p>
                  </div>
                  
                  {/* Admin List */}
                  <div className="space-y-2">
                    {documents.map((admin) => (
                      <div key={admin._id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">👤 {admin.username}</p>
                          <p className="text-xs text-gray-400">
                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(admin._id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SITECONTENTS COLLECTION - Special UI */}
              {selectedCollection === 'sitecontents' && (
                <div className="space-y-4">
                  <div className="bg-blue-600/20 border border-blue-600 p-4 rounded-lg">
                    <p className="text-blue-400 font-medium">📝 Site Content Management</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Enter a key and update title, content, or list items. Changes auto-save to database.
                    </p>
                  </div>

                  {/* Add/Update Site Content Form */}
                  <form onSubmit={handleAddSiteContent} className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Key *</label>
                        <input
                          type="text"
                          placeholder="e.g., video_section_info"
                          value={newSiteContent.key}
                          onChange={(e) => setNewSiteContent({ ...newSiteContent, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                          className="w-full p-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Title</label>
                        <input
                          type="text"
                          placeholder="Section title"
                          value={newSiteContent.title}
                          onChange={(e) => setNewSiteContent({ ...newSiteContent, title: e.target.value })}
                          className="w-full p-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">Content</label>
                      <textarea
                        placeholder="Main content text..."
                        value={newSiteContent.content}
                        onChange={(e) => setNewSiteContent({ ...newSiteContent, content: e.target.value })}
                        className="w-full p-2 bg-gray-600 rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm h-20 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">List Items</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add an item..."
                          value={newItemInput}
                          onChange={(e) => setNewItemInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItemToList())}
                          className="flex-1 p-2 bg-gray-600 rounded border border-gray-500 text-sm"
                        />
                        <button type="button" onClick={() => addItemToList()} className="bg-blue-600 hover:bg-blue-700 px-3 rounded text-sm">+</button>
                      </div>
                      {newSiteContent.items?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newSiteContent.items.map((item, idx) => (
                            <span key={idx} className="bg-gray-600 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                              {item}
                              <button type="button" onClick={() => removeItemFromList(idx)} className="text-red-400 hover:text-red-300">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newSiteContent.isActive}
                          onChange={(e) => setNewSiteContent({ ...newSiteContent, isActive: e.target.checked })}
                        />
                        Active
                      </label>
                      <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium">
                        💾 Save Content
                      </button>
                    </div>
                  </form>

                  {/* Existing Site Contents */}
                  <div className="space-y-2 max-h-[400px] overflow-auto">
                    {documents.map((content) => (
                      <div key={content._id} className={`bg-gray-700/50 p-3 rounded-lg ${!content.isActive && 'opacity-50'}`}>
                        {editingSiteContent?._id === content._id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingSiteContent.title || ''}
                              onChange={(e) => setEditingSiteContent({ ...editingSiteContent, title: e.target.value })}
                              placeholder="Title"
                              className="w-full p-2 bg-gray-600 rounded text-sm"
                            />
                            <textarea
                              value={editingSiteContent.content || ''}
                              onChange={(e) => setEditingSiteContent({ ...editingSiteContent, content: e.target.value })}
                              placeholder="Content"
                              className="w-full p-2 bg-gray-600 rounded text-sm h-16 resize-none"
                            />
                            <div className="flex gap-2 mb-1">
                              <input
                                type="text"
                                placeholder="Add item..."
                                value={editingSiteContent.newItem || ''}
                                onChange={(e) => setEditingSiteContent({ ...editingSiteContent, newItem: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItemToList(true))}
                                className="flex-1 p-1 bg-gray-600 rounded text-sm"
                              />
                              <button type="button" onClick={() => addItemToList(true)} className="bg-blue-600 px-2 rounded text-sm">+</button>
                            </div>
                            {editingSiteContent.items?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {editingSiteContent.items.map((item, idx) => (
                                  <span key={idx} className="bg-gray-600 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                    {item}
                                    <button type="button" onClick={() => removeItemFromList(idx, true)} className="text-red-400">×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editingSiteContent.isActive}
                                onChange={(e) => setEditingSiteContent({ ...editingSiteContent, isActive: e.target.checked })}
                              />
                              Active
                            </label>
                            <div className="flex gap-2">
                              <button onClick={handleUpdateSiteContent} className="flex-1 bg-green-600 py-1 rounded text-xs">Save</button>
                              <button onClick={() => setEditingSiteContent(null)} className="flex-1 bg-gray-600 py-1 rounded text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">{content.key}</span>
                                <span className={`text-xs ml-2 px-2 py-0.5 rounded ${content.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                                  {content.isActive ? '✅' : '❌'}
                                </span>
                                {content.title && <p className="font-medium mt-1">{content.title}</p>}
                                {content.content && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{content.content}</p>}
                                {content.items?.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">Items: {content.items.length}</p>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button onClick={() => setEditingSiteContent({ ...content, newItem: '' })} className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs">Edit</button>
                                <button onClick={() => handleDeleteSiteContent(content.key)} className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">Delete</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OTHER COLLECTIONS - Generic JSON Editor */}
              {selectedCollection && selectedCollection !== 'images' && selectedCollection !== 'admins' && selectedCollection !== 'sitecontents' && selectedCollection !== 'feedbacks' && (
                <>
                  {/* Add Document */}
                  <div className="mb-4">
                    <textarea
                      placeholder='{"field": "value"}'
                      value={newDocument}
                      onChange={(e) => setNewDocument(e.target.value)}
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 font-mono text-sm h-24"
                    />
                    <button
                      onClick={handleAddDocument}
                      className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                    >
                      ➕ Add Document
                    </button>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3 max-h-[500px] overflow-auto">
                    {documents.map((doc) => (
                      <div key={doc._id} className="bg-gray-700/50 p-3 rounded-lg">
                        {editingDocument?._id === doc._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingDocument.data}
                              onChange={(e) => setEditingDocument({ ...editingDocument, data: e.target.value })}
                              className="w-full p-2 bg-gray-600 rounded font-mono text-sm h-32"
                            />
                            <div className="flex gap-2">
                              <button onClick={handleUpdateDocument} className="bg-green-600 px-3 py-1 rounded text-sm">Save</button>
                              <button onClick={() => setEditingDocument(null)} className="bg-gray-600 px-3 py-1 rounded text-sm">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(doc, null, 2)}
                            </pre>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => setEditingDocument({ _id: doc._id, data: JSON.stringify(doc, null, 2) })}
                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Enhanced Feedbacks View */}
              {selectedCollection === 'feedbacks' && (
                <div className="space-y-4">
                  {/* Filter buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setFeedbackFilter('all')}
                      className={`px-3 py-1.5 rounded text-xs font-medium ${
                        feedbackFilter === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      All ({documents.length})
                    </button>
                    <button
                      onClick={() => setFeedbackFilter('unread')}
                      className={`px-3 py-1.5 rounded text-xs font-medium ${
                        feedbackFilter === 'unread' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      Unread ({documents.filter(f => !f.isRead).length})
                    </button>
                    <button
                      onClick={() => setFeedbackFilter('read')}
                      className={`px-3 py-1.5 rounded text-xs font-medium ${
                        feedbackFilter === 'read' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      Read ({documents.filter(f => f.isRead).length})
                    </button>
                  </div>

                  {/* Auto-delete info */}
                  <div className="bg-amber-900/30 border border-amber-700/50 text-amber-200 p-3 rounded-lg text-xs">
                    ⚠️ <strong>Auto-Cleanup:</strong> Read feedback auto-deletes after 3 months
                  </div>

                  {/* Feedback cards */}
                  <div className="space-y-3 max-h-[450px] overflow-auto">
                    {documents
                      .filter(f => {
                        if (feedbackFilter === 'unread') return !f.isRead;
                        if (feedbackFilter === 'read') return f.isRead;
                        return true;
                      })
                      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                      .map((feedback) => {
                        const isAdmission = feedback.subject?.toLowerCase().includes('admission');
                        const daysUntilDelete = feedback.isRead ? getDaysUntilDelete(feedback.readAt) : null;
                        
                        return (
                          <div 
                            key={feedback._id} 
                            className={`bg-gray-700/50 p-4 rounded-lg border-l-4 ${
                              feedback.isRead 
                                ? 'border-gray-600 opacity-80' 
                                : isAdmission 
                                  ? 'border-green-500' 
                                  : 'border-blue-500'
                            }`}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{isAdmission ? '🎓' : '💬'}</span>
                                <div>
                                  <p className="font-bold text-sm">{feedback.name}</p>
                                  <p className="text-xs text-gray-400">{feedback.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  isAdmission ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'
                                }`}>
                                  {isAdmission ? 'Admission' : 'Feedback'}
                                </span>
                                {!feedback.isRead && (
                                  <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-300 animate-pulse">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Subject & Message */}
                            <p className="text-xs text-gray-500 mb-1">Subject: <span className="text-gray-300">{feedback.subject}</span></p>
                            <p className="text-sm text-gray-300 bg-gray-800/50 p-2 rounded mb-2 whitespace-pre-wrap">
                              {feedback.message}
                            </p>

                            {/* Phone */}
                            {feedback.phone && (
                              <p className="text-xs text-gray-400 mb-2">📞 {feedback.phone}</p>
                            )}

                            {/* Footer */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-600">
                              <div className="text-xs text-gray-500">
                                <p>📅 {new Date(feedback.submittedAt).toLocaleString()}</p>
                                {feedback.isRead && feedback.readAt && (
                                  <p className="text-amber-400">⏳ Deletes in {daysUntilDelete} days</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {!feedback.isRead && (
                                  <button
                                    onClick={() => markFeedbackAsRead(feedback._id)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                                  >
                                    ✓ Mark Read
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteFeedback(feedback._id)}
                                  className="px-3 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Empty state */}
                  {documents.filter(f => {
                    if (feedbackFilter === 'unread') return !f.isRead;
                    if (feedbackFilter === 'read') return f.isRead;
                    return true;
                  }).length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-gray-500 text-sm">No feedback found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ VIDEOS TAB ============ */}
        {activeTab === 'videos' && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-6">🎬 Video Management</h2>
            
            {/* Video Type Toggle */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setVideoUploadMode('youtube')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'youtube' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>▶️</span> YouTube
              </button>
              <button
                type="button"
                onClick={() => setVideoUploadMode('facebook')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'facebook' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>📘</span> Facebook
              </button>
              <button
                type="button"
                onClick={() => setVideoUploadMode('instagram')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'instagram' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>📷</span> Instagram
              </button>
              <button
                type="button"
                onClick={() => setVideoUploadMode('vimeo')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'vimeo' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>🎥</span> Vimeo
              </button>
              <button
                type="button"
                onClick={() => setVideoUploadMode('url')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'url' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>🔗</span> Other URL
              </button>
              <button
                type="button"
                onClick={() => setVideoUploadMode('upload')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'upload' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>📤</span> Upload File
              </button>
            </div>

            {/* Add Video Form */}
            <form onSubmit={handleAddVideo} className="bg-gray-700/50 p-6 rounded-xl space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video Source */}
                <div className="md:col-span-2">
                  {videoUploadMode === 'youtube' && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">YouTube URL</label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        value={newVideo.src}
                        onChange={(e) => setNewVideo({ ...newVideo, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-red-500 focus:outline-none"
                        required
                      />
                      {newVideo.src && getYouTubeId(newVideo.src) && (
                        <div className="mt-2">
                          <img 
                            src={`https://img.youtube.com/vi/${getYouTubeId(newVideo.src)}/mqdefault.jpg`}
                            alt="YouTube Thumbnail"
                            className="h-24 rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {videoUploadMode === 'url' && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Direct Video URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/video.mp4"
                        value={newVideo.src}
                        onChange={(e) => setNewVideo({ ...newVideo, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-gray-400 focus:outline-none"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">Supports MP4, WebM, MOV files</p>
                    </div>
                  )}

                  {videoUploadMode === 'facebook' && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Facebook Video URL</label>
                      <input
                        type="text"
                        placeholder="https://www.facebook.com/watch?v=... or https://fb.watch/..."
                        value={newVideo.src}
                        onChange={(e) => setNewVideo({ ...newVideo, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">Video must be public</p>
                    </div>
                  )}

                  {videoUploadMode === 'instagram' && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Instagram Post/Reel URL</label>
                      <input
                        type="text"
                        placeholder="https://www.instagram.com/p/... or https://www.instagram.com/reel/..."
                        value={newVideo.src}
                        onChange={(e) => setNewVideo({ ...newVideo, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-pink-500 focus:outline-none"
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">Supports posts, reels, and IGTV</p>
                    </div>
                  )}

                  {videoUploadMode === 'vimeo' && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Vimeo URL</label>
                      <input
                        type="text"
                        placeholder="https://vimeo.com/123456789"
                        value={newVideo.src}
                        onChange={(e) => setNewVideo({ ...newVideo, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  )}
                  
                  {videoUploadMode === 'upload' && (
                    <>
                      <div>
                        <label className="block text-gray-300 mb-2 text-sm">Upload Video File(s)</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-green-500 transition-colors bg-gray-600/50">
                          {selectedVideos.length > 0 ? (
                            <div className="text-center">
                              <span className="text-3xl">✅</span>
                              <p className="text-purple-400 mt-1 font-semibold">{selectedVideos.length} video(s) selected</p>
                              <p className="text-xs text-gray-400 mt-1">Total: {(selectedVideos.reduce((acc, vid) => acc + vid.size, 0) / 1024 / 1024).toFixed(2)}MB</p>
                            </div>
                          ) : videoUploadPreview ? (
                            <div className="text-center">
                              <span className="text-4xl">✅</span>
                              <p className="text-green-400 mt-2 text-sm">Video selected</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-4xl">🎥</span>
                              <p className="text-gray-400 mt-2 text-sm">Click to select video(s)</p>
                              <p className="text-gray-500 text-xs">Single or multiple files (max 50MB each)</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="video/*" 
                            multiple 
                            onChange={handleVideoFileSelect} 
                            className="hidden" 
                          />
                        </label>
                        <p className="text-yellow-500 text-xs mt-2">💡 For larger videos, upload to YouTube and paste the link instead</p>
                      </div>

                      {/* Multiple Videos - Show Metadata Editor */}
                      {selectedVideos.length > 1 && (
                        <div className="bg-purple-600/10 border-2 border-purple-500 rounded-lg p-4 space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-purple-400">
                              📝 Editing Video {currentVideoIndex + 1} of {selectedVideos.length}
                            </h4>
                            <button
                              type="button"
                              onClick={() => setSelectedVideos([])}
                              className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                            >
                              Clear All
                            </button>
                          </div>

                          {/* Current Video Info */}
                          <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded">
                            <div className="w-24 h-16 bg-gray-900 rounded flex items-center justify-center">
                              <span className="text-3xl">🎥</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{selectedVideos[currentVideoIndex]?.name}</p>
                              <p className="text-xs text-gray-400">
                                Size: {(selectedVideos[currentVideoIndex]?.size / 1024 / 1024).toFixed(2)}MB
                              </p>
                            </div>
                          </div>

                          {/* Metadata Inputs for Current Video */}
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Video Title *"
                              value={selectedVideos[currentVideoIndex]?.title || ''}
                              onChange={(e) => {
                                const updated = [...selectedVideos];
                                updated[currentVideoIndex].title = e.target.value;
                                setSelectedVideos(updated);
                              }}
                              className="w-full p-2 bg-gray-600 rounded border border-gray-500"
                            />
                            <textarea
                              placeholder="Description (optional)"
                              value={selectedVideos[currentVideoIndex]?.description || ''}
                              onChange={(e) => {
                                const updated = [...selectedVideos];
                                updated[currentVideoIndex].description = e.target.value;
                                setSelectedVideos(updated);
                              }}
                              className="w-full p-2 bg-gray-600 rounded border border-gray-500 h-16 resize-none"
                            />
                            <input
                              type="number"
                              placeholder="Display Order"
                              value={selectedVideos[currentVideoIndex]?.order || 0}
                              onChange={(e) => {
                                const updated = [...selectedVideos];
                                updated[currentVideoIndex].order = parseInt(e.target.value) || 0;
                                setSelectedVideos(updated);
                              }}
                              className="w-full p-2 bg-gray-600 rounded border border-gray-500"
                            />
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                              disabled={currentVideoIndex === 0}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 py-2 rounded font-medium"
                            >
                              ← Previous
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentVideoIndex(Math.min(selectedVideos.length - 1, currentVideoIndex + 1))}
                              disabled={currentVideoIndex === selectedVideos.length - 1}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 py-2 rounded font-medium"
                            >
                              Next →
                            </button>
                          </div>

                          {/* Thumbnail Navigation */}
                          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-800/50 rounded">
                            {selectedVideos.map((video, index) => (
                              <div 
                                key={index} 
                                onClick={() => setCurrentVideoIndex(index)}
                                className={`relative cursor-pointer rounded overflow-hidden border-2 ${
                                  index === currentVideoIndex ? 'border-purple-500' : 'border-gray-600'
                                } bg-gray-900 h-16 flex items-center justify-center`}
                              >
                                <span className="text-2xl">🎥</span>
                                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-1 rounded-bl">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Form Fields - Show for non-upload modes or single file */}
                {(videoUploadMode !== 'upload' || (videoUploadMode === 'upload' && selectedVideos.length <= 1)) && (
                  <>
                    {/* Title */}
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Title *</label>
                      <input
                        type="text"
                        placeholder="Video title"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Order */}
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Display Order</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newVideo.order}
                        onChange={(e) => setNewVideo({ ...newVideo, order: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 mb-2 text-sm">Description</label>
                      <textarea
                        placeholder="Video description (optional)"
                        value={newVideo.description}
                        onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none h-20 resize-none"
                      />
                    </div>

                    {/* Custom Thumbnail (for non-YouTube videos) */}
                    {videoUploadMode !== 'youtube' && videoUploadMode !== 'upload' && (
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-2 text-sm">Custom Thumbnail (optional)</label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-600/50">
                          {videoThumbnailPreview ? (
                            <img src={videoThumbnailPreview} alt="Thumbnail" className="h-full w-auto object-contain rounded" />
                          ) : (
                            <div className="text-center">
                              <span className="text-2xl">🖼️</span>
                              <p className="text-gray-400 text-xs">Click to add thumbnail</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleVideoThumbnailSelect} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    )}

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="videoActive"
                        checked={newVideo.isActive}
                        onChange={(e) => setNewVideo({ ...newVideo, isActive: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="videoActive" className="text-gray-300 text-sm">Active (visible on site)</label>
                    </div>
                  </>
                )}
              </div>

              {/* Single Video Submit Button */}
              {(videoUploadMode !== 'upload' || (videoUploadMode === 'upload' && selectedVideos.length <= 1)) && (
                <button 
                  type="submit"
                  disabled={(videoUploadMode === 'upload' && !videoUploadPreview && selectedVideos.length === 0) || videoUploading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {videoUploading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                    </>
                  ) : (
                    <>➕ Add Video</>
                  )}
                </button>
              )}

              {/* Multiple Videos Upload Button */}
              {videoUploadMode === 'upload' && selectedVideos.length > 1 && (
                <button 
                  type="submit"
                  disabled={videoUploading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  {videoUploading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Uploading {selectedVideos.length} videos...
                    </>
                  ) : (
                    <>🚀 Upload All {selectedVideos.length} Videos</>
                  )}
                </button>
              )}
              
              {/* Upload Progress Bar */}
              {videoUploading && uploadProgress > 0 && (
                <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {selectedVideos.length > 1 ? 'Uploading batch to Cloudinary...' : 'Uploading to Cloudinary...'}
                  </p>
                </div>
              )}
            </form>

            {/* Videos List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📋 Videos List
                <button 
                  onClick={fetchVideos}
                  disabled={videosLoading}
                  className="text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 px-2 py-1 rounded flex items-center gap-1"
                >
                  {videosLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    '🔄'
                  )}
                  Refresh
                </button>
              </h3>

              {videosLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p>Loading videos...</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-auto">
                {documents.map((video) => (
                  <div 
                    key={video._id} 
                    className={`bg-gray-700/50 rounded-lg overflow-hidden ${!video.isActive && 'opacity-50'}`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative bg-gray-800">
                      {(() => {
                        const thumbnail = getVideoThumbnail(video);
                        return thumbnail ? (
                          <img 
                            src={thumbnail} 
                            alt={video.title} 
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-32 flex items-center justify-center ${
                                  video.type === 'vimeo' ? 'bg-cyan-900/30' 
                                    : video.type === 'facebook' ? 'bg-blue-900/30'
                                    : video.type === 'instagram' ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30'
                                    : 'bg-gray-800'
                                }">
                                  <span class="text-4xl">🎥</span>
                                </div>
                              `;
                            }}
                          />
                        ) : video.type === 'vimeo' ? (
                          <div className="w-full h-32 flex items-center justify-center bg-cyan-900/30">
                            <span className="text-5xl">🎥</span>
                          </div>
                        ) : video.type === 'facebook' ? (
                          <div className="w-full h-32 flex items-center justify-center bg-blue-900/30">
                            <span className="text-5xl">📘</span>
                          </div>
                        ) : video.type === 'instagram' ? (
                          <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                            <span className="text-5xl">📷</span>
                          </div>
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            <span className="text-4xl">🎥</span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Video Info */}
                    {editingVideo?._id === video._id ? (
                      <div className="p-2 space-y-2">
                        <input
                          type="text"
                          value={editingVideo.title}
                          onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                          placeholder="Title"
                          className="w-full p-2 bg-gray-600 rounded text-sm"
                        />
                        <textarea
                          value={editingVideo.description || ''}
                          onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                          placeholder="Description"
                          className="w-full p-2 bg-gray-600 rounded text-sm h-16 resize-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingVideo.order}
                            onChange={(e) => setEditingVideo({ ...editingVideo, order: parseInt(e.target.value) || 0 })}
                            className="w-16 p-2 bg-gray-600 rounded text-sm"
                            placeholder="Order"
                          />
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={editingVideo.isActive}
                              onChange={(e) => setEditingVideo({ ...editingVideo, isActive: e.target.checked })}
                            />
                            Active
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleUpdateVideo} className="flex-1 bg-green-600 py-1 rounded text-xs">Save</button>
                          <button onClick={() => setEditingVideo(null)} className="flex-1 bg-gray-600 py-1 rounded text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2">
                        <p className="font-medium truncate text-sm">{video.title}</p>
                        <p className="text-xs text-gray-400">
                          Order: {video.order} • {video.isActive ? '✅' : '❌'}
                        </p>
                        <p className="text-xs text-blue-400 mt-1">
                          {video.type === 'youtube' ? '▶️ YouTube' 
                            : video.type === 'facebook' ? '📘 Facebook'
                            : video.type === 'instagram' ? '📷 Instagram'
                            : video.type === 'vimeo' ? '🎥 Vimeo'
                            : video.type === 'uploaded' ? '📤 Uploaded' 
                            : '🔗 URL'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => setEditingVideo(video)} 
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteVideo(video._id)} 
                            className="flex-1 bg-red-600 hover:bg-red-700 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        )}

        {/* ============ GALLERY TAB ============ */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add New Photo/Video Form */}
            <div className="bg-gray-800 p-6 rounded-xl">
              {/* Type Toggle - Photo or Video */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setGalleryType('photo');
                    setEditingGalleryPhoto(null);
                    setEditingGalleryVideo(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    galleryType === 'photo' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📷 Photo
                </button>
                <button
                  onClick={() => {
                    setGalleryType('video');
                    setEditingGalleryPhoto(null);
                    setEditingGalleryVideo(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    galleryType === 'video' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🎬 Video
                </button>
              </div>

              {/* PHOTO FORM */}
              {galleryType === 'photo' && (
                <>
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingGalleryPhoto ? '✏️ Edit Photo' : '➕ Add New Photo'}
                  </h3>
                  
                  {/* Upload Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => { setGalleryUploadMode('url'); setGalleryUploadPreview(''); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        galleryUploadMode === 'url' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🔗 URL
                    </button>
                    <button
                      onClick={() => { setGalleryUploadMode('upload'); setNewGalleryPhoto(prev => ({ ...prev, src: '' })); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        galleryUploadMode === 'upload' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      📤 Upload
                    </button>
                  </div>

                  {galleryUploadMode === 'url' ? (
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={newGalleryPhoto.src}
                      onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, src: e.target.value })}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                    />
                  ) : (
                    <div className="mb-3">
                      <label className="block w-full bg-gray-700 text-white p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors text-center">
                        📷 Choose Image File(s)
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryPhotoFileSelect}
                          className="hidden"
                        />
                      </label>
                      {selectedGalleryPhotos.length > 1 ? (
                        <div className="mt-3 text-center">
                          <span className="text-3xl">✅</span>
                          <p className="text-green-400 mt-1 font-semibold">{selectedGalleryPhotos.length} photos selected</p>
                        </div>
                      ) : galleryUploadPreview && (
                        <img 
                          src={galleryUploadPreview} 
                          alt="Preview" 
                          className="mt-3 w-full h-40 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* Multiple Photos - Show Metadata Editor */}
                  {selectedGalleryPhotos.length > 1 && (
                    <div className="bg-green-600/10 border-2 border-green-500 rounded-lg p-4 space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-green-400">
                          📝 Editing Photo {currentGalleryPhotoIndex + 1} of {selectedGalleryPhotos.length}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGalleryPhotos([]);
                            setCurrentGalleryPhotoIndex(0);
                          }}
                          className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Current Photo Preview */}
                      <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded">
                        <img 
                          src={selectedGalleryPhotos[currentGalleryPhotoIndex]?.data} 
                          alt="Preview" 
                          className="w-24 h-24 object-cover rounded border-2 border-green-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{selectedGalleryPhotos[currentGalleryPhotoIndex]?.name}</p>
                          <p className="text-xs text-gray-400">
                            Size: {(selectedGalleryPhotos[currentGalleryPhotoIndex]?.size / 1024).toFixed(0)}KB
                          </p>
                        </div>
                      </div>

                      {/* Metadata Inputs for Current Photo */}
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Photo Title *"
                          value={selectedGalleryPhotos[currentGalleryPhotoIndex]?.title || ''}
                          onChange={(e) => {
                            const updated = [...selectedGalleryPhotos];
                            updated[currentGalleryPhotoIndex].title = e.target.value;
                            setSelectedGalleryPhotos(updated);
                          }}
                          className="w-full p-2 bg-gray-600 rounded border border-gray-500"
                        />
                        <select
                          value={selectedGalleryPhotos[currentGalleryPhotoIndex]?.category || 'events'}
                          onChange={(e) => {
                            const updated = [...selectedGalleryPhotos];
                            updated[currentGalleryPhotoIndex].category = e.target.value;
                            setSelectedGalleryPhotos(updated);
                          }}
                          className="w-full p-2 bg-gray-600 rounded border border-gray-500"
                        >
                          <option value="events">🎉 School Events</option>
                          <option value="sports">⚽ Sports Day</option>
                          <option value="cultural">🎭 Cultural Programs</option>
                          <option value="classroom">📚 Classroom Activities</option>
                          <option value="campus">🏫 Campus</option>
                          <option value="other">📷 Other</option>
                        </select>
                        <textarea
                          placeholder="Description (optional)"
                          value={selectedGalleryPhotos[currentGalleryPhotoIndex]?.description || ''}
                          onChange={(e) => {
                            const updated = [...selectedGalleryPhotos];
                            updated[currentGalleryPhotoIndex].description = e.target.value;
                            setSelectedGalleryPhotos(updated);
                          }}
                          className="w-full p-2 bg-gray-600 rounded border border-gray-500 h-16 resize-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Order"
                            value={selectedGalleryPhotos[currentGalleryPhotoIndex]?.order || 0}
                            onChange={(e) => {
                              const updated = [...selectedGalleryPhotos];
                              updated[currentGalleryPhotoIndex].order = parseInt(e.target.value) || 0;
                              setSelectedGalleryPhotos(updated);
                            }}
                            className="p-2 bg-gray-600 rounded border border-gray-500"
                          />
                          <select
                            value={selectedGalleryPhotos[currentGalleryPhotoIndex]?.year || '2025-26'}
                            onChange={(e) => {
                              const updated = [...selectedGalleryPhotos];
                              updated[currentGalleryPhotoIndex].year = e.target.value;
                              setSelectedGalleryPhotos(updated);
                            }}
                            className="p-2 bg-gray-600 rounded border border-gray-500"
                          >
                            <option value="2025-26">📅 2025-26</option>
                            <option value="2024-25">📅 2024-25</option>
                            <option value="2023-24">📅 2023-24</option>
                            <option value="2022-23">📅 2022-23</option>
                          </select>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentGalleryPhotoIndex(Math.max(0, currentGalleryPhotoIndex - 1))}
                          disabled={currentGalleryPhotoIndex === 0}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 py-2 rounded font-medium"
                        >
                          ← Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentGalleryPhotoIndex(Math.min(selectedGalleryPhotos.length - 1, currentGalleryPhotoIndex + 1))}
                          disabled={currentGalleryPhotoIndex === selectedGalleryPhotos.length - 1}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 py-2 rounded font-medium"
                        >
                          Next →
                        </button>
                      </div>

                      {/* Thumbnail Navigation */}
                      <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-800/50 rounded">
                        {selectedGalleryPhotos.map((img, index) => (
                          <div 
                            key={index} 
                            onClick={() => setCurrentGalleryPhotoIndex(index)}
                            className={`relative cursor-pointer rounded overflow-hidden border-2 ${
                              index === currentGalleryPhotoIndex ? 'border-green-500' : 'border-gray-600'
                            }`}
                          >
                            <img 
                              src={img.data} 
                              alt={img.name} 
                              className="w-full h-16 object-cover"
                            />
                            <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-1 rounded-bl">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Fields - Show for single file or no files */}
                  {selectedGalleryPhotos.length <= 1 && (
                    <>
                      <input
                        type="text"
                        placeholder="Photo Title *"
                        value={newGalleryPhoto.title}
                        onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, title: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                      />

                      <select
                        value={newGalleryPhoto.category}
                        onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, category: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                      >
                        <option value="events">🎉 School Events</option>
                        <option value="sports">⚽ Sports Day</option>
                        <option value="cultural">🎭 Cultural Programs</option>
                        <option value="classroom">📚 Classroom Activities</option>
                        <option value="campus">🏫 Campus</option>
                        <option value="other">📷 Other</option>
                      </select>

                      <textarea
                        placeholder="Description (optional)"
                        value={newGalleryPhoto.description}
                        onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, description: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3 h-20 resize-none"
                      />

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="number"
                          placeholder="Order"
                          value={newGalleryPhoto.order}
                          onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, order: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 text-white p-3 rounded-lg"
                        />
                        <label className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newGalleryPhoto.isActive}
                            onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, isActive: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">Active</span>
                        </label>
                      </div>

                      <select
                        value={newGalleryPhoto.year}
                        onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, year: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
                      >
                        <option value="2025-26">📅 2025-26</option>
                        <option value="2024-25">📅 2024-25</option>
                        <option value="2023-24">📅 2023-24</option>
                        <option value="2022-23">📅 2022-23</option>
                      </select>
                    </>
                  )}

                  <div className="flex gap-3">
                    {editingGalleryPhoto && selectedGalleryPhotos.length <= 1 ? (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_URL}/admin/gallery/${editingGalleryPhoto._id}`, {
                                method: 'PUT',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}` 
                                },
                                body: JSON.stringify(newGalleryPhoto)
                              });
                              if (res.ok) {
                                setEditingGalleryPhoto(null);
                                setNewGalleryPhoto({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true, year: '2025-26' });
                                setGalleryUploadPreview('');
                                fetchGalleryPhotos();
                              }
                            } catch (error) {
                              console.error('Error updating photo:', error);
                            }
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-colors"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingGalleryPhoto(null);
                            setNewGalleryPhoto({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true, year: '2025-26' });
                            setGalleryUploadPreview('');
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : selectedGalleryPhotos.length <= 1 ? (
                      <>
                        <button
                          onClick={async () => {
                            if (!newGalleryPhoto.src || !newGalleryPhoto.title) {
                              alert('Please provide image and title');
                              return;
                            }
                            
                            setGalleryPhotoUploading(true);
                            setGalleryPhotoUploadProgress(0);
                            
                            try {
                              const endpoint = galleryUploadMode === 'upload' 
                                ? `${API_URL}/admin/gallery/upload`
                                : `${API_URL}/admin/gallery`;
                              const body = galleryUploadMode === 'upload'
                                ? { imageData: newGalleryPhoto.src, ...newGalleryPhoto }
                                : newGalleryPhoto;
                              
                              // Use XMLHttpRequest for progress tracking
                              await new Promise((resolve, reject) => {
                                const xhr = new XMLHttpRequest();
                                
                                xhr.upload.addEventListener('progress', (e) => {
                                  if (e.lengthComputable) {
                                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                                    setGalleryPhotoUploadProgress(percentComplete);
                                  }
                                });
                                
                                xhr.addEventListener('load', () => {
                                  if (xhr.status >= 200 && xhr.status < 300) {
                                    resolve(xhr.response);
                                  } else {
                                    reject(new Error(`Upload failed with status ${xhr.status}`));
                                  }
                                });
                                
                                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
                                
                                xhr.open('POST', endpoint);
                                xhr.setRequestHeader('Content-Type', 'application/json');
                                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                                xhr.send(JSON.stringify(body));
                              });
                              
                              setNewGalleryPhoto({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true, year: '2025-26' });
                              setGalleryUploadPreview('');
                              setGalleryPhotoUploadProgress(0);
                              fetchGalleryPhotos();
                            } catch (error) {
                              console.error('Error adding photo:', error);
                              alert('Upload failed. Please try again.');
                            } finally {
                              setGalleryPhotoUploading(false);
                            }
                          }}
                          disabled={galleryPhotoUploading}
                          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {galleryPhotoUploading ? (
                            <span>📤 Uploading... {galleryPhotoUploadProgress}%</span>
                          ) : (
                            '➕ Add Photo'
                          )}
                        </button>
                        
                        {/* Progress Bar */}
                        {galleryPhotoUploading && (
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full transition-all duration-300"
                              style={{ width: `${galleryPhotoUploadProgress}%` }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Upload All Button for Multiple Photos */}
                        <button
                          onClick={async () => {
                            setGalleryPhotoUploading(true);
                            setGalleryPhotoUploadProgress(0);
                            
                            try {
                              // Prepare photos array with their metadata
                              const photos = selectedGalleryPhotos.map(photo => ({
                                imageData: photo.data,
                                title: photo.title,
                                description: photo.description,
                                category: photo.category,
                                year: photo.year,
                                order: photo.order,
                                isActive: photo.isActive
                              }));

                              const res = await fetch(`${API_URL}/admin/gallery/batch-upload`, {
                                method: 'POST',
                                headers: { 
                                  'Content-Type': 'application/json', 
                                  Authorization: `Bearer ${token}` 
                                },
                                body: JSON.stringify({ photos })
                              });

                              const data = await res.json();
                              setGalleryPhotoUploading(false);
                              
                              if (res.ok) {
                                alert(`✅ Upload complete!\nSuccessful: ${data.successful.length}\nFailed: ${data.failed.length}`);
                                setSelectedGalleryPhotos([]);
                                setCurrentGalleryPhotoIndex(0);
                                fetchGalleryPhotos();
                              } else {
                                alert('Upload failed: ' + (data.message || 'Unknown error'));
                              }
                            } catch (error) {
                              console.error('Error:', error);
                              alert('Upload failed. Please try again.');
                            } finally {
                              setGalleryPhotoUploading(false);
                              setGalleryPhotoUploadProgress(0);
                            }
                          }}
                          disabled={galleryPhotoUploading}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 rounded-lg font-bold"
                        >
                          {galleryPhotoUploading ? (
                            <>⏳ Uploading {selectedGalleryPhotos.length} photos...</>
                          ) : (
                            <>🚀 Upload All {selectedGalleryPhotos.length} Photos</>
                          )}
                        </button>
                        
                        {galleryPhotoUploading && (
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                            <p className="text-xs text-gray-400 mt-1 text-center">Uploading batch...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              {/* VIDEO FORM */}
              {galleryType === 'video' && (
                <>
                  <h3 className="text-lg font-bold text-white mb-4">
                    {editingGalleryVideo ? '✏️ Edit Video' : '➕ Add New Video'}
                  </h3>

                  {/* Upload Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => { setGalleryVideoUploadMode('url'); setGalleryVideoUploadPreview(''); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        galleryVideoUploadMode === 'url' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🔗 URL
                    </button>
                    <button
                      onClick={() => { setGalleryVideoUploadMode('upload'); setNewGalleryVideo(prev => ({ ...prev, src: '', type: 'uploaded' })); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        galleryVideoUploadMode === 'upload' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      📤 Upload
                    </button>
                  </div>

                  {galleryVideoUploadMode === 'url' ? (
                    <>
                      <select
                        value={newGalleryVideo.type}
                        onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, type: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                      >
                        <option value="youtube">🎥 YouTube</option>
                        <option value="url">🔗 Video URL</option>
                        <option value="facebook">📘 Facebook</option>
                        <option value="vimeo">📹 Vimeo</option>
                        <option value="instagram">📸 Instagram</option>
                      </select>

                      <input
                        type="text"
                        placeholder={`${newGalleryVideo.type === 'youtube' ? 'YouTube' : 'Video'} URL *`}
                        value={newGalleryVideo.src}
                        onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, src: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                      />
                    </>
                  ) : (
                    <div className="mb-3">
                      <label className="block w-full bg-gray-700 text-white p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors text-center">
                        🎥 Choose Video File(s) (MP4, WebM, MOV)
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={handleGalleryVideoFileSelect}
                          className="hidden"
                        />
                      </label>

                      {/* Multiple video metadata editor */}
                      {selectedGalleryVideos.length > 1 && (
                        <div className="mt-3 bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-white font-medium">
                              🎬 Editing Video {currentGalleryVideoIndex + 1} of {selectedGalleryVideos.length}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setCurrentGalleryVideoIndex(Math.max(0, currentGalleryVideoIndex - 1))}
                                disabled={currentGalleryVideoIndex === 0}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ← Previous
                              </button>
                              <button
                                onClick={() => setCurrentGalleryVideoIndex(Math.min(selectedGalleryVideos.length - 1, currentGalleryVideoIndex + 1))}
                                disabled={currentGalleryVideoIndex === selectedGalleryVideos.length - 1}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Next →
                              </button>
                            </div>
                          </div>

                          {/* Current video preview */}
                          <div className="flex items-center gap-3 mb-3 p-2 bg-gray-800 rounded">
                            <div className="w-16 h-10 bg-gray-900 rounded flex items-center justify-center text-2xl">
                              🎥
                            </div>
                            <div className="flex-1 text-sm">
                              <p className="text-white font-medium truncate">{selectedGalleryVideos[currentGalleryVideoIndex]?.name}</p>
                              <p className="text-gray-400">{(selectedGalleryVideos[currentGalleryVideoIndex]?.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>

                          {/* Metadata inputs for current video */}
                          <input
                            type="text"
                            placeholder="Video Title *"
                            value={selectedGalleryVideos[currentGalleryVideoIndex]?.title || ''}
                            onChange={(e) => {
                              const updated = [...selectedGalleryVideos];
                              updated[currentGalleryVideoIndex].title = e.target.value;
                              setSelectedGalleryVideos(updated);
                            }}
                            className="w-full bg-gray-600 text-white p-2 rounded mb-2"
                          />

                          <select
                            value={selectedGalleryVideos[currentGalleryVideoIndex]?.category || 'events'}
                            onChange={(e) => {
                              const updated = [...selectedGalleryVideos];
                              updated[currentGalleryVideoIndex].category = e.target.value;
                              setSelectedGalleryVideos(updated);
                            }}
                            className="w-full bg-gray-600 text-white p-2 rounded mb-2"
                          >
                            <option value="events">🎉 School Events</option>
                            <option value="sports">⚽ Sports Day</option>
                            <option value="cultural">🎭 Cultural Programs</option>
                            <option value="classroom">📚 Classroom Activities</option>
                            <option value="campus">🏫 Campus Tour</option>
                            <option value="other">🎬 Other</option>
                          </select>

                          <textarea
                            placeholder="Description (optional)"
                            value={selectedGalleryVideos[currentGalleryVideoIndex]?.description || ''}
                            onChange={(e) => {
                              const updated = [...selectedGalleryVideos];
                              updated[currentGalleryVideoIndex].description = e.target.value;
                              setSelectedGalleryVideos(updated);
                            }}
                            className="w-full bg-gray-600 text-white p-2 rounded mb-2 h-16 resize-none"
                          />

                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              type="number"
                              placeholder="Order"
                              value={selectedGalleryVideos[currentGalleryVideoIndex]?.order || 0}
                              onChange={(e) => {
                                const updated = [...selectedGalleryVideos];
                                updated[currentGalleryVideoIndex].order = parseInt(e.target.value) || 0;
                                setSelectedGalleryVideos(updated);
                              }}
                              className="bg-gray-600 text-white p-2 rounded"
                            />
                            <select
                              value={selectedGalleryVideos[currentGalleryVideoIndex]?.year || '2025-26'}
                              onChange={(e) => {
                                const updated = [...selectedGalleryVideos];
                                updated[currentGalleryVideoIndex].year = e.target.value;
                                setSelectedGalleryVideos(updated);
                              }}
                              className="bg-gray-600 text-white p-2 rounded"
                            >
                              <option value="2025-26">📅 2025-26</option>
                              <option value="2024-25">📅 2024-25</option>
                              <option value="2023-24">📅 2023-24</option>
                              <option value="2022-23">📅 2022-23</option>
                            </select>
                          </div>

                          {/* Thumbnail navigation */}
                          <div className="grid grid-cols-5 gap-2 mt-3">
                            {selectedGalleryVideos.map((video, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentGalleryVideoIndex(idx)}
                                className={`aspect-video rounded p-2 flex flex-col items-center justify-center text-xs ${
                                  idx === currentGalleryVideoIndex
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                              >
                                <div className="text-lg">🎥</div>
                                <div className="truncate w-full text-center">{idx + 1}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedGalleryVideos.length <= 1 && galleryVideoUploadPreview && (
                        <div className="mt-3">
                          <p className="text-gray-400 text-sm mb-2">Preview:</p>
                          <video 
                            src={galleryVideoUploadPreview}
                            controls
                            className="w-full rounded-lg max-h-64"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Preview for URL mode */}
                  {galleryVideoUploadMode === 'url' && newGalleryVideo.src && (() => {
                    const renderVideoPreview = () => {
                      const url = newGalleryVideo.src;
                      const type = newGalleryVideo.type;

                      // Render based on video type
                      switch (type) {
                        case 'youtube': {
                          const videoId = getYouTubeId(url);
                          if (!videoId) return <p className="text-red-400 text-sm">❌ Invalid YouTube URL</p>;
                          return (
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="Video Preview"
                              className="w-full h-full"
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
                              title="Video Preview"
                              className="w-full h-full"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          );
                        }

                        case 'instagram': {
                          const instaId = getInstagramId(url);
                          if (!instaId) return <p className="text-red-400 text-sm">❌ Invalid Instagram URL</p>;
                          return (
                            <iframe
                              src={`https://www.instagram.com/p/${instaId}/embed`}
                              title="Video Preview"
                              className="w-full h-full"
                              frameBorder="0"
                              allowFullScreen
                            />
                          );
                        }

                        case 'vimeo': {
                          const vimeoId = getVimeoId(url);
                          if (!vimeoId) return <p className="text-red-400 text-sm">❌ Invalid Vimeo URL</p>;
                          return (
                            <iframe
                              src={`https://player.vimeo.com/video/${vimeoId}`}
                              title="Video Preview"
                              className="w-full h-full"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        case 'direct':
                        default: {
                          return (
                            <video
                              src={url}
                              controls
                              className="w-full h-full"
                            >
                              Your browser does not support the video tag.
                            </video>
                          );
                        }
                      }
                    };

                    return (
                      <div className="mb-3">
                        <p className="text-gray-400 text-sm mb-2">Preview:</p>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          {renderVideoPreview()}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Only show these fields when NOT batch uploading */}
                  {(selectedGalleryVideos.length <= 1 || galleryVideoUploadMode === 'url') && (
                    <>
                      <input
                        type="text"
                        placeholder="Video Title *"
                        value={newGalleryVideo.title}
                        onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, title: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                      />

                      <select
                        value={newGalleryVideo.category}
                        onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, category: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
                      >
                        <option value="events">🎉 School Events</option>
                        <option value="sports">⚽ Sports Day</option>
                        <option value="Republic">🎭 Republic Day</option>
                        <option value="classroom">📚 Classroom Activities</option>
                        <option value="campus">🏫 Campus Tour</option>
                        <option value="other">🎬 Other</option>
                      </select>

                      <textarea
                        placeholder="Description (optional)"
                        value={newGalleryVideo.description}
                        onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, description: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3 h-20 resize-none"
                      />

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="number"
                          placeholder="Order"
                          value={newGalleryVideo.order}
                          onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, order: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 text-white p-3 rounded-lg"
                        />
                        <label className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newGalleryVideo.isActive}
                            onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, isActive: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm">Active</span>
                        </label>
                      </div>

                      <select
                        value={newGalleryVideo.year}
                        onChange={(e) => setNewGalleryVideo({ ...newGalleryVideo, year: e.target.value })}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
                      >
                        <option value="2025-26">📅 2025-26</option>
                        <option value="2024-25">📅 2024-25</option>
                        <option value="2023-24">📅 2023-24</option>
                        <option value="2022-23">📅 2022-23</option>
                      </select>
                    </>
                  )}

                  <div className="flex gap-3">
                    {editingGalleryVideo ? (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_URL}/admin/video-gallery/${editingGalleryVideo._id}`, {
                                method: 'PUT',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}` 
                                },
                                body: JSON.stringify(newGalleryVideo)
                              });
                              if (res.ok) {
                                setEditingGalleryVideo(null);
                                setNewGalleryVideo({ src: '', title: '', category: 'events', description: '', type: 'youtube', order: 0, isActive: true, year: '2025-26' });
                                setGalleryVideoUploadPreview('');
                                fetchGalleryVideos();
                              }
                            } catch (error) {
                              console.error('Error updating video:', error);
                            }
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-colors"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingGalleryVideo(null);
                            setNewGalleryVideo({ src: '', title: '', category: 'events', description: '', type: 'youtube', order: 0, isActive: true, year: '2025-26' });
                            setGalleryVideoUploadPreview('');
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : selectedGalleryVideos.length > 1 ? (
                      // Batch upload button for multiple videos
                      <button
                        onClick={async () => {
                          // Check that all videos have required title
                          const missingTitles = selectedGalleryVideos.filter(v => !v.title?.trim());
                          if (missingTitles.length > 0) {
                            alert(`Please provide titles for all videos. ${missingTitles.length} video(s) missing titles.`);
                            return;
                          }

                          setGalleryVideoUploading(true);
                          setGalleryVideoUploadProgress(0);

                          try {
                            // Prepare batch upload data
                            const videosData = selectedGalleryVideos.map(video => ({
                              videoData: video.data,
                              title: video.title,
                              description: video.description || '',
                              category: video.category || 'events',
                              year: video.year || '2025-26',
                              order: video.order || 0,
                              type: 'uploaded',
                              isActive: true
                            }));

                            const response = await fetch(`${API_URL}/admin/video-gallery/batch-upload`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({ videos: videosData })
                            });

                            if (response.ok) {
                              const result = await response.json();
                              alert(`Successfully uploaded ${result.successCount} of ${selectedGalleryVideos.length} videos!`);
                              
                              // Reset state
                              setSelectedGalleryVideos([]);
                              setCurrentGalleryVideoIndex(0);
                              setGalleryVideoUploadPreview('');
                              fetchGalleryVideos();
                            } else {
                              const error = await response.json();
                              alert(`Upload failed: ${error.error || 'Unknown error'}`);
                            }
                          } catch (error) {
                            console.error('Batch upload error:', error);
                            alert('Network error. Please try again.');
                          } finally {
                            setGalleryVideoUploading(false);
                            setGalleryVideoUploadProgress(0);
                          }
                        }}
                        disabled={galleryVideoUploading}
                        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {galleryVideoUploading ? (
                          <span>📤 Uploading {selectedGalleryVideos.length} Videos...</span>
                        ) : (
                          `🎬 Upload All ${selectedGalleryVideos.length} Videos`
                        )}
                      </button>
                    ) : (
                      // Single video upload button
                      <>
                        <button
                          onClick={async () => {
                            if (!newGalleryVideo.src || !newGalleryVideo.title) {
                              alert('Please provide video and title');
                              return;
                            }
                            
                            setGalleryVideoUploading(true);
                            setGalleryVideoUploadProgress(0);
                            
                            try {
                              const endpoint = galleryVideoUploadMode === 'upload' 
                                ? `${API_URL}/admin/video-gallery/upload`
                                : `${API_URL}/admin/video-gallery`;
                              const body = galleryVideoUploadMode === 'upload'
                                ? { videoData: newGalleryVideo.src, ...newGalleryVideo }
                                : newGalleryVideo;
                              
                              // Use XMLHttpRequest for progress tracking
                              await new Promise((resolve, reject) => {
                                const xhr = new XMLHttpRequest();
                                
                                xhr.upload.addEventListener('progress', (e) => {
                                  if (e.lengthComputable) {
                                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                                    setGalleryVideoUploadProgress(percentComplete);
                                  }
                                });
                                
                                xhr.addEventListener('load', () => {
                                  if (xhr.status >= 200 && xhr.status < 300) {
                                    resolve(xhr.response);
                                  } else {
                                    reject(new Error(`Upload failed with status ${xhr.status}`));
                                  }
                                });
                                
                                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
                                
                                xhr.open('POST', endpoint);
                                xhr.setRequestHeader('Content-Type', 'application/json');
                                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                                xhr.send(JSON.stringify(body));
                              });
                              
                              setNewGalleryVideo({ src: '', title: '', category: 'events', description: '', type: 'youtube', order: 0, isActive: true, year: '2025-26' });
                              setGalleryVideoUploadPreview('');
                              setGalleryVideoUploadProgress(0);
                              fetchGalleryVideos();
                            } catch (error) {
                              console.error('Error adding video:', error);
                              alert('Upload failed. Please try again.');
                            } finally {
                              setGalleryVideoUploading(false);
                            }
                          }}
                          disabled={galleryVideoUploading}
                          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {galleryVideoUploading ? (
                            <span>📤 Uploading... {galleryVideoUploadProgress}%</span>
                          ) : (
                            '➕ Add Video'
                          )}
                        </button>
                        
                        {/* Progress Bar */}
                        {galleryVideoUploading && (
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full transition-all duration-300"
                              style={{ width: `${galleryVideoUploadProgress}%` }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Gallery Photos/Videos List */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                  {galleryType === 'photo' ? `📷 Gallery Photos (${galleryPhotos.length})` : `🎬 Gallery Videos (${galleryVideos.length})`}
                </h3>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="events">🎉 Events</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="cultural">🎭 Cultural</option>
                  <option value="classroom">📚 Classroom</option>
                  <option value="campus">🏫 Campus</option>
                  <option value="other">{galleryType === 'photo' ? '📷' : '🎬'} Other</option>
                </select>
              </div>
              
              {/* PHOTOS LIST */}
              {galleryType === 'photo' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                  {galleryPhotos
                    .filter(photo => galleryCategory === 'all' || photo.category === galleryCategory)
                    .map((photo) => (
                    <div key={photo._id} className={`relative group rounded-lg overflow-hidden ${!photo.isActive ? 'opacity-50' : ''}`}>
                      <img 
                        src={photo.src} 
                        alt={photo.title} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <p className="text-white text-xs font-medium text-center line-clamp-2">{photo.title}</p>
                        <span className="text-xs px-2 py-0.5 bg-blue-600 rounded capitalize">{photo.category}</span>
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => {
                              setGalleryType('photo');
                              setEditingGalleryPhoto(photo);
                              setNewGalleryPhoto({
                                src: photo.src,
                                title: photo.title,
                                category: photo.category,
                                description: photo.description || '',
                                order: photo.order || 0,
                                isActive: photo.isActive,
                                year: photo.year || '2025-26'
                              });
                              if (photo.isUploaded) {
                                setGalleryUploadMode('upload');
                                setGalleryUploadPreview(photo.src);
                              } else {
                                setGalleryUploadMode('url');
                              }
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this photo?')) {
                                try {
                                  await fetch(`${API_URL}/admin/gallery/${photo._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  fetchGalleryPhotos();
                                } catch (error) {
                                  console.error('Error deleting photo:', error);
                                }
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {!photo.isActive && (
                        <span className="absolute top-1 right-1 text-xs bg-red-600 px-1 rounded">Hidden</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIDEOS LIST */}
              {galleryType === 'video' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                  {galleryVideos
                    .filter(video => galleryCategory === 'all' || video.category === galleryCategory)
                    .map((video) => (
                    <div key={video._id} className={`relative group rounded-lg overflow-hidden bg-gray-900 ${!video.isActive ? 'opacity-50' : ''}`}>
                      <div className="w-full h-32 flex items-center justify-center bg-black">
                        {(() => {
                          const thumbnail = getVideoThumbnail(video);
                          return thumbnail ? (
                            <img 
                              src={thumbnail} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span class="text-4xl">🎬</span>';
                              }}
                            />
                          ) : (
                            <span className="text-4xl">🎬</span>
                          );
                        })()}
                      </div>
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <p className="text-white text-xs font-medium text-center line-clamp-2">{video.title}</p>
                        <span className="text-xs px-2 py-0.5 bg-purple-600 rounded capitalize">{video.category}</span>
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => {
                              setGalleryType('video');
                              setEditingGalleryVideo(video);
                              setNewGalleryVideo({
                                src: video.src,
                                title: video.title,
                                category: video.category,
                                description: video.description || '',
                                type: video.type || 'youtube',
                                thumbnail: video.thumbnail || '',
                                order: video.order || 0,
                                isActive: video.isActive,
                                year: video.year || '2025-26'
                              });
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this video?')) {
                                try {
                                  await fetch(`${API_URL}/admin/video-gallery/${video._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  fetchGalleryVideos();
                                } catch (error) {
                                  console.error('Error deleting video:', error);
                                }
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {!video.isActive && (
                        <span className="absolute top-1 right-1 text-xs bg-red-600 px-1 rounded">Hidden</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {galleryType === 'photo' && galleryPhotos.filter(photo => galleryCategory === 'all' || photo.category === galleryCategory).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">📷</p>
                  <p>No photos in this category</p>
                </div>
              )}

              {galleryType === 'video' && galleryVideos.filter(video => galleryCategory === 'all' || video.category === galleryCategory).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">🎬</p>
                  <p>No videos in this category</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ CURRICULUM TAB ============ */}
        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Curriculum Form */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-lg font-bold mb-4">
                {editingCurriculum ? '✏️ Edit Curriculum' : '➕ Add Curriculum Level'}
              </h2>

              <select
                value={newCurriculum.level}
                onChange={(e) => setNewCurriculum({ ...newCurriculum, level: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
              >
                <option value="preprimary">🌟 Pre-Primary (Nursery, LKG, UKG)</option>
                <option value="primary">📚 Primary (Classes I-V)</option>
                <option value="middle">🔬 Middle School (Classes VI-VIII)</option>
                <option value="secondary">🎯 Secondary (Classes IX-X)</option>
                <option value="senior">🎓 Senior Secondary (Classes XI-XII)</option>
              </select>

              <input
                type="text"
                placeholder="Title (e.g., 'Pre-Primary Education')"
                value={newCurriculum.title}
                onChange={(e) => setNewCurriculum({ ...newCurriculum, title: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
              />

              <input
                type="text"
                placeholder="Age Group (e.g., '3-6 years')"
                value={newCurriculum.age}
                onChange={(e) => setNewCurriculum({ ...newCurriculum, age: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
              />

              <textarea
                placeholder="Description..."
                value={newCurriculum.description}
                onChange={(e) => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3 h-24 resize-none"
              />

              {/* Subjects */}
              <div className="mb-3">
                <label className="text-sm text-gray-400 mb-2 block">Subjects</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newSubjectInput.icon}
                    onChange={(e) => setNewSubjectInput({ ...newSubjectInput, icon: e.target.value })}
                    className="bg-gray-700 text-white p-2 rounded-lg w-16"
                  >
                    {['📚', '📖', '✏️', '🔢', '🔬', '🌍', '🎨', '🎵', '💻', '🏃', '🧪', '📐', '🌐', '💼', '🧮', '📝'].map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Subject name"
                    value={newSubjectInput.name}
                    onChange={(e) => setNewSubjectInput({ ...newSubjectInput, name: e.target.value })}
                    className="flex-1 bg-gray-700 text-white p-2 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      if (newSubjectInput.name.trim()) {
                        setNewCurriculum({
                          ...newCurriculum,
                          subjects: [...newCurriculum.subjects, { ...newSubjectInput }]
                        });
                        setNewSubjectInput({ name: '', icon: '📚' });
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCurriculum.subjects.map((subject, idx) => (
                    <span key={idx} className="bg-gray-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {subject.icon} {subject.name}
                      <button
                        onClick={() => setNewCurriculum({
                          ...newCurriculum,
                          subjects: newCurriculum.subjects.filter((_, i) => i !== idx)
                        })}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Streams (for senior secondary) */}
              {(newCurriculum.level === 'secondary' || newCurriculum.level === 'senior') && (
                <div className="mb-3">
                  <label className="text-sm text-gray-400 mb-2 block">Streams</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Stream name (e.g., Science)"
                      value={newStreamInput}
                      onChange={(e) => setNewStreamInput(e.target.value)}
                      className="flex-1 bg-gray-700 text-white p-2 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (newStreamInput.trim()) {
                          setNewCurriculum({
                            ...newCurriculum,
                            streams: [...newCurriculum.streams, newStreamInput.trim()]
                          });
                          setNewStreamInput('');
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newCurriculum.streams.map((stream, idx) => (
                      <span key={idx} className="bg-purple-600/30 px-2 py-1 rounded text-sm flex items-center gap-1">
                        {stream}
                        <button
                          onClick={() => setNewCurriculum({
                            ...newCurriculum,
                            streams: newCurriculum.streams.filter((_, i) => i !== idx)
                          })}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div className="mb-3">
                <label className="text-sm text-gray-400 mb-2 block">Highlights</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a highlight..."
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    className="flex-1 bg-gray-700 text-white p-2 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      if (newHighlightInput.trim()) {
                        setNewCurriculum({
                          ...newCurriculum,
                          highlights: [...newCurriculum.highlights, newHighlightInput.trim()]
                        });
                        setNewHighlightInput('');
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-1">
                  {newCurriculum.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-700/50 px-2 py-1 rounded text-sm">
                      <span>✓ {highlight}</span>
                      <button
                        onClick={() => setNewCurriculum({
                          ...newCurriculum,
                          highlights: newCurriculum.highlights.filter((_, i) => i !== idx)
                        })}
                        className="text-red-400 hover:text-red-300"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="number"
                  placeholder="Order"
                  value={newCurriculum.order}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, order: parseInt(e.target.value) || 0 })}
                  className="bg-gray-700 text-white p-3 rounded-lg"
                />
                <label className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCurriculum.isActive}
                    onChange={(e) => setNewCurriculum({ ...newCurriculum, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Active</span>
                </label>
              </div>

              <div className="flex gap-3">
                {editingCurriculum ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_URL}/admin/curriculum/${editingCurriculum._id}`, {
                            method: 'PUT',
                            headers: { 
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}` 
                            },
                            body: JSON.stringify(newCurriculum)
                          });
                          if (res.ok) {
                            setEditingCurriculum(null);
                            setNewCurriculum({
                              level: 'preprimary', title: '', age: '', description: '',
                              subjects: [], streams: [], highlights: [], isActive: true, order: 0
                            });
                            fetchCurriculum();
                          }
                        } catch (error) {
                          console.error('Error updating curriculum:', error);
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingCurriculum(null);
                        setNewCurriculum({
                          level: 'preprimary', title: '', age: '', description: '',
                          subjects: [], streams: [], highlights: [], isActive: true, order: 0
                        });
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      if (!newCurriculum.title) {
                        alert('Please provide a title');
                        return;
                      }
                      try {
                        const res = await fetch(`${API_URL}/admin/curriculum`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}` 
                          },
                          body: JSON.stringify(newCurriculum)
                        });
                        if (res.ok) {
                          setNewCurriculum({
                            level: 'preprimary', title: '', age: '', description: '',
                            subjects: [], streams: [], highlights: [], isActive: true, order: 0
                          });
                          fetchCurriculum();
                        }
                      } catch (error) {
                        console.error('Error adding curriculum:', error);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors"
                  >
                    ➕ Add Curriculum
                  </button>
                )}
              </div>
            </div>

            {/* Curriculum List */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">📚 Curriculum Levels ({curriculumData.length})</h3>
              
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {curriculumData.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-4xl mb-2">📚</p>
                    <p>No curriculum data yet. Add your first level!</p>
                  </div>
                ) : (
                  curriculumData.map((curr) => (
                    <div key={curr._id} className={`bg-gray-700/50 rounded-xl p-4 ${!curr.isActive ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            curr.level === 'preprimary' ? 'bg-pink-600/30 text-pink-300' :
                            curr.level === 'primary' ? 'bg-blue-600/30 text-blue-300' :
                            curr.level === 'middle' ? 'bg-green-600/30 text-green-300' :
                            curr.level === 'secondary' ? 'bg-yellow-600/30 text-yellow-300' :
                            'bg-purple-600/30 text-purple-300'
                          }`}>
                            {curr.level.toUpperCase()}
                          </span>
                          <h4 className="text-lg font-bold text-white mt-2">{curr.title}</h4>
                          {curr.age && <p className="text-sm text-gray-400">Age: {curr.age}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCurriculum(curr);
                              setNewCurriculum({
                                level: curr.level,
                                title: curr.title,
                                age: curr.age || '',
                                description: curr.description || '',
                                subjects: curr.subjects || [],
                                streams: curr.streams || [],
                                highlights: curr.highlights || [],
                                isActive: curr.isActive,
                                order: curr.order || 0
                              });
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this curriculum level?')) {
                                try {
                                  await fetch(`${API_URL}/admin/curriculum/${curr._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  fetchCurriculum();
                                } catch (error) {
                                  console.error('Error deleting curriculum:', error);
                                }
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      {curr.description && (
                        <p className="text-sm text-gray-300 mb-3">{curr.description}</p>
                      )}
                      
                      {curr.subjects && curr.subjects.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-400 mb-1">Subjects:</p>
                          <div className="flex flex-wrap gap-1">
                            {curr.subjects.map((subj, idx) => (
                              <span key={idx} className="bg-gray-600 px-2 py-0.5 rounded text-xs">
                                {subj.icon} {subj.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {curr.streams && curr.streams.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-400 mb-1">Streams:</p>
                          <div className="flex flex-wrap gap-1">
                            {curr.streams.map((stream, idx) => (
                              <span key={idx} className="bg-purple-600/30 px-2 py-0.5 rounded text-xs">
                                {stream}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {curr.highlights && curr.highlights.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Highlights:</p>
                          <ul className="text-xs text-gray-300 space-y-0.5">
                            {curr.highlights.slice(0, 3).map((h, idx) => (
                              <li key={idx}>✓ {h}</li>
                            ))}
                            {curr.highlights.length > 3 && (
                              <li className="text-gray-500">+{curr.highlights.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {!curr.isActive && (
                        <span className="text-xs text-red-400 mt-2 block">⚠️ Hidden from website</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ ANNUAL EVENTS TAB ============ */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Form */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-lg font-bold mb-4">
                {editingEvent ? '✏️ Edit Event' : '➕ Add Annual Event'}
              </h2>

              <select
                value={newEvent.month}
                onChange={(e) => setNewEvent({ ...newEvent, month: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Date (e.g., '15', '1-5', 'TBA')"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
              />

              <input
                type="text"
                placeholder="Event Title *"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3"
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="bg-gray-700 text-white p-3 rounded-lg"
                >
                  <option value="academic">📚 Academic</option>
                  <option value="holiday">🏖️ Holiday</option>
                  <option value="exam">📝 Exam</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="cultural">🎭 Cultural</option>
                  <option value="event">📅 General Event</option>
                </select>

                <select
                  value={newEvent.icon}
                  onChange={(e) => setNewEvent({ ...newEvent, icon: e.target.value })}
                  className="bg-gray-700 text-white p-3 rounded-lg"
                >
                  {['📅', '🎉', '📚', '🏖️', '📝', '⚽', '🎭', '🎄', '🪔', '🎊', '🏆', '🎓', '🌟', '🎪', '🎨', '🏃', '📖', '✨'].map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-3 h-20 resize-none"
              />

              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="number"
                  placeholder="Order"
                  value={newEvent.order}
                  onChange={(e) => setNewEvent({ ...newEvent, order: parseInt(e.target.value) || 0 })}
                  className="bg-gray-700 text-white p-3 rounded-lg"
                />
                <label className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEvent.isActive}
                    onChange={(e) => setNewEvent({ ...newEvent, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Active</span>
                </label>
              </div>

              <div className="flex gap-3">
                {editingEvent ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_URL}/admin/annual-events/${editingEvent._id}`, {
                            method: 'PUT',
                            headers: { 
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}` 
                            },
                            body: JSON.stringify(newEvent)
                          });
                          if (res.ok) {
                            setEditingEvent(null);
                            setNewEvent({
                              month: 'January', date: '', title: '', type: 'event',
                              icon: '📅', description: '', isActive: true, order: 0
                            });
                            fetchAnnualEvents();
                          }
                        } catch (error) {
                          console.error('Error updating event:', error);
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingEvent(null);
                        setNewEvent({
                          month: 'January', date: '', title: '', type: 'event',
                          icon: '📅', description: '', isActive: true, order: 0
                        });
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      if (!newEvent.title) {
                        alert('Please provide an event title');
                        return;
                      }
                      try {
                        const res = await fetch(`${API_URL}/admin/annual-events`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}` 
                          },
                          body: JSON.stringify(newEvent)
                        });
                        if (res.ok) {
                          setNewEvent({
                            month: 'January', date: '', title: '', type: 'event',
                            icon: '📅', description: '', isActive: true, order: 0
                          });
                          fetchAnnualEvents();
                        }
                      } catch (error) {
                        console.error('Error adding event:', error);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors"
                  >
                    ➕ Add Event
                  </button>
                )}
              </div>
            </div>

            {/* Events List */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">📅 Annual Events ({annualEvents.length})</h3>
                <select
                  value={eventMonthFilter}
                  onChange={(e) => setEventMonthFilter(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <option value="all">All Months</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {annualEvents.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-4xl mb-2">📅</p>
                    <p>No events yet. Add your first event!</p>
                  </div>
                ) : (
                  annualEvents
                    .filter(event => eventMonthFilter === 'all' || event.month === eventMonthFilter)
                    .map((event) => (
                      <div key={event._id} className={`bg-gray-700/50 rounded-lg p-4 flex items-center gap-4 ${!event.isActive ? 'opacity-50' : ''}`}>
                        <div className="text-3xl">{event.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              event.type === 'academic' ? 'bg-blue-600/30 text-blue-300' :
                              event.type === 'holiday' ? 'bg-green-600/30 text-green-300' :
                              event.type === 'exam' ? 'bg-red-600/30 text-red-300' :
                              event.type === 'sports' ? 'bg-yellow-600/30 text-yellow-300' :
                              event.type === 'cultural' ? 'bg-purple-600/30 text-purple-300' :
                              'bg-gray-600/30 text-gray-300'
                            }`}>
                              {event.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {event.month} {event.date && `(${event.date})`}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                          )}
                          {!event.isActive && (
                            <span className="text-xs text-red-400">⚠️ Hidden</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setNewEvent({
                                month: event.month,
                                date: event.date || '',
                                title: event.title,
                                type: event.type,
                                icon: event.icon,
                                description: event.description || '',
                                isActive: event.isActive,
                                order: event.order || 0
                              });
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this event?')) {
                                try {
                                  await fetch(`${API_URL}/admin/annual-events/${event._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  fetchAnnualEvents();
                                } catch (error) {
                                  console.error('Error deleting event:', error);
                                }
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
              
              {annualEvents.filter(event => eventMonthFilter === 'all' || event.month === eventMonthFilter).length === 0 && 
               eventMonthFilter !== 'all' && annualEvents.length > 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p>No events in {eventMonthFilter}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ IMPORT/EXPORT TAB ============ */}
        {activeTab === 'import-export' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Import */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-lg font-bold mb-4">📥 Import Data</h2>
              <p className="text-sm text-gray-400 mb-3">
                Selected: <span className="text-blue-400">{selectedCollection || 'None (select from Database tab)'}</span>
              </p>
              <textarea
                placeholder='[{"field": "value"}, {"field": "value2"}]'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 font-mono text-sm h-64"
              />
              <button
                onClick={handleImport}
                disabled={!selectedCollection}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-colors"
              >
                📥 Import to {selectedCollection || 'Collection'}
              </button>
            </div>

            {/* Export */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-lg font-bold mb-4">📤 Export Data</h2>
              <p className="text-sm text-gray-400 mb-3">
                Export all documents from a collection as JSON
              </p>
              
              <div className="space-y-2 mb-4">
                {collections.map((col) => (
                  <div
                    key={col.name}
                    className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
                  >
                    <span>{col.name} ({col.count} docs)</span>
                    <button
                      onClick={() => { setSelectedCollection(col.name); handleExport(); }}
                      className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded text-sm"
                    >
                      Export
                    </button>
                  </div>
                ))}
              </div>

              {/* Database Info */}
              {dbStats && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold mb-2">📊 Database Info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Database: <span className="text-blue-400">{dbStats.database}</span></div>
                    <div>Collections: <span className="text-green-400">{dbStats.collections}</span></div>
                    <div>Documents: <span className="text-yellow-400">{dbStats.documents}</span></div>
                    <div>Storage: <span className="text-purple-400">{dbStats.storageSize}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
