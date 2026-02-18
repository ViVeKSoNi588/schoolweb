import { useState, useEffect } from 'react';
import Navbar from './nav';
import API_URL from '../config';

function AboutUs() {
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    // Fetch custom content from API if available
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/content/about_us`);
        if (res.ok) {
          const data = await res.json();
          setAboutContent(data);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    };
    fetchContent();
  }, []);

  const stats = [
    { number: 'New', label: 'School Opening' },
    { number: '150+', label: 'Seats Available' },
    { number: '15+', label: 'Trained Teachers' },
    { number: '100%', label: 'Care & Dedication' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, pushing boundaries and setting high standards.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Embracing modern teaching methodologies and technology to enhance learning experiences.'
    },
    {
      icon: '🤝',
      title: 'Integrity',
      description: 'Building character through honesty, respect, and ethical behavior in all aspects of school life.'
    },
    {
      icon: '🌱',
      title: 'Growth',
      description: 'Nurturing holistic development - academic, physical, emotional, and social growth.'
    }
  ];

  const facilities = [
    { icon: '🚌', name: 'Transport' },
    { icon: '💻', name: 'SmartBoard' },
    { icon: '🎵', name: 'Music Room' },
    {icon: '🍎', name: 'Healthy Meal' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-300 text-sm font-semibold px-5 py-2 rounded-full mb-6 border border-white/20">
            📖 OUR STORY
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            About <span className="text-yellow-400">Vatsalya</span> International School
          </h1>
          <p className="text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
            A new beginning in quality education. We are committed to providing world-class 
            Pre-Primary education that empowers young minds to become confident learners.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🎯
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-blue-100 leading-relaxed text-lg">
                  {aboutContent?.mission || 
                    "To provide a nurturing and stimulating environment where every child can discover their potential, develop critical thinking skills, and grow into confident, responsible individuals ready to contribute positively to society."}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🔭
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-indigo-100 leading-relaxed text-lg">
                  {aboutContent?.vision || 
                    "To be a leading institution of learning that inspires excellence, fosters innovation, and creates global citizens who are equipped to face the challenges of tomorrow with knowledge, compassion, and integrity."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-5 py-2 rounded-full mb-4">
              💎 WHAT WE BELIEVE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              These principles guide everything we do and shape the character of our students.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-20 bg-white px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-1">
                    <img 
                      src="/principal.jpg" 
                      alt="Principal" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center text-white text-6xl">
                      👨‍🏫
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                    Principal
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 text-center md:text-left">
                <span className="inline-block bg-white/10 text-blue-300 text-sm font-semibold px-4 py-2 rounded-full mb-4 border border-white/20">
                  💬 MESSAGE FROM PRINCIPAL
                </span>
                <blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed mb-6 italic">
                  {aboutContent?.principalMessage || 
                    "\"Education is not just about academic excellence; it's about nurturing compassionate, creative, and confident individuals who can make a positive difference in the world. At Vatsalya, we are committed to providing an environment where every child can thrive and reach their full potential.\""}
                </blockquote>
                <div className="text-white">
                  <p className="font-bold text-lg">{aboutContent?.principalName || "Ms. Sheetal Soni"}</p>
                  <p className="text-blue-300">Principal, Vatsalya International School</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-50 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-5 py-2 rounded-full mb-4">
              🏛️ INFRASTRUCTURE
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">World-Class Facilities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              State-of-the-art infrastructure to support comprehensive learning and development.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {facilities.map((facility, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{facility.icon}</div>
                <p className="font-semibold text-gray-800">{facility.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Our Family?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Give your child the gift of quality education. Begin their journey with Vatsalya today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/admissions" 
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
            >
              Apply for Admission
              <span>→</span>
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all border border-white/30"
            >
              Contact Us
            </a>
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

export default AboutUs;
