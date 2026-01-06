import { useState, useEffect } from 'react';
import Navbar from './nav';
import API_URL from '../config';

function Curriculum() {
  const [activeTab, setActiveTab] = useState('preprimary');
  const [curriculumData, setCurriculumData] = useState({});
  const [availableLevels, setAvailableLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default curriculum data - Only Pre-Primary (more classes will be added via admin panel)
  const defaultCurriculum = {
    preprimary: {
      level: 'preprimary',
      title: 'Pre-Primary (Nursery - KG)',
      age: 'Ages 3-6 years',
      description: 'A play-based learning approach that nurtures curiosity and builds foundational skills.',
      subjects: [
        { name: 'Language Development', icon: '📖', details: 'Phonics, storytelling, vocabulary building' },
        { name: 'Numeracy', icon: '🔢', details: 'Numbers, shapes, patterns, basic counting' },
        { name: 'Environmental Studies', icon: '🌿', details: 'Nature exploration, seasons, animals' },
        { name: 'Art & Craft', icon: '🎨', details: 'Creative expression, fine motor skills' },
        { name: 'Music & Movement', icon: '🎵', details: 'Songs, rhymes, dance, rhythm' },
        { name: 'Physical Development', icon: '🏃', details: 'Gross motor skills, outdoor play' }
      ],
      highlights: ['Activity-based learning', 'Safe & nurturing environment', 'Individual attention', 'Regular parent updates']
    }
  };

  // Level display names mapping
  const levelLabels = {
    preprimary: 'Pre-Primary',
    primary: 'Primary',
    middle: 'Middle School',
    secondary: 'Secondary',
    senior: 'Senior Secondary'
  };

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await fetch(`${API_URL}/curriculum`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const curriculumObj = {};
            const levels = [];
            data.forEach(item => {
              curriculumObj[item.level] = item;
              levels.push({ id: item.level, label: levelLabels[item.level] || item.title });
            });
            setCurriculumData(curriculumObj);
            setAvailableLevels(levels);
            // Set first level as active
            if (levels.length > 0) {
              setActiveTab(levels[0].id);
            }
          } else {
            setCurriculumData(defaultCurriculum);
            setAvailableLevels([{ id: 'preprimary', label: 'Pre-Primary' }]);
          }
        } else {
          setCurriculumData(defaultCurriculum);
          setAvailableLevels([{ id: 'preprimary', label: 'Pre-Primary' }]);
        }
      } catch (error) {
        console.error('Error fetching curriculum:', error);
        setCurriculumData(defaultCurriculum);
        setAvailableLevels([{ id: 'preprimary', label: 'Pre-Primary' }]);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculum();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCurriculum = curriculumData[activeTab] || defaultCurriculum.preprimary;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-300 text-sm font-semibold px-5 py-2 rounded-full mb-6 border border-white/20">
            📚 ACADEMICS
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Our <span className="text-yellow-400">Curriculum</span>
          </h1>
          <p className="text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
            A comprehensive CBSE-aligned curriculum designed to nurture intellectual curiosity, 
            critical thinking, and holistic development at every stage.
          </p>
        </div>
      </section>

      {/* Tab Navigation - Only show if more than one level exists */}
      {availableLevels.length > 1 && (
        <section className="sticky top-0 z-40 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide">
              {availableLevels.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curriculum Content */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{currentCurriculum?.title}</h2>
            <p className="text-blue-600 font-medium mb-4">{currentCurriculum?.age}</p>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">{currentCurriculum?.description}</p>
          </div>

          {/* Subjects Grid */}
          {currentCurriculum?.subjects && currentCurriculum.subjects.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Subjects Offered</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentCurriculum.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                        {subject.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{subject.name}</h4>
                        <p className="text-sm text-gray-500">{subject.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streams for Senior Secondary */}
          {currentCurriculum?.streams && currentCurriculum.streams.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Available Streams</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {currentCurriculum.streams.map((stream, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-3">
                        {stream.icon}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{stream.name}</h4>
                    </div>
                    <ul className="space-y-2">
                      {stream.subjects.map((subject, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {currentCurriculum?.highlights && currentCurriculum.highlights.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">Key Highlights</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentCurriculum.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <span className="text-yellow-400 text-xl">✓</span>
                    <span className="font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="py-16 bg-white px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-5 py-2 rounded-full mb-4">
              🎯 OUR APPROACH
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Teaching Methodology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We employ modern, research-backed teaching methods to ensure effective learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🖥️', title: 'Smart Classrooms', desc: 'Interactive digital boards and multimedia learning resources' },
              { icon: '🔬', title: 'Hands-on Learning', desc: 'Practical experiments and real-world applications' },
              { icon: '👥', title: 'Collaborative Learning', desc: 'Group projects and peer-to-peer learning activities' },
              { icon: '📊', title: 'Regular Assessments', desc: 'Continuous evaluation with constructive feedback' },
              { icon: '🎭', title: 'Activity-Based', desc: 'Learning through games, role-play, and creative activities' },
              { icon: '🌐', title: 'Global Exposure', desc: 'International collaborations and exchange programs' }
            ].map((method, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-blue-50 transition-colors">
                <div className="text-4xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to Learn More?</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Download our detailed curriculum guide or schedule a visit to see our teaching in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
            >
              Schedule a Visit
              <span>→</span>
            </a>
            <a 
              href="/admissions" 
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold px-8 py-4 rounded-xl text-lg transition-all border-2 border-gray-200"
            >
              Apply Now
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


export default Curriculum;
