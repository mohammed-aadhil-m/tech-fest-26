import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Home, Calendar } from 'lucide-react';
import api from '../services/api';
import { PageLoader } from '../components/LoadingSpinner';

export default function RegisterSuccess() {
  const { registrationId } = useParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const passRef = useRef(null);

  useEffect(() => {
    if (!registrationId) return;
    api.get(`/registrations/${registrationId}`)
      .then(res => setRegistration(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [registrationId]);

  const downloadPass = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(passRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [90, 130] });
    pdf.addImage(imgData, 'PNG', 0, 0, 90, 130);
    pdf.save(`TechFest26-Pass-${registrationId}.pdf`);
  };

  if (loading) return <div className="pt-16"><PageLoader /></div>;

  if (!registration) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-xl font-display font-bold text-gray-900 mb-2">Registration not found</h1>
        <Link to="/register" className="btn-primary mt-4">Register Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF2' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#fff0f0' }}
          >
            <CheckCircle size={42} style={{ color: '#C40001' }} />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900 mb-2">
            Registration Successful!
          </h1>
          <p className="text-gray-500">Your registration has been confirmed for TECH FEST '26</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-full">
            <span className="text-xs text-primary-600 font-medium uppercase tracking-wider">Reference Number</span>
            <span className="font-mono font-bold text-primary-700 text-sm">{registrationId}</span>
          </div>
        </motion.div>

        {/* Event Pass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Printable pass */}
          <div
            ref={passRef}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Pass Header */}
            <div className="bg-red-gradient px-6 pt-6 pb-8 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TF</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-widest">V V College of Engineering</p>
                    <p className="text-white font-display font-bold">TECH FEST '26</p>
                  </div>
                </div>
                <p className="text-white/60 text-xs">Department of Computer Science and Engineering</p>
              </div>
              <div className="absolute right-6 top-6">
                <p className="text-white/60 text-xs text-right">Event Pass</p>
                <p className="text-white font-mono font-bold text-lg">{registrationId}</p>
              </div>
            </div>

            {/* Pass Body */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Participant</p>
                    <p className="text-lg font-display font-bold text-gray-900">{registration.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Events</p>
                    {(registration.events && registration.events.length > 0) ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {registration.events.map((e, i) => (
                          <span
                            key={i}
                            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#fff0f0', color: '#C40001', border: '1px solid #ffc1c1' }}
                          >
                            {e.eventName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base font-semibold text-primary-700">{registration.eventName}</p>
                    )}
                  </div>
                  {registration.events?.some(e => e.teamName) && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Team(s)</p>
                      {registration.events.filter(e => e.teamName).map((e, i) => (
                        <p key={i} className="text-sm font-semibold text-gray-700">{e.eventName}: {e.teamName}</p>
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">College</p>
                    <p className="text-sm text-gray-700">{registration.college}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Department & Year</p>
                    <p className="text-sm text-gray-700">{registration.department} — {registration.year}</p>
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-gray-200 my-5" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Registration ID</p>
                  <p className="font-mono font-bold text-primary-700">{registrationId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Status</p>
                  <span
                    className="badge"
                    style={{ backgroundColor: '#fff0f0', color: '#C40001', border: '1px solid #ffc1c1' }}
                  >Registered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="download-pass"
              onClick={downloadPass}
              className="btn-primary flex-1 justify-center py-3"
            >
              <Download size={18} />
              Download Event Pass
            </button>
            <Link to="/" className="btn-secondary flex-1 justify-center py-3">
              <Home size={18} />
              Back to Home
            </Link>
          </div>

          {/* Info */}
          <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: '#fff0f0', border: '1px solid #ffc1c1' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#C40001' }}>Keep your reference number safe</p>
            <p className="text-xs" style={{ color: '#8a0000' }}>
              A confirmation with your registration details has been recorded. Please carry this event pass on the day of the event.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
