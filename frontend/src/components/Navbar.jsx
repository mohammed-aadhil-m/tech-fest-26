import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Schedule', to: '/#schedule' },
  { label: 'Events', to: '/events' },
  { label: 'Paper Submission', to: '/submit-paper' },
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

  const handleNavClick = (to) => {
    setMobileOpen(false);
    if (to.startsWith('/#')) {
      const sectionId = to.substring(2);
      if (location.pathname === '/') {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (to === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-[#050505]/90 backdrop-blur-xl border-red-500/20 shadow-[0_4px_30px_rgba(255,42,42,0.15)] py-3' : 'bg-transparent border-transparent py-5'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" onClick={() => handleNavClick('/')} className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
              <img 
                src="/college-logo.jpg" 
                alt="VV College Logo" 
                className="relative w-10 h-10 rounded-full object-cover border-2 border-white/20 z-10"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 leading-none mb-1">
                VV College of Engg
              </p>
              <p className="text-lg font-display font-black leading-tight text-white tracking-wide flex items-center gap-1">
                TECH FEST <span className="text-red-500">'26</span>
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => {
              const isActive = checkIsActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => handleNavClick(link.to)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 group ${isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.label}
                  {/* Hover/Active Underline */}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 rounded-full transition-all duration-300 ${isActive ? 'w-full shadow-[0_0_8px_rgba(255,42,42,0.8)]' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              );
            })}
          </div>

          {/* Right: Register CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(255,42,42,0.5)]"
            >
              <span>Register Now</span>
              <ChevronRight size={16} />
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all bg-black/40 border border-white/5 backdrop-blur-md"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10"></div>
            {navLinks.map(link => {
              const isActive = checkIsActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => handleNavClick(link.to)}
                  className={`block px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${isActive
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="flex justify-center items-center gap-2 mt-2 px-5 py-3.5 rounded-xl text-base font-bold transition-all bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg"
            >
              Register Now <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
