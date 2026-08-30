import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Home, QrCode, Fingerprint, ShieldCheck, Users, Copy } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { PageLoader } from '../components/LoadingSpinner';

export default function RegisterSuccess() {
  const { registrationId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
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
    toast.success('Team Code copied to clipboard!');
  };

  const downloadPass = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(passRef.current, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#050505',
    });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 150] });
    pdf.addImage(imgData, 'JPEG', 0, 0, 100, 150);
    pdf.save(`TECHFEST26_NODE_${registrationId}.pdf`);
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

  const user = registrations[0].user;
  const teamEvents = registrations.filter(r => r.registrationType === 'TEAM');
  const individualEvents = registrations.filter(r => r.registrationType === 'INDIVIDUAL');

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
            Registration <span className="text-gradient-red">Successful</span>
          </h1>
          <p className="text-gray-400 font-light text-lg">Your registration details have been received successfully</p>
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Fingerprint size={16} className="text-red-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Registration ID</span>
            <span className="font-mono font-bold text-red-400 text-sm tracking-wider">{registrationId}</span>
          </div>
        </motion.div>

        {/* Event Pass / Dashboard View */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Printable pass */}
          <div
            ref={passRef}
            className="bg-[#050505] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,42,42,0.1)] border border-red-500/30 mb-8 relative"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="absolute top-0 left-10 w-[1px] h-full bg-red-500/20 z-0"></div>
            <div className="absolute top-0 right-10 w-[1px] h-full bg-white/5 z-0"></div>

            {/* Pass Header */}
            <div className="bg-red-500/10 border-b border-red-500/30 px-6 pt-8 pb-8 relative overflow-hidden z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-transparent"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black border border-red-500/50 rounded-xl flex items-center justify-center glow-red">
                    <span className="text-red-500 font-black font-display text-lg tracking-tighter">TF</span>
                  </div>
                  <div>
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Organized By</p>
                    <p className="text-white font-display font-black tracking-widest">TECH FEST '26</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-1">VVCOE • CS DEPT</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Role</p>
                  <div className="px-3 py-1 bg-white/10 rounded-md border border-white/20 inline-block">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Participant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pass Body */}
            <div className="p-8 relative z-10 bg-black/40 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Name</p>
                    <p className="text-xl font-display font-black text-white tracking-wide uppercase">{user.fullName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">College</p>
                      <p className="text-sm font-bold text-white uppercase">{user.college}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Department & Year</p>
                      <p className="text-sm font-bold text-white uppercase">{user.department} - {user.year}</p>
                    </div>
                  </div>
                </div>
                

              </div>

              {/* Individual Events Section */}
              {individualEvents.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 border-b border-white/10 pb-1">Individual Events</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {individualEvents.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-xl">{r.event.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{r.event.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{r.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Events Section */}
              {teamEvents.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 border-b border-white/10 pb-1">Team Events</p>
                  <div className="space-y-4">
                    {teamEvents.map((r, i) => (
                      <div key={i} className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={16} className="text-red-500" />
                          <p className="text-sm font-bold text-white uppercase tracking-wider">{r.event.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Team Name</p>
                            <p className="text-sm font-bold text-gray-300">{r.team.teamName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Team Code</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono font-bold text-red-400 tracking-widest">{r.team.teamCode}</p>
                              <button onClick={() => copyToClipboard(r.team.teamCode)} className="text-gray-400 hover:text-white transition-colors" title="Copy Team Code">
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 bg-black/50 p-2 rounded-lg border border-white/5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Team Members ({r.team.members.length})</p>
                          <p className="text-xs text-gray-300">
                            {r.team.members.map(m => m.fullName).join(' • ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Registration ID</p>
                  <p className="font-mono font-black text-red-500 tracking-wider">{registrationId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Submitted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              id="download-pass"
              onClick={downloadPass}
              className="relative group overflow-hidden rounded-xl p-[1px] flex-1"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative bg-black px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-black/40">
                <Download size={18} className="text-white" />
                <span className="text-white font-bold tracking-wider uppercase text-sm">Download Event Pass</span>
              </div>
            </button>
            <Link to="/" className="relative group overflow-hidden rounded-xl p-[1px] flex-1">
              <span className="absolute inset-0 bg-white/20 transition-opacity duration-300 group-hover:bg-white/40"></span>
              <div className="relative bg-[#111] px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300">
                <Home size={18} className="text-white" />
                <span className="text-white font-bold tracking-wider uppercase text-sm">Back to Home</span>
              </div>
            </Link>
          </div>

          {/* Info */}
          <div className="mt-8 rounded-xl p-5 bg-red-500/5 border border-red-500/20 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Share Your Team Code</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                If you created a team, share the <strong className="text-white">Team Code</strong> with your teammates so they can join your team when they register.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
