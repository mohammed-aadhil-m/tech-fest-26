import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] border-t border-white/5 overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-black border border-white/10">
                  <span className="text-white font-display font-black text-lg bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">TF</span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-red-500 mb-1">VVCOE</p>
                <p className="text-xl font-display font-black text-white">
                  TECH FEST <span className="text-red-500">'26</span>
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-gray-400 max-w-md">
              The ultimate technical symposium organized by the Department of Computer Science and Engineering,
              V V College of Engineering. Join us to decode the future.
            </p>
            <div className="space-y-3 max-w-md">
              <Link to="/contact" className="flex items-start gap-3 text-sm text-gray-400 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300 group cursor-pointer">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-red-500 group-hover:text-red-400" />
                <p className="leading-relaxed group-hover:text-white transition-colors">V V Nagar, Arasoor, Thisayanvilai,<br />Sathankulam Taluk, Tuticorin District - 628 656</p>
              </Link>
              <a href="mailto:techfest.official2026@gmail.com" className="flex items-center gap-3 text-sm text-gray-400 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all duration-300 group">
                <Mail size={16} className="flex-shrink-0 text-red-500 group-hover:text-red-400" />
                <span className="font-mono text-xs group-hover:text-white transition-colors">techfest.official2026@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Events */}
          <div className="md:pl-12">
            <h3 className="font-display font-bold text-sm uppercase tracking-[0.15em] mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-[1px] bg-red-500"></span>
              Events Showcase
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              {[
                { label: 'Paper Presentation', to: '/events/paper-presentation' },
                { label: 'Dev & Deploy', to: '/events/dev-deploy' },
                { label: 'Bug Buster', to: '/events/bug-buster' },
                { label: 'Treasure Hunt 2.0', to: '/events/treasure-hunt' },
                { label: 'Connect & Sketch', to: '/events/connect-sketch' },
                { label: 'Adaptune', to: '/events/adaptune' },
              ].map(e => (
                <li key={e.to}>
                  <Link
                    to={e.to}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/30 group-hover:bg-red-500 transition-colors"></span>
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 relative z-10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-center sm:text-left text-gray-500">
            &copy; 2026 V V College of Engineering. All Rights Reserved.
          </p>
          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium text-center">
            Approved By AICTE, New Delhi <span className="mx-2 opacity-50">|</span> Affiliated To Anna University Chennai
          </p>
        </div>
      </div>
    </footer>
  );
}
