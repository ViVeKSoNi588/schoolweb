import { useState, useEffect } from 'react';
import Navbar from './nav';
import ImageCarousel from './scroll';

const API_URL = 'http://localhost:5000/api';

// Default content moved outside component
const defaultContent = {
  heroTitle: "Pre-Primary Education",
  heroSubtitle: "Nurturing Young Minds with Love and Care",
  introduction: "At Vatsalya International School, our Pre-Primary program provides a warm, nurturing environment where children take their first steps in learning. We believe that early childhood education lays the foundation for lifelong learning.",
  ageGroup: "2.5 to 6 years",
  classes: [
    { name: "Play Group", age: "2.5 - 3 years", description: "Introduction to school environment through play-based learning" },
    { name: "Nursery", age: "3 - 4 years", description: "Building social skills and basic concepts through activities" },
    { name: "LKG", age: "4 - 5 years", description: "Developing pre-reading, pre-writing and number concepts" },
    { name: "UKG", age: "5 - 6 years", description: "Preparation for primary school with structured learning" }
  ],
  features: [
    { icon: "🎨", title: "Creative Arts", description: "Drawing, painting, craft activities to boost creativity" },
    { icon: "🎵", title: "Music & Dance", description: "Rhymes, songs, and movement activities for holistic development" },
    { icon: "🧩", title: "Play-Based Learning", description: "Educational toys and games for cognitive development" },
    { icon: "📚", title: "Story Time", description: "Interactive storytelling sessions to develop listening skills" },
    { icon: "🌳", title: "Outdoor Play", description: "Safe playground activities for physical development" },
    { icon: "🤝", title: "Social Skills", description: "Group activities to build communication and sharing habits" }
  ],
  facilities: [
    "Air-conditioned classrooms",
    "Child-friendly furniture",
    "Safe and secure campus",
    "Hygienic washrooms",
    "Indoor play area",
    "Outdoor playground with soft flooring",
    "CCTV surveillance",
    "Trained and caring staff"
  ],
  timings: {
    days: "Monday to Friday",
    playGroup: "9:00 AM - 12:00 PM",
    nurseryLKG: "8:30 AM - 12:30 PM",
    UKG: "8:30 AM - 1:00 PM"
  }
};

function PrePrimary() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/content?collection=preprimary`);
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setContent({ ...defaultContent, ...data });
          }
        }
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const data = content;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/*ImageCarousel*/}
        <ImageCarousel interval={4000} category="preprimary" />
      
      
     

      {/* Introduction */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-600 leading-relaxed">{data.introduction}</p>
        </div>
      </section>

      {/* Classes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">OUR CLASSES</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">Age-Appropriate Programs</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.classes.map((cls, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-purple-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {cls.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                <p className="text-sm text-purple-600 font-medium mb-3">Age: {cls.age}</p>
                <p className="text-gray-600 text-sm">{cls.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-pink-100 text-pink-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">LEARNING APPROACH</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">What We Offer</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-300 text-sm font-semibold px-5 py-2 rounded-full mb-3 border border-white/20">INFRASTRUCTURE</span>
            <h2 className="text-3xl lg:text-4xl font-bold">Our Facilities</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.facilities.map((facility, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors border border-white/20"
              >
                <span className="text-2xl mb-2 block">✓</span>
                <p className="text-sm font-medium">{facility}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timings Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">SCHEDULE</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">School Timings</h2>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <span className="text-lg font-semibold text-gray-700">📅 {data.timings.days}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <h4 className="font-bold text-gray-800 mb-1">Play Group</h4>
                <p className="text-blue-600 font-medium">{data.timings.playGroup}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <h4 className="font-bold text-gray-800 mb-1">Nursery & LKG</h4>
                <p className="text-blue-600 font-medium">{data.timings.nurseryLKG}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <h4 className="font-bold text-gray-800 mb-1">UKG</h4>
                <p className="text-blue-600 font-medium">{data.timings.UKG}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Enroll Your Child?</h2>
          <p className="text-lg text-blue-200/80 mb-8">Give your child the best start in their educational journey</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/admissions" 
              className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Apply Now
            </a>
            <a 
              href="/contact" 
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PrePrimary;
