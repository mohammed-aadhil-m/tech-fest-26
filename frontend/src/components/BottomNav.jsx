import { NavLink, useLocation } from 'react-router-dom';
import { Home, UserPlus, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Register', path: '/register', icon: <UserPlus size={20} /> },
    { name: 'Contact', path: '/contact', icon: <Phone size={20} /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 p-2 rounded-full shadow-lg pointer-events-auto relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-50 rounded-full"></div>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-[0_0_15px_rgba(255,42,42,0.2)] z-50">
                {item.name}
              </div>

              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-red-600 rounded-full shadow-[0_0_20px_rgba(255,42,42,0.8)] glow-red"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center justify-center">
                {item.icon}
              </span>
            </NavLink>
          );
        })}
      </motion.div>
    </div>
  );
}
