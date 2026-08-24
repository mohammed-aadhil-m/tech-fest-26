import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, UploadCloud } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PaperSubmission() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', college: 'V V College of Engineering',
    department: '', year: '', paperTitle: '', abstract: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Valid email is required';
    if (!form.college.trim()) err.college = 'College is required';
    if (!form.paperTitle.trim()) err.paperTitle = 'Paper title is required';
    if (!form.abstract.trim() || form.abstract.trim().length < 100) err.abstract = 'Abstract must be at least 100 characters';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fill all required fields correctly.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('paper', file);
      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
      toast.success('Data transmitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transmission failed. Please attempt again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c]"></div>
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-red-500/10 blur-[100px] rounded-full"></div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md relative z-10 card bg-black/60 border border-white/10 p-10 backdrop-blur-xl">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-red-500/10 border border-red-500/20 glow-red">
            <CheckCircle size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-wider">Transmission Complete</h1>
          <p className="text-gray-400 mb-6 font-light leading-relaxed">Your data packet has been successfully encrypted and submitted to the mainframe.</p>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-red-400 uppercase tracking-widest font-bold">You will be notified via comm link if your packet is selected for decryption and presentation.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white">
      {/* Header */}
      <div className="relative border-b border-white/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c]"></div>
        <div className="absolute inset-0 circuit-bg opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge badge-technical mb-6">Call For Papers</span>
            <h1 className="text-5xl md:text-6xl font-display font-black mb-6 text-white">
              Data <span className="text-gradient-red">Submission</span>
            </h1>
            <p className="text-gray-400 text-lg font-light flex flex-col sm:flex-row items-center justify-center gap-2">
              Transmission Window Closes: <strong className="text-red-500 px-3 py-1 bg-red-500/10 rounded-md border border-red-500/20 glow-red">04/09/2026</strong>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10" noValidate>
          {/* Personal Details */}
          <div className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3 text-white">
              <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
              Author Profile
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Designation (Full Name) *</label>
                <input type="text" className={`w-full bg-white/5 border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="Your full name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                {errors.name && <p className="text-xs text-red-500 mt-2 font-medium">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comm Link (Email) *</label>
                <input type="email" className={`w-full bg-white/5 border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="author@network.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                {errors.email && <p className="text-xs text-red-500 mt-2 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comlink ID (Mobile)</label>
                <input type="tel" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all" placeholder="10-digit sequence"
                  value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Base of Operations (College) *</label>
                <input type="text" className={`w-full bg-white/5 border ${errors.college ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  value={form.college} onChange={e => handleChange('college', e.target.value)} />
                {errors.college && <p className="text-xs text-red-500 mt-2 font-medium">{errors.college}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Division (Department)</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all" placeholder="e.g. Computer Science"
                  value={form.department} onChange={e => handleChange('department', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Paper Details */}
          <div className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 glow-red"></div>
            
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3 text-white">
              <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
              Data Packet Configuration
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Title *</label>
                <input type="text" className={`w-full bg-white/5 border ${errors.paperTitle ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                  placeholder="Enter paper title" value={form.paperTitle}
                  onChange={e => handleChange('paperTitle', e.target.value)} />
                {errors.paperTitle && <p className="text-xs text-red-500 mt-2 font-medium">{errors.paperTitle}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  Abstract * 
                  <span className={`text-[10px] ${form.abstract.length < 100 ? 'text-red-400' : 'text-gray-500'}`}>Min 100 characters</span>
                </label>
                <textarea rows={6} className={`w-full bg-white/5 border ${errors.abstract ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all resize-none font-light`}
                  placeholder="Write a brief abstract of your paper..."
                  value={form.abstract} onChange={e => handleChange('abstract', e.target.value)} />
                <div className="flex justify-between items-center mt-2">
                  {errors.abstract ? <p className="text-xs text-red-500 font-medium">{errors.abstract}</p> : <div></div>}
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{form.abstract.length} char</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                  Payload File
                  <span className="text-gray-500">PDF/DOC (Max 10MB)</span>
                </label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/20 bg-white/5 rounded-2xl p-8 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-colors">
                      <UploadCloud size={32} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-white mb-2">{file ? file.name : 'Initialize Upload Sequence'}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Click to browse or drag & drop</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={e => setFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
            <div className="relative bg-black px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-black/40">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="text-white font-bold tracking-wider uppercase">Transmitting...</span>
                </>
              ) : (
                <>
                  <FileText size={20} className="text-white" />
                  <span className="text-white font-bold tracking-wider uppercase text-lg">Transmit Data Packet</span>
                </>
              )}
            </div>
          </button>

          <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
              Alternative Backup Node:{' '}
              <a href="mailto:suyamburaj@gmail.com" className="text-red-400 hover:text-red-300 hover:underline transition-colors ml-2">
                suyamburaj@gmail.com
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
