import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Schedule', to: '/#schedule' },
  { label: 'Events', to: '/events' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Handle scroll for background
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scrollspy for sections on the home page
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['home', 'about', 'schedule', 'rules'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const checkIsActive = (linkTo) => {
    if (linkTo.startsWith('/#')) {
      const sectionId = linkTo.substring(2);
      // If we are on the home page, use the scrollspy activeSection
      if (location.pathname === '/') {
        return activeSection === sectionId || (sectionId === 'home' && activeSection === '');
      }
      return location.pathname === '/' && location.hash === linkTo.substring(1);
    }
    if (linkTo === '/') {
      return location.pathname === '/' && (activeSection === 'home' || activeSection === '');
    }
    return location.pathname.startsWith(linkTo);
  };

  const isSolid = location.pathname !== '/' || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isSolid ? 'shadow-md bg-[#C40001]/95 backdrop-blur-md' : 'bg-transparent'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img 
              src="/college-logo.jpg" 
              alt="VV College Logo" 
              className="w-10 h-10 rounded-full object-cover border border-white/30"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-medium uppercase tracking-wider leading-none" style={isSolid ? { color: 'rgba(255,255,255,0.8)' } : { color: 'rgba(0,0,0,0.6)' }}>
                V V College of Engineering
              </p>
              <p className={`text-sm font-display font-bold leading-tight ${isSolid ? 'text-white' : 'text-gray-900'}`}>
                TECH FEST <span style={{ color: isSolid ? '#FFFDF2' : '#C40001' }}>'26</span>
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = checkIsActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                      ? (isSolid ? 'bg-white/20 text-white font-semibold' : 'bg-[#C40001]/10 text-[#C40001] font-semibold')
                      : (isSolid ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Register CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300"
              style={{ backgroundColor: '#FFFFFF', color: '#C40001' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFFDF2'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
            >
              <span className="whitespace-nowrap flex items-center gap-1.5">
                Register Now
                <ChevronRight size={15} />
              </span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-all ${isSolid ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t pb-4 pt-2" style={{ borderColor: isSolid ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
            {navLinks.map(link => {
              const isActive = checkIsActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mx-1 mb-1 ${isActive
                      ? (isSolid ? 'bg-white/20 text-white font-semibold' : 'bg-[#C40001]/10 text-[#C40001] font-semibold')
                      : (isSolid ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-1.5 mx-1 mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#FFFFFF', color: '#C40001' }}
            >
              Register Now <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
