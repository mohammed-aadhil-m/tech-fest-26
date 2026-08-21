import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle } from 'lucide-react';
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
      toast.success('Paper submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FFFDF2' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#fff0f0' }}>
            <CheckCircle size={42} style={{ color: '#C40001' }} />
          </div>
          <h1 className="text-3xl font-display font-black text-gray-900 mb-3">Paper Submitted!</h1>
          <p className="text-gray-500 mb-2">Your paper has been submitted successfully.</p>
          <p className="text-sm text-gray-400">You will be notified via email if your paper is selected for presentation.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF2' }}>
      <div className="border-b py-12 circuit-bg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-technical mb-4">Paper Presentation</span>
            <h1 className="text-4xl font-display font-black text-gray-900 mb-2">
              Submit Your <span className="text-gradient-red">Paper</span>
            </h1>
            <p className="text-gray-500">Deadline: <strong className="text-primary-700">04/09/2026</strong></p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Personal Details */}
          <div className="card p-6">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-5">Personal Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Full Name *</label>
                <input type="text" className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="Your full name" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="your@email.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              <div>
                <label className="form-label">Mobile</label>
                <input type="tel" className="form-input" placeholder="10-digit number"
                  value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} />
              </div>
              <div>
                <label className="form-label">College *</label>
                <input type="text" className={`form-input ${errors.college ? 'border-red-400' : ''}`}
                  value={form.college} onChange={e => handleChange('college', e.target.value)} />
                {errors.college && <p className="form-error">{errors.college}</p>}
              </div>
              <div>
                <label className="form-label">Department</label>
                <input type="text" className="form-input" placeholder="e.g. Computer Science"
                  value={form.department} onChange={e => handleChange('department', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Paper Details */}
          <div className="card p-6">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-5">Paper Details</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Paper Title *</label>
                <input type="text" className={`form-input ${errors.paperTitle ? 'border-red-400' : ''}`}
                  placeholder="Enter paper title" value={form.paperTitle}
                  onChange={e => handleChange('paperTitle', e.target.value)} />
                {errors.paperTitle && <p className="form-error">{errors.paperTitle}</p>}
              </div>
              <div>
                <label className="form-label">Abstract * (min 100 characters)</label>
                <textarea rows={5} className={`form-input resize-none ${errors.abstract ? 'border-red-400' : ''}`}
                  placeholder="Write a brief abstract of your paper (minimum 100 characters)..."
                  value={form.abstract} onChange={e => handleChange('abstract', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">{form.abstract.length} characters</p>
                {errors.abstract && <p className="form-error">{errors.abstract}</p>}
              </div>
              <div>
                <label className="form-label">Paper File (PDF/DOC, max 10MB)</label>
                <div className="mt-1">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
                    <Upload size={28} className="text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Click to upload paper file'}</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
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
            className="btn-primary w-full justify-center text-base py-4 shadow-red-md disabled:opacity-50"
          >
            {loading ? <><LoadingSpinner size="sm" /> Submitting...</> : <><FileText size={18} /> Submit Paper</>}
          </button>

          <p className="text-center text-sm text-gray-400">
            You can also submit directly to{' '}
            <a href="mailto:suyamburaj@gmail.com" className="text-primary-700 hover:underline font-medium">
              suyamburaj@gmail.com
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
