import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Home, Fingerprint, ShieldCheck, Users, Copy, FileText, Image, FileDown, Check } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { PageLoader } from '../components/LoadingSpinner';

export default function RegisterSuccess() {
  const { registrationId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const passRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!registrationId) return;
    api.get(`/registrations/${registrationId}`)
      .then(res => setRegistrations(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [registrationId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success('Team Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const getCanvas = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const element = passRef.current;
    if (!element) throw new Error('Pass element not found');

    return await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0c0c10',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const passCard = clonedDoc.getElementById('event-pass-card');
        if (passCard) {
          passCard.style.transform = 'none';
          passCard.style.animation = 'none';
          passCard.style.opacity = '1';
          passCard.style.visibility = 'visible';
          passCard.style.boxShadow = 'none';
          passCard.style.margin = '0';
          passCard.style.fontFamily = 'Arial, Helvetica, sans-serif';

          // Force all text elements inside pass to be visible with explicit colors
          const allTexts = passCard.querySelectorAll('p, h1, h2, h3, h4, span, div');
          allTexts.forEach((el) => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.fontFamily = 'Arial, Helvetica, sans-serif';
          });
        }
      }
    });
  };

  const downloadPassPDF = async () => {
    if (!passRef.current) return;
    setDownloading(true);
    toast.info('Generating your PDF Event Pass...');
    try {
      const { jsPDF } = await import('jspdf');
      const canvas = await getCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const imgWidth = 105; // mm (A6 width)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TECHFEST26_PASS_${registrationId}.pdf`);
      toast.success('PDF Event Pass downloaded successfully!');
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Could not generate PDF. Generating image pass instead...');
      downloadPassImage();
    } finally {
      setDownloading(false);
    }
  };

  const downloadPassImage = async () => {
    if (!passRef.current) return;
    setDownloading(true);
    try {
      const canvas = await getCanvas();
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TECHFEST26_PASS_${registrationId}.png`;
      link.href = imgData;
      link.click();
      toast.success('Event Pass image saved successfully!');
    } catch (err) {
      console.error('Download Image error:', err);
      toast.error('Failed to download pass image.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="pt-24 min-h-screen bg-[#050505]"><PageLoader /></div>;

  if (!registrations || registrations.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 flex flex-col items-center justify-center text-center px-4 relative">
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="relative z-10 p-8 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
          <h1 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-wider">Registration Not Found</h1>
          <p className="text-gray-400 mb-6">The requested registration profile does not exist.</p>
          <Link to="/register" className="inline-block relative group overflow-hidden rounded-xl p-[1px]">
            <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
            <div className="relative bg-black px-6 py-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-black/40">
              <span className="text-white font-bold tracking-wider uppercase text-sm">Register Now</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Safely extract user details
  const firstReg = registrations[0] || {};
  const user = (typeof firstReg.user === 'object' && firstReg.user !== null) ? firstReg.user : {};

  const fullName = user.fullName || firstReg.fullName || 'Registered Participant';
  const college = user.college || firstReg.college || 'V V College of Engineering';
  const department = user.department || firstReg.department || 'Computer Science & Engineering';
  const year = user.year || firstReg.year || '3rd Year';
  const foodPreference = user.foodPreference || firstReg.foodPreference || 'Veg';

  const teamEvents = registrations.filter(r => r.registrationType === 'TEAM' && r.team);
  const individualEvents = registrations.filter(r => r.registrationType === 'INDIVIDUAL' || !r.team);

  const hasPaperPresentation = registrations.some(
    r => r.event?.slug === 'paper-presentation' || 
         r.eventName?.toLowerCase().includes('paper') || 
         r.event?.name?.toLowerCase().includes('paper')
  );

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 bg-[#0a0a0c]"></div>
      <div className="absolute inset-0 grid-bg opacity-10"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-500/10 border border-red-500/20 glow-red"
          >
            <ShieldCheck size={48} className="text-red-500" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-widest">
            Registration <span className="text-gradient-red">Confirmed</span>
          </h1>
          <p className="text-gray-400 font-light text-lg">Your official TECH FEST '26 participant pass is ready</p>
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Fingerprint size={16} className="text-red-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Registration ID</span>
            <span className="font-mono font-bold text-red-400 text-sm tracking-wider">{registrationId}</span>
          </div>
        </motion.div>

        {/* Event Pass View */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Printable pass designed for flawless canvas capture */}
          <div
            ref={passRef}
            id="event-pass-card"
            style={{
              backgroundColor: '#0c0c10',
              fontFamily: 'Arial, Helvetica, sans-serif',
              color: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '2px solid #dc2626',
              marginBottom: '28px',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            }}
          >
            {/* Pass Header */}
            <div
              style={{
                backgroundColor: '#181216',
                borderBottom: '2px solid #dc2626',
                padding: '24px 28px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      backgroundColor: '#000000',
                      border: '2px solid #dc2626',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '18px' }}>
                      TF
                    </span>
                  </div>
                  <div>
                    <p style={{ color: '#ef4444', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                      National Level Symposium
                    </p>
                    <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 900, letterSpacing: '1px', margin: '2px 0 0 0' }}>
                      TECH FEST '26
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '3px 0 0 0' }}>
                      V V College of Engineering • CSE Dept
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    Event Pass
                  </span>
                  <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px', fontWeight: 700, margin: '6px 0 0 0' }}>
                    Food: <strong style={{ color: '#ffffff' }}>{foodPreference}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Pass Body */}
            <div style={{ padding: '24px 28px', backgroundColor: '#0c0c10' }}>
              {/* Participant Profile Details */}
              <div
                style={{
                  backgroundColor: '#161622',
                  border: '1px solid #282838',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#ef4444', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 4px 0' }}>
                    Participant Name
                  </p>
                  <h3 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    {fullName}
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '12px', borderTop: '1px solid #282838' }}>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>
                      College / Institution
                    </p>
                    <p style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
                      {college}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>
                      Department &amp; Year
                    </p>
                    <p style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
                      {department} • {year}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Events Section */}
              {individualEvents.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px 0' }}>
                    Registered Individual Events ({individualEvents.length})
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {individualEvents.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#161622',
                          border: '1px solid #282838',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{r.event?.icon || '🎯'}</span>
                        <div>
                          <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, margin: 0 }}>
                            {r.event?.name || r.eventName || 'Registered Event'}
                          </p>
                          <span style={{ color: '#22c55e', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ✓ Confirmed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Events Section */}
              {teamEvents.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px 0' }}>
                    Registered Team Events ({teamEvents.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {teamEvents.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#161218',
                          border: '1px solid rgba(220, 38, 38, 0.4)',
                          borderRadius: '14px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 900 }}>👥</span>
                            <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                              {r.event?.name || r.eventName}
                            </p>
                          </div>
                          <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 800, fontFamily: 'monospace' }}>
                            TEAM EVENT
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <div>
                            <p style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' }}>
                              Team Name
                            </p>
                            <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700, margin: 0 }}>
                              {r.team?.teamName || 'Team'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' }}>
                              Team Code
                            </p>
                            <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1.5px' }}>
                              {r.team?.teamCode}
                            </span>
                          </div>
                        </div>

                        {Array.isArray(r.team?.members) && r.team.members.length > 0 && (
                          <div style={{ marginTop: '10px', backgroundColor: '#0d0d12', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1e1e28' }}>
                            <p style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 2px 0' }}>
                              Team Members ({r.team.members.length}):
                            </p>
                            <p style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 600, margin: 0 }}>
                              {r.team.members.map(m => m.fullName || m.name || m).join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pass Footer Bar */}
              <div
                style={{
                  borderTop: '1px solid #282838',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                }}
              >
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 2px 0' }}>
                    Official Registration ID
                  </p>
                  <p style={{ color: '#ef4444', fontSize: '16px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', margin: 0 }}>
                    {registrationId}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' }}>
                    Symposium Date
                  </p>
                  <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, margin: 0 }}>
                    09 SEPT 2026
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Paper Presentation Prompt Banner */}
          {hasPaperPresentation && (
            <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-red-600/25 via-red-600/15 to-orange-600/10 border-2 border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(220,38,38,0.25)]">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-400 border border-red-500/30 glow-red">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded">Action Required</span>
                    <p className="text-sm font-bold text-white">Paper Presentation Registered!</p>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Upload your research abstract and presentation slides online before September 4, 2026.
                  </p>
                </div>
              </div>
              <Link
                to={`/submit-paper?regId=${registrationId}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all text-center flex-shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
              >
                <span>Upload Paper Online</span>
                <FileText size={15} />
              </Link>
            </div>
          )}

          {/* Pass Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              id="download-pass-pdf"
              onClick={downloadPassPDF}
              disabled={downloading}
              className="py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] disabled:opacity-50"
            >
              <FileDown size={18} />
              <span>{downloading ? 'Generating PDF...' : 'Download Event Pass (PDF)'}</span>
            </button>

            <button
              id="download-pass-image"
              onClick={downloadPassImage}
              disabled={downloading}
              className="py-4 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2.5 transition-all border border-white/10 disabled:opacity-50"
            >
              <Image size={18} className="text-red-400" />
              <span>Save Pass as Image</span>
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider py-2.5 px-5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
              <Home size={15} />
              <span>Return to Home</span>
            </Link>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl p-5 bg-red-500/5 border border-red-500/20 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Important Reminders</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Please bring your downloaded <strong className="text-white">Event Pass</strong> and valid college ID card on event day (09/09/2026). If you created a team, share the <strong className="text-red-400">Team Code</strong> with your teammates so they can join your team.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
