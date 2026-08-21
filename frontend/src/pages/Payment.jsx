import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, CreditCard, Phone, Hash, CheckCircle, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12 circuit-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-technical mb-4">TECH FEST '26</span>
            <h1 className="text-4xl font-display font-black text-gray-900 mb-2">
              Complete <span className="text-gradient-red">Payment</span>
            </h1>
            <p className="text-gray-500">Scan the QR code and upload your payment screenshot to confirm registration</p>
            <p className="mt-2 font-mono text-xs text-primary-700 font-medium">
              Registration ID: {registrationId}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* QR Code Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 flex flex-col items-center text-center"
          >
            <CreditCard size={24} className="text-primary-700 mb-3" />
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Scan to Pay</h2>
            {QR_CODE_IMAGE ? (
              <img
                src={QR_CODE_IMAGE}
                alt="Payment QR Code"
                className="w-48 h-48 object-contain border-4 border-primary-100 rounded-2xl p-2 bg-white shadow-md"
              />
            ) : (
              <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 flex flex-col items-center justify-center gap-2">
                <CreditCard size={36} className="text-primary-300" />
                <p className="text-xs text-primary-400 font-medium text-center px-3">
                  QR Code will appear here once configured by admin
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.) to make payment.
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Payment Steps</h2>
            <ol className="space-y-3">
              {[
                'Scan the QR code using your UPI payment app',
                'Enter the registration fee amount',
                'Complete the payment successfully',
                'Take a screenshot of the payment confirmation',
                'Fill in the transaction details below',
                'Upload the screenshot and submit',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* Payment Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card p-6 space-y-5"
          noValidate
        >
          <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle size={20} className="text-primary-700" />
            Payment Confirmation Details
          </h2>

          {/* Transaction ID */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Hash size={14} className="text-primary-700" />
              Transaction ID *
            </label>
            <input
              type="text"
              id="transactionId"
              className={`form-input ${errors.transactionId ? 'border-red-400' : ''}`}
              placeholder="Enter UPI transaction ID or reference number"
              value={form.transactionId}
              onChange={e => handleChange('transactionId', e.target.value)}
            />
            {errors.transactionId && <p className="form-error">{errors.transactionId}</p>}
          </div>

          {/* Payment Phone */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Phone size={14} className="text-primary-700" />
              Phone Number Used for Payment *
            </label>
            <input
              type="tel"
              id="paymentPhone"
              className={`form-input ${errors.paymentPhone ? 'border-red-400' : ''}`}
              placeholder="10-digit mobile number used for UPI payment"
              value={form.paymentPhone}
              onChange={e => handleChange('paymentPhone', e.target.value)}
              maxLength={10}
            />
            {errors.paymentPhone && <p className="form-error">{errors.paymentPhone}</p>}
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Upload size={14} className="text-primary-700" />
              Upload Payment Screenshot *
            </label>
            {!screenshotPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50 ${
                  errors.screenshot ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Upload size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-500 mb-1">Click to upload screenshot</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP up to 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={screenshotPreview}
                  alt="Payment screenshot preview"
                  className="w-full max-h-64 object-contain bg-gray-50"
                />
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <X size={14} />
                </button>
                <div className="border-t px-4 py-2" style={{ backgroundColor: '#fff0f0', borderColor: '#ffc1c1' }}>
                  <p className="text-xs font-medium" style={{ color: '#C40001' }}>Screenshot uploaded successfully</p>
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
            {errors.screenshot && <p className="form-error">{errors.screenshot}</p>}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              id="submit-payment"
              disabled={loading}
              className="btn-primary flex-1 justify-center py-3 text-base shadow-red-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting Payment...
                </>
              ) : (
                'Submit Payment Details'
              )}
            </button>
            <Link to="/" className="btn-secondary flex-1 justify-center py-3 text-base">
              <Home size={18} />
              Back to Home
            </Link>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Your registration will be confirmed once payment is verified by our team.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
