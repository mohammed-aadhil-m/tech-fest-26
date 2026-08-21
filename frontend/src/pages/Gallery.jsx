import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { id: 'all', label: 'All Photos' },
  { id: 'paper-presentation', label: 'Paper Presentation' },
  { id: 'dev-deploy', label: 'Dev & Deploy' },
  { id: 'bug-buster', label: 'Bug Buster' },
  { id: 'treasure-hunt', label: 'Treasure Hunt' },
  { id: 'connect-sketch', label: 'Connect & Sketch' },
  { id: 'adaptune', label: 'Adaptune' },
  { id: 'overall', label: 'Overall Event' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-technical mb-4">TECH FEST '26</span>
            <h1 className="text-4xl font-display font-black text-gray-900 mb-3">
              Event <span className="text-gradient-red">Gallery</span>
            </h1>
            <p className="text-gray-500">Moments captured from TECH FEST '26</p>
          </motion.div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-24"><LoadingSpinner size="xl" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-display font-bold text-gray-900 mb-2">
              {images.length === 0 ? 'Gallery Coming Soon!' : 'No photos in this category'}
            </p>
            <p className="text-gray-500">
              {images.length === 0
                ? 'Photos will be uploaded after the event. Stay tuned!'
                : 'Try selecting a different category.'}
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: (i % 8) * 0.05 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setLightbox(i)}
              >
                <div className="rounded-2xl overflow-hidden bg-gray-200 relative">
                  <img
                    src={img.imageUrl}
                    alt={img.title || 'Gallery image'}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {img.title && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
                      <p className="text-white text-sm font-medium px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {img.title}
                      </p>
                    </div>
                  )}
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
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={filtered[lightbox].imageUrl}
              alt={filtered[lightbox].title}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            {filtered[lightbox].title && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
                {filtered[lightbox].title}
              </div>
            )}
            {/* Nav arrows */}
            {lightbox > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                onClick={e => { e.stopPropagation(); setLightbox(l => l - 1); }}
              >
                ‹
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                onClick={e => { e.stopPropagation(); setLightbox(l => l + 1); }}
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
