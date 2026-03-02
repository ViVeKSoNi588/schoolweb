import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import SocialSidebar from './Components/SocialSidebar'
import Navbar from './Components/nav'
import ImageCarousel from './Components/scroll'
import VideoPlayer from './Components/video'
import Content from './Components/Content'
import API_URL from './config'
import './App.css'

// Lazy-load below-fold home page sections
const BulletinBoard = lazy(() => import('./Components/BulletinBoard'))
const FeedbackForm = lazy(() => import('./Components/FeedbackForm'))

// Lazy-load all route-level pages (not needed on initial home page load)
const PrePrimary = lazy(() => import('./Components/PrePrimary'))
const Contact = lazy(() => import('./Components/Contact'))
const Admission = lazy(() => import('./Components/Admission'))
const Gallery = lazy(() => import('./Components/gallary'))
const VideoGallery = lazy(() => import('./Components/VideoGallery'))
const AboutUs = lazy(() => import('./Components/AboutUs'))
const Curriculum = lazy(() => import('./Components/Curriculum'))
const AnnualFixture = lazy(() => import('./Components/AnnualFixture'))
const AdminPanel = lazy(() => import('./Components/AdminPanel'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

// Cache keys must match what each component reads from localStorage
const LS_CAROUSEL = 'vat_carousel_cache_home';
const LS_VIDEOS   = 'vat_videos_cache';
const HOME_CACHE_TTL = 10 * 60 * 1000; // 10 min

function HomePage() {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    // Check if all caches are still warm — if so, skip the /api/home fetch entirely
    const now = Date.now();
    const carouselRaw = localStorage.getItem(LS_CAROUSEL);
    const videosRaw   = localStorage.getItem(LS_VIDEOS);
    const carouselFresh = carouselRaw  && (now - JSON.parse(carouselRaw).ts  < HOME_CACHE_TTL);
    const videosFresh   = videosRaw    && (now - JSON.parse(videosRaw).ts    < HOME_CACHE_TTL);

    if (carouselFresh && videosFresh) return; // all cached, nothing to prefetch

    // Single round-trip fetches carousel + videos + content + announcements at once
    fetch(`${API_URL}/home`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const ts = Date.now();
        // Pre-populate localStorage so child components skip their own fetches
        if (data.carousel?.length)
          localStorage.setItem(LS_CAROUSEL, JSON.stringify({ data: data.carousel, ts }));
        if (data.videos?.length)
          localStorage.setItem(LS_VIDEOS, JSON.stringify({ data: data.videos, ts }));
        // Pass data as props so components render immediately without a second read
        setHomeData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialSidebar />
      <Navbar />
      <ImageCarousel interval={4000} category="home" initialData={homeData?.carousel || null} />

      {/* Main Content Section */}
      <div className="px-4 lg:px-8 py-10">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Side - Video & Content */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
            <VideoPlayer initialData={homeData?.videos || null} />
            <Content id="video_section_info" className="flex-1" />
          </div>

          {/* Right Side - Bulletin Board */}
          <div className="xl:w-72 flex-shrink-0">
            <Suspense fallback={<SectionLoader />}>
              <BulletinBoard />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-300 text-sm font-semibold px-5 py-2 rounded-full mb-4 border border-white/20">✉️ CONTACT US</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Get In Touch</h2>
            <p className="text-blue-200/80 max-w-2xl mx-auto text-lg">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            {/* Feedback Form */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <Suspense fallback={<SectionLoader />}>
                <FeedbackForm className="h-full" />
              </Suspense>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">Contact Information</h3>
                <p className="text-blue-200/70 mb-8">Reach out to us through any of these channels</p>

                <div className="space-y-5 flex-1">
                  <a href="tel:+919876543210" className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/20">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">📞</div>
                    <div>
                      <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">Phone</p>
                      <p className="font-semibold text-white text-lg">+91 9537690994</p>
                    </div>
                  </a>

                  <a href="mailto:info@vatsalyaschool.com" className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/20">
                    <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">✉️</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">Email</p>
                      <p className="font-semibold text-white text-sm break-all">preschoolvatsalyainternational@gmail.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-transparent">
                    <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">📍</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">Address</p>
                      <p className="font-semibold text-white text-sm break-words">Opp. Nutan Club, Nana Bazaar, vidhyanagar , Anand - 388120</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-blue-200/60 text-sm text-center">⏱️ We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Vatsalya International School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preprimary" element={<Suspense fallback={<PageLoader />}><PrePrimary /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
        <Route path="/admissions" element={<Suspense fallback={<PageLoader />}><Admission /></Suspense>} />
        <Route path="/gallery" element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
        <Route path="/video-gallery" element={<Suspense fallback={<PageLoader />}><VideoGallery /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutUs /></Suspense>} />
        <Route path="/academics/curriculum" element={<Suspense fallback={<PageLoader />}><Curriculum /></Suspense>} />
        <Route path="/academics/annual-fixture" element={<Suspense fallback={<PageLoader />}><AnnualFixture /></Suspense>} />
        <Route path="/admin-secret-panel" element={<Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>} />
      </Routes>
    </Router>
  )
}

export default App
