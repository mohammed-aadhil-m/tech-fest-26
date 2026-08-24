import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, CreditCard, Phone, Hash, CheckCircle, Home, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Replace this URL with your actual UPI/payment QR code image path or URL
const QR_CODE_IMAGE = null; // Set to '/qr-payment.png' once you add the image to /public

export default function Payment() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    transactionId: '',
    paymentPhone: '',
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    if (errors.screenshot) setErrors(e => ({ ...e, screenshot: '' }));
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!form.transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';
    if (!form.paymentPhone.trim() || !/^[6-9]\d{9}$/.test(form.paymentPhone.trim()))
      newErrors.paymentPhone = 'Valid 10-digit phone number is required';
    if (!screenshot) newErrors.screenshot = 'Payment screenshot is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      formData.append('transactionId', form.transactionId);
      formData.append('paymentPhone', form.paymentPhone);
      formData.append('screenshot', screenshot);

      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/register/success/${registrationId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white">
      {/* Header */}
      <div className="relative border-b border-white/5 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c]"></div>
        <div className="absolute inset-0 circuit-bg opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge badge-technical mb-6">TECH FEST '26</span>
            <h1 className="text-5xl md:text-6xl font-display font-black mb-4 text-white">
              Transaction <span className="text-gradient-red">Processing</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">Transfer funds via secure channels to confirm your initialization</p>
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
              <Hash size={16} className="text-red-500" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Auth ID</span>
              <span className="font-mono font-bold text-red-400 text-sm tracking-wider">{registrationId}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

        <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
          {/* QR Code Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 mb-6 glow-red">
              <CreditCard size={24} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Scan to Transfer</h2>
            {QR_CODE_IMAGE ? (
              <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,42,42,0.15)] border border-red-500/20">
                <img
                  src={QR_CODE_IMAGE}
                  alt="Payment QR Code"
                  className="w-48 h-48 object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3 p-4">
                <CreditCard size={36} className="text-gray-600" />
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center">
                  Terminal Offline.<br/>Awaiting Config.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-400 mt-6 leading-relaxed font-light">
              Use any UPI gateway (GPay, PhonePe, Paytm, etc.) to securely transfer the <strong className="text-white">₹250</strong> processing fee.
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl"
          >
            <h2 className="text-2xl font-display font-bold text-white mb-6">Transfer Protocols</h2>
            <ol className="space-y-4">
              {[
                'Scan the datalink (QR) using your UPI application',
                'Authorize the exact fee transfer (₹250 per operative)',
                'Complete the transaction successfully',
                'Capture visual proof (Screenshot) of confirmation',
                'Log the transaction reference ID below',
                'Upload visual proof and submit for verification',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4 text-sm text-gray-400">
                  <span className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 glow-red">
                    0{i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            
            <div className="mt-8 rounded-xl p-4 bg-red-500/5 border border-red-500/20 flex gap-3 items-start">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">Your Auth ID will remain unverified until the transfer is manually confirmed by system admins.</p>
            </div>
          </motion.div>
        </div>

        {/* Payment Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card bg-black/60 border border-white/10 p-8 backdrop-blur-xl relative z-10"
          noValidate
        >
          <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center glow-red text-red-500">
              <CheckCircle size={20} />
            </div>
            Transfer Confirmation Log
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Hash size={14} className="text-red-500" />
                Transaction Ref ID *
              </label>
              <input
                type="text"
                id="transactionId"
                className={`w-full bg-white/5 border ${errors.transactionId ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                placeholder="e.g. 123456789012"
                value={form.transactionId}
                onChange={e => handleChange('transactionId', e.target.value)}
              />
              {errors.transactionId && <p className="text-xs text-red-500 mt-2 font-medium">{errors.transactionId}</p>}
            </div>

            {/* Payment Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Phone size={14} className="text-red-500" />
                Comlink ID Used (Mobile) *
              </label>
              <input
                type="tel"
                id="paymentPhone"
                className={`w-full bg-white/5 border ${errors.paymentPhone ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all`}
                placeholder="10-digit number"
                value={form.paymentPhone}
                onChange={e => handleChange('paymentPhone', e.target.value)}
                maxLength={10}
              />
              {errors.paymentPhone && <p className="text-xs text-red-500 mt-2 font-medium">{errors.paymentPhone}</p>}
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Upload size={14} className="text-red-500" />
              Upload Visual Proof (Screenshot) *
            </label>
            {!screenshotPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  errors.screenshot 
                    ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10' 
                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <Upload size={32} className={`mx-auto mb-3 ${errors.screenshot ? 'text-red-500' : 'text-gray-500'}`} />
                <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Select Image File</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                <img
                  src={screenshotPreview}
                  alt="Payment screenshot preview"
                  className="w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all backdrop-blur-md"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Image Loaded</span>
                  </div>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {errors.screenshot && <p className="text-xs text-red-500 mt-2 font-medium">{errors.screenshot}</p>}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
            <button
              type="submit"
              id="submit-payment"
              disabled={loading}
              className="relative group overflow-hidden rounded-2xl p-[1px] flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative bg-black px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-black/40">
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="text-white font-bold tracking-wider uppercase">Processing...</span>
                  </>
                ) : (
                  <span className="text-white font-bold tracking-wider uppercase text-lg">Transmit Log</span>
                )}
              </div>
            </button>
            <Link to="/" className="relative group overflow-hidden rounded-2xl p-[1px] sm:w-1/3">
              <span className="absolute inset-0 bg-white/20 transition-opacity duration-300 group-hover:bg-white/40"></span>
              <div className="relative bg-[#111] px-6 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300">
                <Home size={18} className="text-white" />
                <span className="text-white font-bold tracking-wider uppercase text-sm">Abort</span>
              </div>
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
