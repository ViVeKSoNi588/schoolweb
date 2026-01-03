import { useState } from 'react';
import Navbar from './nav';
import API_URL from '../config';

const admissionData = {
  process: [
    { step: 1, title: "Inquiry", description: "Fill out the inquiry form or visit our campus to learn more about our programs." },
    { step: 2, title: "Application", description: "Submit the application form along with required documents and registration fee." },
    { step: 3, title: "Interaction", description: "Schedule an interaction session with the child and parents." },
    { step: 4, title: "Admission", description: "Upon selection, complete the admission formalities and fee payment." }
  ],
  documents: [
    "Birth Certificate (Original + 2 copies)",
    "Aadhar Card of Child",
    "Aadhar Card of Parents",
    "Previous School Transfer Certificate (if applicable)",
    "Previous Year Report Card (if applicable)",
    "4 Passport Size Photographs of Child",
    "2 Passport Size Photographs of Parents",
    "Address Proof (Electricity Bill / Rent Agreement)",
    "Caste Certificate (if applicable)"
  ],
  grades: [
    { name: "Play Group", age: "2.5 - 3 years", seats: "30" },
    { name: "Nursery", age: "3 - 4 years", seats: "40" },
    { name: "LKG", age: "4 - 5 years", seats: "40" },
    { name: "UKG", age: "5 - 6 years", seats: "40" },
    { name: "Grade 1 - 5", age: "6 - 11 years", seats: "45 per class" },
    { name: "Grade 6 - 8", age: "11 - 14 years", seats: "45 per class" }
  ],
  faqs: [
    { q: "What is the admission process timeline?", a: "Admissions typically open in January for the next academic year. The process takes 2-3 weeks from application to confirmation." },
    { q: "Is there an entrance test?", a: "For Pre-Primary, we conduct a simple interaction session. For Grade 1 onwards, there is a basic assessment in English and Mathematics." },
    { q: "What is the fee structure?", a: "Fee structure varies by grade. Please contact our admission office or visit the campus for detailed fee information." },
    { q: "Do you offer transportation?", a: "Yes, we provide safe and reliable bus service covering major areas of the city." },
    { q: "What curriculum do you follow?", a: "We follow the CBSE curriculum with a focus on holistic development through co-curricular activities." }
  ]
};

function Admission() {
  const [formData, setFormData] = useState({
    childName: '',
    dob: '',
    grade: '',
    parentName: '',
    email: '',
    phone: '',
    address: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.parentName,
          email: formData.email,
          phone: formData.phone,
          subject: `Admission Inquiry - ${formData.grade} - ${formData.childName}`,
          message: `Child Name: ${formData.childName}\nDate of Birth: ${formData.dob}\nGrade Applied: ${formData.grade}\nAddress: ${formData.address}\n\nAdditional Message: ${formData.message}`
        })
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Application submitted successfully! We will contact you soon.' });
        setFormData({ childName: '', dob: '', grade: '', parentName: '', email: '', phone: '', address: '', message: '' });
      } else {
        setStatus({ type: 'error', message: 'Failed to submit. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-300 text-sm font-semibold px-5 py-2 rounded-full mb-4 border border-white/20">ADMISSIONS 2026-27</span>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Join Our School Family</h1>
          <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
            Begin your child's journey towards excellence. Admissions are now open for the upcoming academic year.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#apply" className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Apply Now
            </a>
            <a href="tel:+919876543210" className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">
              Call for Inquiry
            </a>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">HOW TO APPLY</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">Admission Process</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {admissionData.process.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-blue-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Grades */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">CLASSES</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">Available Grades</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {admissionData.grades.map((grade, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">{grade.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age Group:</span>
                    <span className="font-medium text-gray-800">{grade.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available Seats:</span>
                    <span className="font-medium text-green-600">{grade.seats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Required */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-blue-300 text-sm font-semibold px-5 py-2 rounded-full mb-3 border border-white/20">CHECKLIST</span>
            <h2 className="text-3xl lg:text-4xl font-bold">Documents Required</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {admissionData.documents.map((doc, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">APPLY ONLINE</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">Admission Inquiry Form</h2>
            <p className="text-gray-600 mt-2">Fill out the form below and we will get back to you shortly</p>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl mb-6 ${
              status.type === 'success' 
                ? 'bg-green-100 border border-green-200 text-green-700' 
                : 'bg-red-100 border border-red-200 text-red-700'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 shadow-lg space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Full Name *</label>
                <input
                  type="text"
                  name="childName"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400"
                  placeholder="Enter child's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Applying For *</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">Select Grade...</option>
                <option value="Play Group">Play Group (2.5 - 3 years)</option>
                <option value="Nursery">Nursery (3 - 4 years)</option>
                <option value="LKG">LKG (4 - 5 years)</option>
                <option value="UKG">UKG (5 - 6 years)</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                  placeholder="Enter parent's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all resize-none placeholder-gray-400"
                placeholder="Enter your complete address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message (Optional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 transition-all resize-none placeholder-gray-400"
                placeholder="Any specific questions or requirements?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-1 rounded-full mb-3">QUESTIONS</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {admissionData.faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg text-blue-200/80 mb-8">Our admission team is here to help you with any queries</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Contact Us
            </a>
            <a 
              href="tel:+919876543210" 
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20"
            >
              +91 98765 43210
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Admission;
