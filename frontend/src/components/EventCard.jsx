import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';

// All category styles use VVCOE red palette — no blue, green, or multicolor
const categoryStyles = {
  technical: {
    iconBg: '#fff0f0',
    iconBorder: '#ffc1c1',
    badge: { bg: '#fff0f0', color: '#C40001', border: '#ffc1c1' },
    label: 'Technical',
  },
  'non-technical': {
    iconBg: '#fff8f0',
    iconBorder: '#f5c9a0',
    badge: { bg: '#fff8f0', color: '#8a3000', border: '#f5c9a0' },
    label: 'Non-Technical',
  },
  'coming-soon': {
    iconBg: '#FFFDF2',
    iconBorder: '#e5d5a0',
    badge: { bg: '#FFFDF2', color: '#7a5500', border: '#e5d5a0' },
    label: 'Coming Soon',
  },
};

export default function EventCard({ event, index = 0 }) {
  const isComingSoon = event.category === 'coming-soon';
  const style = categoryStyles[event.category] || categoryStyles.technical;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group"
    >
      <Link
        to={`/events/${event.slug}`}
        className="card-hover h-full flex flex-col overflow-hidden bg-white block"
        style={isComingSoon ? { border: '2px dashed #e5d5a0', cursor: isComingSoon ? 'default' : 'pointer' } : {}}
        onClick={(e) => {
          if (isComingSoon) {
            e.preventDefault();
          }
        }}
      >
        {/* Banner Image */}
        <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-100 relative overflow-hidden flex-shrink-0">
          <img 
            src={`/images/events/${event.slug}.jpg`} 
            alt={event.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              document.getElementById(`fallback-card-icon-${event.slug}`).style.display = 'flex';
            }}
          />
          <div 
            id={`fallback-card-icon-${event.slug}`} 
            className="hidden absolute inset-0 items-center justify-center text-5xl opacity-80 transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundColor: style.iconBg }}
          >
            <span style={{ color: style.badge.color }}>{event.icon}</span>
          </div>
        </div>

        {/* Header Info */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center border-t border-gray-100">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2"
            style={{
              backgroundColor: style.badge.bg,
              color: style.badge.color,
              border: `1px solid ${style.badge.border}`,
            }}
          >
            {style.label}
          </span>
          <h3
            className="text-lg sm:text-xl font-display font-black leading-tight"
            style={{ color: '#222222' }}
          >
            {event.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
