import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Camera } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ThreeBackground from '../components/ThreeBackground';

const CATEGORIES = [
  { id: 'all', label: 'All Files' },
  { id: 'paper-presentation', label: 'Data Exchange' },
  { id: 'dev-deploy', label: 'Systems Assembly' },
  { id: 'bug-buster', label: 'Debug Protocol' },
  { id: 'treasure-hunt', label: 'Asset Recovery' },
  { id: 'connect-sketch', label: 'Visual Node' },
  { id: 'adaptune', label: 'Audio Sync' },
  { id: 'overall', label: 'Mainframe Logs' },
];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery')
      .then(res => setImages(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lightbox !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [lightbox]);

  const filtered = activeCategory === 'all'
    ? images
    : images.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10">
      
      {/* Header */}
      <div className="relative border-b border-white/5 py-24">
        <div className="absolute inset-0 circuit-bg opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge badge-technical mb-6">Visual Archives</span>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-6">
              Event <span className="text-gradient-red">Gallery</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">Decrypting visual logs from TECH FEST '26</p>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar justify-start sm:justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(255,42,42,0.6)] border border-red-500/50'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
        
        {loading ? (
          <div className="flex justify-center py-24 relative z-10"><LoadingSpinner size="xl" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 relative z-10 card bg-black/60 border border-white/10 p-12 backdrop-blur-xl max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-500/10 border border-red-500/20 glow-red">
              <Camera size={32} className="text-red-500" />
            </div>
            <p className="text-2xl font-display font-bold text-white mb-4">
              {images.length === 0 ? 'Archives Empty' : 'No logs found in this sector'}
            </p>
            <p className="text-gray-400 font-light">
              {images.length === 0
                ? 'Visual data will be uploaded after the event sequence completes. Stand by.'
                : 'Try accessing a different data sector.'}
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-6 space-y-6 relative z-10">
            {filtered.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: (i % 8) * 0.1, duration: 0.6 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setLightbox(i)}
              >
                <div className="rounded-2xl overflow-hidden bg-[#0a0a0c] relative border border-white/10 group-hover:border-red-500/50 transition-colors duration-500">
                  <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-500 z-10 pointer-events-none"></div>
                  <img
                    src={img.imageUrl}
                    alt={img.title || 'Archive visual'}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  {img.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end z-20">
                      <p className="text-white text-sm font-bold uppercase tracking-wider px-4 pb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {img.title}
                      </p>
                    </div>
                  )}
                  
                  {/* Tech decorations */}
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 glow-red transition-opacity duration-500 z-20"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/10 hover:border-white/20 bg-black/50"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={filtered[lightbox].imageUrl}
              alt={filtered[lightbox].title}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-[0_0_50px_rgba(255,42,42,0.15)] border border-white/5"
              onClick={e => e.stopPropagation()}
            />
            {filtered[lightbox].title && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 text-white font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <span className="text-red-500 mr-2">LOG //</span> {filtered[lightbox].title}
              </div>
            )}
            {/* Nav arrows */}
            {lightbox > 0 && (
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20"
                onClick={e => { e.stopPropagation(); setLightbox(l => l - 1); }}
              >
                ‹
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20"
                onClick={e => { e.stopPropagation(); setLightbox(l => l + 1); }}
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
