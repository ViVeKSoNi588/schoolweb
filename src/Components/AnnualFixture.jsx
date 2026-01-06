import { useState, useEffect } from 'react';
import Navbar from './nav';
import API_URL from '../config';

function AnnualFixture() {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default events (used as fallback) - Pre-Primary focused
  const defaultEvents = [
    // April
    { month: 'April', date: '1-5', title: 'New Academic Session Begins', type: 'academic', icon: '🎒', description: 'Welcoming tiny tots to a new learning journey' },
    { month: 'April', date: '14', title: 'Ambedkar Jayanti', type: 'holiday', icon: '🏛️', description: 'School holiday' },
    { month: 'April', date: '20', title: 'Parent Orientation', type: 'event', icon: '👨‍👩‍👧', description: 'Introduction to our play-based curriculum' },
    
    // May
    { month: 'May', date: '1', title: 'Labour Day', type: 'holiday', icon: '⚒️', description: 'School holiday' },
    { month: 'May', date: '10-15', title: 'Fun Sports Week', type: 'sports', icon: '🏃', description: 'Fun games and activities for little ones' },
    { month: 'May', date: '20', title: 'Summer Vacation Begins', type: 'holiday', icon: '☀️', description: 'Summer break for students' },
    
    // June
    { month: 'June', date: '15', title: 'School Reopens', type: 'academic', icon: '🏫', description: 'End of summer vacation' },
    { month: 'June', date: '21', title: 'International Yoga Day', type: 'event', icon: '🧘', description: 'Fun yoga activities for kids' },
    { month: 'June', date: '25-30', title: 'Green Week', type: 'event', icon: '🌱', description: 'Nature walk, plant activities' },
    
    // July
    { month: 'July', date: '4', title: 'Guru Purnima', type: 'cultural', icon: '🙏', description: 'Thank you teachers activity' },
    { month: 'July', date: '29', title: 'Muharram', type: 'holiday', icon: '🌙', description: 'School holiday' },
    
    // August
    { month: 'August', date: '15', title: 'Independence Day', type: 'cultural', icon: '🇮🇳', description: 'Flag hoisting and patriotic songs' },
    { month: 'August', date: '19', title: 'Janmashtami', type: 'cultural', icon: '🪈', description: 'Dress up and cultural activities' },
    { month: 'August', date: '26', title: 'Raksha Bandhan', type: 'cultural', icon: '🎀', description: 'Rakhi making activity' },
    
    // September
    { month: 'September', date: '5', title: 'Teachers Day', type: 'cultural', icon: '👩‍🏫', description: 'Special performances by kids' },
    { month: 'September', date: '15-20', title: 'Grandparents Day', type: 'event', icon: '👴', description: 'Grandparents visit and activities' },
    
    // October
    { month: 'October', date: '2', title: 'Gandhi Jayanti', type: 'holiday', icon: '🕊️', description: 'School holiday' },
    { month: 'October', date: '12-17', title: 'Dussehra Break', type: 'holiday', icon: '🏹', description: 'Festival holidays' },
    { month: 'October', date: '25-31', title: 'Art & Craft Exhibition', type: 'event', icon: '🎨', description: 'Showcasing kids artwork' },
    
    // November
    { month: 'November', date: '1', title: 'Diwali Vacation Begins', type: 'holiday', icon: '🪔', description: 'Festival break' },
    { month: 'November', date: '7', title: 'School Reopens', type: 'academic', icon: '📚', description: 'Post-Diwali session begins' },
    { month: 'November', date: '14', title: "Children's Day", type: 'cultural', icon: '🎈', description: 'Special events and fun activities for kids' },
    
    // December
    { month: 'December', date: '1-5', title: 'Annual Sports Day', type: 'sports', icon: '🏅', description: 'Fun races and games with prizes' },
    { month: 'December', date: '22', title: 'Winter Vacation Begins', type: 'holiday', icon: '❄️', description: 'Winter break starts' },
    { month: 'December', date: '25', title: 'Christmas Celebration', type: 'cultural', icon: '🎄', description: 'Santa visit and gift exchange' },
    
    // January
    { month: 'January', date: '1', title: 'New Year Holiday', type: 'holiday', icon: '🎉', description: 'School holiday' },
    { month: 'January', date: '3', title: 'School Reopens', type: 'academic', icon: '🏫', description: 'Post-winter session begins' },
    { month: 'January', date: '26', title: 'Republic Day', type: 'cultural', icon: '🇮🇳', description: 'Flag hoisting and parade by tiny tots' },
    { month: 'January', date: '28-31', title: 'Annual Day Preparations', type: 'event', icon: '🎭', description: 'Practice for performances' },
    
    // February
    { month: 'February', date: '5-7', title: 'Annual Day Celebration', type: 'event', icon: '🎪', description: 'Cultural performances and prize distribution' },
    { month: 'February', date: '14', title: 'Vasant Panchami', type: 'cultural', icon: '🌸', description: 'Saraswati Puja' },
    { month: 'February', date: '20-28', title: 'Year-End Assessment', type: 'exam', icon: '📋', description: 'Activity-based evaluation' },
    
    // March
    { month: 'March', date: '17', title: 'Holi Celebration', type: 'cultural', icon: '🎨', description: 'Colors and fun activities' },
    { month: 'March', date: '25-31', title: 'Result & PTM', type: 'academic', icon: '📊', description: 'Progress report distribution' }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/annual-events`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setEvents(data);
          } else {
            setEvents(defaultEvents);
          }
        } else {
          setEvents(defaultEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents(defaultEvents);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const months = ['all', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

  const typeColors = {
    academic: 'bg-blue-500',
    holiday: 'bg-green-500',
    exam: 'bg-red-500',
    sports: 'bg-orange-500',
    cultural: 'bg-purple-500',
    event: 'bg-pink-500'
  };

  const typeBgColors = {
    academic: 'bg-blue-50 border-blue-200',
    holiday: 'bg-green-50 border-green-200',
    exam: 'bg-red-50 border-red-200',
    sports: 'bg-orange-50 border-orange-200',
    cultural: 'bg-purple-50 border-purple-200',
    event: 'bg-pink-50 border-pink-200'
  };

  const filteredEvents = selectedMonth === 'all' 
    ? events 
    : events.filter(event => event.month === selectedMonth);

  const eventCounts = {
    academic: events.filter(e => e.type === 'academic').length,
    holiday: events.filter(e => e.type === 'holiday').length,
    exam: events.filter(e => e.type === 'exam').length,
    sports: events.filter(e => e.type === 'sports').length,
    cultural: events.filter(e => e.type === 'cultural').length,
    event: events.filter(e => e.type === 'event').length
  };

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
            📅 ACADEMIC CALENDAR
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Annual <span className="text-yellow-400">Fixture</span> 2025-26
          </h1>
          <p className="text-xl text-blue-200/80 max-w-3xl mx-auto leading-relaxed">
            Stay updated with all academic activities, examinations, holidays, and special events throughout the year.
          </p>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="relative -mt-10 z-10 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { type: 'academic', label: 'Academic', icon: '📚' },
              { type: 'holiday', label: 'Holidays', icon: '🏖️' },
              { type: 'exam', label: 'Exams', icon: '📝' },
              { type: 'sports', label: 'Sports', icon: '🏅' },
              { type: 'cultural', label: 'Cultural', icon: '🎭' },
              { type: 'event', label: 'Events', icon: '🎪' }
            ].map((item) => (
              <div key={item.type} className="text-center p-3 rounded-xl bg-gray-50">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{eventCounts[item.type]}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Month Filter */}
      <section className="py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedMonth === month
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {month === 'all' ? 'All Months' : month}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="px-4 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm text-gray-600 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Timeline */}
      <section className="pb-16 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {selectedMonth === 'all' ? (
            // Group by month when showing all
            months.filter(m => m !== 'all').map((month) => {
              const monthEvents = events.filter(e => e.month === month);
              if (monthEvents.length === 0) return null;
              
              return (
                <div key={month} className="mb-10">
                  <div className="sticky top-16 z-30 bg-gray-50 py-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg">
                        {month.substring(0, 1)}
                      </span>
                      {month}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {monthEvents.map((event, index) => (
                      <EventCard key={index} event={event} typeColors={typeColors} typeBgColors={typeBgColors} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show filtered events
            <div className="space-y-3">
              {filteredEvents.map((event, index) => (
                <EventCard key={index} event={event} typeColors={typeColors} typeBgColors={typeBgColors} />
              ))}
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No events found for this month</p>
            </div>
          )}
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-white px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Download Calendar</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Get the complete annual calendar in PDF format for easy reference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg">
              📥 Download PDF
            </button>
            <button className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-bold px-8 py-4 rounded-xl text-lg transition-all border-2 border-gray-200">
              🗓️ Add to Calendar
            </button>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 bg-yellow-50 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Important Notice</h3>
                <p className="text-gray-600">
                  The above calendar is tentative and subject to change. Any modifications will be communicated 
                  through official circulars and the school app. For the most updated information, please contact 
                  the school office or check the parent portal regularly.
                </p>
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

// Event Card Component
function EventCard({ event, typeColors, typeBgColors }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${typeBgColors[event.type]} transition-all hover:shadow-md`}>
      <div className="flex-shrink-0 text-center">
        <div className="text-3xl mb-1">{event.icon}</div>
        <div className={`text-xs font-bold text-white px-2 py-1 rounded-full ${typeColors[event.type]}`}>
          {event.date}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900">{event.title}</h3>
        <p className="text-sm text-gray-600 truncate">{event.description}</p>
      </div>
      <div className={`hidden sm:block flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize ${typeColors[event.type]} text-white`}>
        {event.type}
      </div>
    </div>
  );
}

export default AnnualFixture;
