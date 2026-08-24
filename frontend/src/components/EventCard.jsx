import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const categoryStyles = {
  technical: {
    iconBg: '#1a0505',
    iconBorder: '#ff2a2a',
    badge: { bg: '#ff2a2a', color: '#ffffff', border: 'transparent' },
    label: 'Technical',
    glow: 'rgba(255,42,42,0.5)'
  },
  'non-technical': {
    iconBg: '#1a0f05',
    iconBorder: '#ff8a2a',
    badge: { bg: 'transparent', color: '#ff8a2a', border: '#ff8a2a' },
    label: 'Non-Technical',
    glow: 'rgba(255,138,42,0.3)'
  },
  'coming-soon': {
    iconBg: '#050505',
    iconBorder: '#555555',
    badge: { bg: '#111111', color: '#888888', border: '#333333' },
    label: 'Locked',
    glow: 'rgba(255,255,255,0.1)'
  },
};

const customDescriptions = {
  'bug-buster': 'Test your technical knowledge, survive the quiz, debug the code, and race to the Top 3!',
  'treasure-hunt': 'Scan, solve, search, and race through hidden QR clues to find the final treasure!',
  'adaptune': 'Listen, think, guess, and race to identify the song using music clues, creativity, and speed!',
  'dev-deploy': 'Build a creative AI-powered website, make it fully functional, deploy it online, and present your live project!',
  'paper-presentation': 'Present innovative ideas, research, and creative solutions, showcase your technical knowledge!',
  'connect-sketch': 'Connect visual clues, unleash your creativity, sketch technical concepts, and race to guess the answer!'
};

export default function EventCard({ event, index = 0 }) {
  const isComingSoon = event.category === 'coming-soon';
  const style = categoryStyles[event.category] || categoryStyles.technical;
  const description = customDescriptions[event.slug] || event.description;
  
  const ref = useRef(null);

  // Motion values for the 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for a fluid, floating feel
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Map mouse position to rotation degrees
  const rotateX = useTransform(springY, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-15deg', '15deg']);

  // Handle mouse movement over the card
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to normalized coordinates (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className="group relative h-full w-full"
    >
      <div 
        className="absolute -inset-0.5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{ backgroundColor: style.glow, zIndex: -1, transform: 'translateZ(-20px)' }}
      ></div>

      <Link
        to={`/events/${event.slug}`}
        className="card-hover h-full flex flex-col overflow-hidden bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl block relative z-10"
        style={isComingSoon ? { cursor: 'default', opacity: 0.7 } : { transformStyle: 'preserve-3d' }}
        onClick={(e) => {
          if (isComingSoon) {
            e.preventDefault();
          }
        }}
      >
        {/* Banner Image */}
        <div className="w-full h-48 sm:h-56 bg-[#0a0a0c] relative overflow-hidden flex-shrink-0 border-b border-white/10" style={{ transform: 'translateZ(10px)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-60"></div>
          
          <img
            src={`/images/events/${event.slug}.jpg`}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              document.getElementById(`fallback-card-icon-${event.slug}`).style.display = 'flex';
            }}
          />
          <div
            id={`fallback-card-icon-${event.slug}`}
            className="hidden absolute inset-0 items-center justify-center text-6xl opacity-40 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
            style={{ backgroundColor: style.iconBg }}
          >
            <span style={{ color: style.badge.color }}>{event.icon}</span>
          </div>

          <div className="absolute bottom-4 left-4 z-20" style={{ transform: 'translateZ(30px)' }}>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md"
              style={{
                backgroundColor: style.badge.bg,
                color: style.badge.color,
                border: `1px solid ${style.badge.border}`,
              }}
            >
              {style.label}
            </span>
          </div>
        </div>

        {/* Header Info */}
        <div className="p-6 flex-1 flex flex-col items-start justify-start text-left bg-gradient-to-b from-white/5 to-transparent" style={{ transform: 'translateZ(20px)' }}>
          <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
            {event.name}
          </h3>
          <p className="text-sm font-light leading-relaxed text-gray-400 mb-6 flex-grow">
            {description}
          </p>
          
          {!isComingSoon && (
            <div className="flex items-center gap-2 text-sm font-bold text-red-500 mt-auto group-hover:gap-3 transition-all duration-300">
              <span>View Details</span>
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
