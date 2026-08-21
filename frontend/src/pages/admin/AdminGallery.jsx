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
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Gallery</h1>
        <p className="text-sm text-gray-500">{images.length} images uploaded</p>
      </div>

      {/* Upload Form */}
      <div className="admin-card mb-6">
        <h2 className="text-base font-display font-semibold text-gray-900 mb-4">Upload New Image</h2>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-start">
          <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
            <Upload size={24} className="text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              {newImage.file ? newImage.file.name : 'Click to select image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 5MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={e => setNewImage(i => ({ ...i, file: e.target.files[0] }))} />
          </label>
          <div className="flex flex-col gap-3 sm:w-64">
            <input
              type="text"
              className="form-input text-sm"
              placeholder="Image title (optional)"
              value={newImage.title}
              onChange={e => setNewImage(i => ({ ...i, title: e.target.value }))}
            />
            <select
              className="form-input text-sm"
              value={newImage.category}
              onChange={e => setNewImage(i => ({ ...i, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button type="submit" disabled={uploading || !newImage.file} className="btn-primary text-sm py-2.5 justify-center disabled:opacity-50">
              {uploading ? <LoadingSpinner size="sm" /> : <Upload size={15} />}
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setActiveCategory('all')} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All ({images.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = images.filter(i => i.category === cat.value).length;
          if (!count) return null;
          return (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.value ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="font-medium text-gray-900">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(img => (
            <motion.div key={img._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square group cursor-pointer"
              onClick={() => setLightbox(img)}
            >
              <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                <button
                  onClick={e => { e.stopPropagation(); setDeleteTarget(img); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={13} />
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
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button className="absolute top-4 right-4 p-2 text-white bg-white/10 rounded-full" onClick={() => setLightbox(null)}>
              <X size={20} />
            </button>
            <img src={lightbox.imageUrl} alt={lightbox.title} className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Image"
        message="Delete this image from the gallery? This cannot be undone."
      />
    </div>
  );
}
