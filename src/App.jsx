import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Components/nav'
import ImageCarousel from './Components/scroll'
import AdminPanel from './Components/AdminPanel'
import VideoPlayer from './Components/video'
import './App.css'
import Content from './Components/Content'
import FeedbackForm from './Components/FeedbackForm'
import BulletinBoard from './Components/BulletinBoard'
import PrePrimary from './Components/PrePrimary'
import Contact from './Components/Contact'
import Admission from './Components/Admission'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-50">
            {/* Sticky Social Media Sidebar */}
            <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2">
              <a href="https://facebook.com/vatsalyaschool" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md hover:scale-110 transition-all">
                f
              </a>
              <a href="https://instagram.com/vatsalyaschool" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com/@vatsalyaschool" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md hover:scale-110 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://twitter.com/vatsalyaschool" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-black hover:bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold shadow-md hover:scale-110 transition-all">
                𝕏
              </a>
            </div>
            
            <Navbar />
            <ImageCarousel interval={4000} category="home" />
            
            {/* Main Content Section */}
            <div className="px-4 lg:px-8 py-10">
              <div className="flex flex-col xl:flex-row gap-6">
                {/* Left Side - Video & Content */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6">
                  <VideoPlayer />
                  <Content id="video_section_info" className="flex-1" />
                </div>
                
                {/* Right Side - Bulletin Board */}
                <div className="xl:w-72 flex-shrink-0">
                  <BulletinBoard />
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
                    <FeedbackForm className="h-full" />
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
                            <p className="font-semibold text-white text-lg">+91 98765 43210</p>
                          </div>
                        </a>
                        
                        <a href="mailto:info@vatsalyaschool.com" className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group border border-transparent hover:border-white/20">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">✉️</div>
                          <div>
                            <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">Email</p>
                            <p className="font-semibold text-white text-lg">info@vatsalyaschool.com</p>
                          </div>
                        </a>
                        
                        <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-transparent">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">📍</div>
                          <div>
                            <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">Address</p>
                            <p className="font-semibold text-white">123 School Road, City, State</p>
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
        } />
        <Route path="/preprimary" element={<PrePrimary />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admissions" element={<Admission />} />
        <Route path="/admin-secret-panel" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App
