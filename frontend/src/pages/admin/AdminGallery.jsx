import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'overall', label: 'Overall Event' },
  { value: 'paper-presentation', label: 'Paper Presentation' },
  { value: 'dev-deploy', label: 'Dev & Deploy' },
  { value: 'bug-buster', label: 'Bug Buster' },
  { value: 'treasure-hunt', label: 'Treasure Hunt 2.0' },
  { value: 'connect-sketch', label: 'Connect & Sketch' },
];

export default function AdminGallery() {
  const toast = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newImage, setNewImage] = useState({ file: null, title: '', category: 'overall' });
  const [lightbox, setLightbox] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gallery');
      setImages(res.data.data);
    } catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newImage.file) { toast.error('Please select an image.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', newImage.file);
      fd.append('title', newImage.title);
      fd.append('category', newImage.category);
      await api.post('/admin/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Image uploaded!');
      setNewImage({ file: null, title: '', category: 'overall' });
      fetch();
    } catch { toast.error('Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/gallery/${deleteTarget._id}`);
      toast.success('Image deleted.');
      setDeleteTarget(null);
      fetch();
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(false); }
  };

  const filtered = activeCategory === 'all' ? images : images.filter(i => i.category === activeCategory);

  return (
    <div className="p-6 md:p-8 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-white tracking-wide">Media <span className="text-red-500">Vault</span></h1>
        <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">{images.length} visual records stored</p>
      </div>

      {/* Upload Form */}
      <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 mb-8">
        <h2 className="text-sm font-display font-black text-red-500 uppercase tracking-widest mb-6">Initialize Upload Sequence</h2>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-6 items-start">
          <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/20 rounded-xl p-8 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all text-center w-full group min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-500/20 transition-all border border-white/10 group-hover:border-red-500/30">
              <Upload size={28} className="text-gray-400 group-hover:text-red-500" />
            </div>
            <p className="text-sm font-bold text-white mb-2 tracking-wide font-mono break-all px-4">
              {newImage.file ? newImage.file.name : 'Select Visual Data'}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">JPEG, PNG, WEBP — MAX 5MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={e => setNewImage(i => ({ ...i, file: e.target.files[0] }))} />
          </label>
          <div className="flex flex-col gap-4 w-full sm:w-72">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Metadata Tag</label>
              <input
                type="text"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                placeholder="Optional identifier"
                value={newImage.title}
                onChange={e => setNewImage(i => ({ ...i, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Classification</label>
              <select
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none font-mono text-sm"
                value={newImage.category}
                onChange={e => setNewImage(i => ({ ...i, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={uploading || !newImage.file} className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex justify-center items-center gap-2 mt-2 disabled:opacity-50">
              {uploading ? <LoadingSpinner size="sm" /> : <Upload size={15} />}
              {uploading ? 'Processing...' : 'Execute Upload'}
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setActiveCategory('all')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${activeCategory === 'all' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-black/60 text-gray-400 border-white/10 hover:bg-white/10'}`}>
          All Records ({images.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = images.filter(i => i.category === cat.value).length;
          if (!count) return null;
          return (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${activeCategory === cat.value ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-black/60 text-gray-400 border-white/10 hover:bg-white/10'}`}>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <p className="text-4xl mb-3 opacity-50">🖼️</p>
          <p className="font-bold text-white uppercase tracking-widest">No visual records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(img => (
            <motion.div key={img._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-xl overflow-hidden bg-[#050505] aspect-square group cursor-pointer border border-white/5 hover:border-red-500/50 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              onClick={() => setLightbox(img)}
            >
              <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-xs font-bold truncate tracking-wide">{img.title || 'Untitled Record'}</p>
                <p className="text-red-400 text-[9px] uppercase tracking-widest mt-1 font-mono">{img.category}</p>
                <button
                  onClick={e => { e.stopPropagation(); setDeleteTarget(img); }}
                  className="absolute top-3 right-3 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-red-500 hover:bg-red-500/20 hover:border-red-500/50 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div>
                <p className="text-white font-bold tracking-widest text-lg">{lightbox.title || 'VISUAL RECORD'}</p>
                <p className="text-red-500 text-xs font-mono uppercase tracking-widest">{lightbox.category}</p>
              </div>
              <button className="p-3 text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 rounded-full transition-all" onClick={() => setLightbox(null)}>
                <X size={24} />
              </button>
            </div>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.1 }}
              src={lightbox.imageUrl} 
              alt={lightbox.title} 
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5" 
              onClick={e => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Purge Visual Record"
        message="Delete this image from the vault? This operation cannot be reversed."
        confirmLabel="Execute Purge"
        variant="danger"
      />
    </div>
  );
}
