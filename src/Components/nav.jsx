import { useState } from 'react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [mobileAcademicOpen, setMobileAcademicOpen] = useState(false);

  return (
    <nav className="bg-blue-900 shadow-lg w-full relative z-50">
      <div className="w-full px-4">
        <div className="flex justify-between h-16">
          { }
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3">
              <img
                src="/vatlogo.svg"
                alt="School Logo"
                className="h-10 w-10"
              />
              <span className="text-white font-bold text-xl hidden sm:block">
                Vatsalya International School Anand
              </span>
              <span className="text-white font-bold text-xl sm:hidden">
                Vatsalya International School Anand
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <a
              href="/"
              className="text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About Us
            </a>
            {/* Academics Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAcademicOpen(true)}
              onMouseLeave={() => setAcademicOpen(false)}
            >
              <button
                className="text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                Academics
                <svg className={`w-4 h-4 transition-transform ${academicOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {academicOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-48 bg-blue-900 rounded-lg shadow-xl py-2 border border-blue-800">
                    <a href="/preprimary" className="block px-4 py-2 text-white hover:bg-blue-800 text-sm transition-colors text-left">
                      Pre-Primary
                    </a>
                    <a href="/academics/curriculum" className="block px-4 py-2 text-white hover:bg-blue-800 text-sm transition-colors text-left">
                      Curriculum
                    </a>
                    <a href="/academics/annual-fixture" className="block px-4 py-2 text-white hover:bg-blue-800 text-sm transition-colors text-left">
                      Annual Fixture
                    </a>
                  </div>
                </div>
              )}
            </div>
            <a
              href="/admissions"
              className="text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Admissions
            </a>
            <a
              href="/gallery"
              className="text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Gallery
            </a>
            <a
              href="/contact"
              className="text-white hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contact
            </a>
            {/* Student Portal link removed as per user request */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-blue-800 p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-blue-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/"
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              About Us
            </a>
            {/* Mobile Academics Dropdown */}
            <div>
              <button
                onClick={() => setMobileAcademicOpen(!mobileAcademicOpen)}
                className="text-white hover:bg-blue-700 w-full px-3 py-2 rounded-md text-base font-medium flex items-center justify-center gap-1"
              >
                Academics
                <svg className={`w-4 h-4 transition-transform ${mobileAcademicOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileAcademicOpen && (
                <div className="bg-blue-900 rounded-md ml-4 mt-1 space-y-1">
                  <a href="/preprimary" className="text-blue-200 hover:text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-sm">
                    Pre-Primary
                  </a>
                  <a href="/academics/curriculum" className="text-blue-200 hover:text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-sm">
                    Curriculum
                  </a>
                  <a href="/academics/annual-fixture" className="text-blue-200 hover:text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-sm">
                    Annual Fixture
                  </a>
                </div>
              )}
            </div>
            <a
              href="/admissions"
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Admissions
            </a>
            <a
              href="/gallery"
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Gallery
            </a>
            <a
              href="/contact"
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Contact
            </a>
            {/* Student Portal link removed from mobile menu */}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
