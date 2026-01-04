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
  
  // Video management
  const [newVideo, setNewVideo] = useState({ title: '', description: '', src: '', type: 'youtube', order: 0, isActive: true });
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoUploadMode, setVideoUploadMode] = useState('youtube'); // 'youtube', 'url', or 'upload'
  const [videoUploadPreview, setVideoUploadPreview] = useState('');
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState('');
  
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
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true });
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState(null);
  const [galleryUploadMode, setGalleryUploadMode] = useState('url'); // 'url' or 'upload'
  const [galleryUploadPreview, setGalleryUploadPreview] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('all'); // filter for viewing

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
      const res = await fetch(`${API_URL}/admin/videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
        setSelectedCollection('videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
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

  // File upload handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Image size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Video file upload handler
  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('Video size must be less than 100MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      if (uploadMode === 'upload' && uploadPreview) {
        // Upload base64 image
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
    
    // Validate title is provided
    if (!newVideo.title || !newVideo.title.trim()) {
      alert('Please provide a video title');
      return;
    }
    
    try {
      if (videoUploadMode === 'upload' && videoUploadPreview) {
        // Upload base64 video
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
        
        console.log('Sending video data:', videoData);
        
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
    }
  };

  const handleUpdateVideo = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/videos/${editingVideo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingVideo)
      });
      if (res.ok) {
        setEditingVideo(null);
        fetchVideos();
      } else {
        alert('Failed to update video');
      }
    } catch {
      alert('Error updating video');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchVideos();
      } else {
        alert('Failed to delete video');
      }
    } catch {
      alert('Error deleting video');
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
          <div className="flex gap-1">
            {['database', 'videos', 'gallery', 'import-export'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'database' && '🗄️ Database'}
                {tab === 'videos' && '🎬 Videos'}
                {tab === 'gallery' && '🖼️ Gallery'}
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
                      📤 Upload File
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
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-600/50">
                        {uploadPreview ? (
                          <img src={uploadPreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <span className="text-3xl">📁</span>
                            <p className="text-gray-400 mt-1 text-sm">Click to select image (max 10MB)</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    )}
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
                        disabled={uploadMode === 'upload' && !uploadPreview}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-medium"
                      >
                        ➕ Add
                      </button>
                    </div>
                  </form>

                  {/* Images Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-auto">
                    {documents.map((image) => (
                      <div key={image._id} className={`bg-gray-700/50 rounded-lg overflow-hidden ${!image.isActive && 'opacity-50'}`}>
                        <img src={image.src} alt={image.alt} className="w-full h-32 object-cover" />
                        
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
                    ))}
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
            <div className="flex gap-2 mb-6">
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
                onClick={() => setVideoUploadMode('url')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  videoUploadMode === 'url' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>🔗</span> Video URL
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
                      <label className="block text-gray-300 mb-2 text-sm">Video URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/video.mp4"
                        value={newVideo.src}
                        onChange={(e) => setNewVideo({ ...newVideo, src: e.target.value })}
                        className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  )}
                  
                  {videoUploadMode === 'upload' && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Upload Video File</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-green-500 transition-colors bg-gray-600/50">
                        {videoUploadPreview ? (
                          <div className="text-center">
                            <span className="text-4xl">✅</span>
                            <p className="text-green-400 mt-2 text-sm">Video selected</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-4xl">🎥</span>
                            <p className="text-gray-400 mt-2 text-sm">Click to select video (max 100MB)</p>
                            <p className="text-gray-500 text-xs">MP4, WebM, MOV supported</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleVideoFileSelect} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  )}
                </div>

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
                {videoUploadMode !== 'youtube' && (
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
              </div>

              <button 
                type="submit"
                disabled={videoUploadMode === 'upload' && !videoUploadPreview}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-colors"
              >
                ➕ Add Video
              </button>
            </form>

            {/* Videos List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📋 Videos List
                <button 
                  onClick={fetchVideos}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                >
                  🔄 Refresh
                </button>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-auto">
                {documents.map((video) => (
                  <div 
                    key={video._id} 
                    className={`bg-gray-700/50 rounded-xl overflow-hidden ${!video.isActive && 'opacity-50'}`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-gray-800">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : video.type === 'youtube' && getYouTubeId(video.src) ? (
                        <img 
                          src={`https://img.youtube.com/vi/${getYouTubeId(video.src)}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl">🎥</span>
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          video.type === 'youtube' 
                            ? 'bg-red-600 text-white' 
                            : video.type === 'uploaded'
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {video.type === 'youtube' ? '▶️ YouTube' : video.type === 'uploaded' ? '📤 Uploaded' : '🔗 URL'}
                        </span>
                      </div>
                      
                      {/* Active Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs px-2 py-1 rounded ${video.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {video.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Video Info */}
                    {editingVideo?._id === video._id ? (
                      <div className="p-3 space-y-2">
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
                            className="w-20 p-2 bg-gray-600 rounded text-sm"
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
                          <button onClick={handleUpdateVideo} className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm">
                            💾 Save
                          </button>
                          <button onClick={() => setEditingVideo(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded text-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        {video.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{video.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Order: {video.order}</p>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => setEditingVideo(video)} 
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteVideo(video._id)} 
                            className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ GALLERY TAB ============ */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add New Photo Form */}
            <div className="bg-gray-800 p-6 rounded-xl">
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
                    📷 Choose Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setGalleryUploadPreview(reader.result);
                            setNewGalleryPhoto({ ...newGalleryPhoto, src: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {galleryUploadPreview && (
                    <img 
                      src={galleryUploadPreview} 
                      alt="Preview" 
                      className="mt-3 w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

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

              <div className="grid grid-cols-2 gap-3 mb-4">
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

              <div className="flex gap-3">
                {editingGalleryPhoto ? (
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
                            setNewGalleryPhoto({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true });
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
                        setNewGalleryPhoto({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true });
                        setGalleryUploadPreview('');
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      if (!newGalleryPhoto.src || !newGalleryPhoto.title) {
                        alert('Please provide image and title');
                        return;
                      }
                      try {
                        const endpoint = galleryUploadMode === 'upload' 
                          ? `${API_URL}/admin/gallery/upload`
                          : `${API_URL}/admin/gallery`;
                        const body = galleryUploadMode === 'upload'
                          ? { imageData: newGalleryPhoto.src, ...newGalleryPhoto }
                          : newGalleryPhoto;
                        
                        const res = await fetch(endpoint, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}` 
                          },
                          body: JSON.stringify(body)
                        });
                        if (res.ok) {
                          setNewGalleryPhoto({ src: '', title: '', category: 'events', description: '', order: 0, isActive: true });
                          setGalleryUploadPreview('');
                          fetchGalleryPhotos();
                        }
                      } catch (error) {
                        console.error('Error adding photo:', error);
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors"
                  >
                    ➕ Add Photo
                  </button>
                )}
              </div>
            </div>

            {/* Gallery Photos List */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">🖼️ Gallery Photos ({galleryPhotos.length})</h3>
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
                  <option value="other">📷 Other</option>
                </select>
              </div>
              
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
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-white text-xs font-medium text-center line-clamp-2">{photo.title}</p>
                      <span className="text-xs px-2 py-0.5 bg-blue-600 rounded capitalize">{photo.category}</span>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => {
                            setEditingGalleryPhoto(photo);
                            setNewGalleryPhoto({
                              src: photo.src,
                              title: photo.title,
                              category: photo.category,
                              description: photo.description || '',
                              order: photo.order || 0,
                              isActive: photo.isActive
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
                    {/* Status badge */}
                    {!photo.isActive && (
                      <span className="absolute top-1 right-1 text-xs bg-red-600 px-1 rounded">Hidden</span>
                    )}
                  </div>
                ))}
              </div>

              {galleryPhotos.filter(photo => galleryCategory === 'all' || photo.category === galleryCategory).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">📷</p>
                  <p>No photos in this category</p>
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
