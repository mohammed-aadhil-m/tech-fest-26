import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../services/api';

const coordinators = [
  {
    name: 'Coordinator Name 1',
    phone: '+91 98765 43210',
    email: 'coordinator1@vvcoe.edu.in',
  },
  {
    name: 'Coordinator Name 2',
    phone: '+91 98765 43211',
    email: 'coordinator2@vvcoe.edu.in',
  },
  {
    name: 'Coordinator Name 3',
    phone: '+91 98765 43212',
    email: 'coordinator3@vvcoe.edu.in',
  },
  {
    name: 'Coordinator Name 4',
    phone: '+91 98765 43213',
    email: 'coordinator4@vvcoe.edu.in',
  },
];


export default function Contact() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data.data || {}))
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white">
      {/* Header */}
      <div className="relative border-b border-white/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c]"></div>
        <div className="absolute inset-0 circuit-bg opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="badge badge-technical mb-6">Comm Link</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-6 text-white">
              Contact <span className="text-gradient-red">Us</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">Establish a secure connection with our command center</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-6"
          >
            {/* College Info */}
            <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center glow-red">
                  <span className="text-red-500 font-display font-black text-xl">VV</span>
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white">V V College of Engineering</h2>
                  <p className="text-xs text-red-400 uppercase tracking-widest mt-1">Dept of CSE</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-500 mt-1">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1 text-white uppercase tracking-wider">Coordinates</p>
                    <p className="text-sm leading-relaxed text-gray-400 font-light">
                      V V Nagar, Arasoor, Tisaiyanvilai,<br />
                      Sathankulam Taluk,<br />
                      Tuticorin District - 628 656
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center font-bold">
                  Approved By AICTE, New Delhi | Affiliated To Anna University Chennai
                </p>
              </div>
            </div>

            {/* Organizers */}
            <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-8">
              <h3 className="font-display font-bold mb-6 text-xl text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
                Command Chiefs
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/20">
                    <span className="font-black">C</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1 text-red-500 uppercase tracking-widest">Event Convener</p>
                    <p className="text-base text-white font-medium">Dr. I. Muthu Lakshmi</p>
                    <p className="text-xs text-gray-400 mt-1">HOD of CSE</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Dr. G. Sumilda Merlin', role: 'Staff Coordinator' },
                    { name: 'Mrs. E. Evelyn Tabitha', role: 'Staff Coordinator' },
                    { name: 'Mrs. M. Nithya', role: 'Staff Coordinator' },
                  ].map((staff, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-gray-300 text-xs">
                        <span className="font-bold">{staff.name.charAt(staff.name.indexOf('.') + 2)}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold mb-0.5 text-gray-500 uppercase tracking-wider">{staff.role}</p>
                        <p className="text-xs text-white font-medium">{staff.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social media */}
            {(settings.instagramUrl || settings.facebookUrl || settings.youtubeUrl || settings.twitterUrl) && (
              <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-8 text-center">
                <h3 className="font-display font-bold text-sm uppercase tracking-[0.2em] mb-6 text-white">
                  Establish Uplink
                </h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {[
                    { url: settings.instagramUrl, label: 'Instagram' },
                    { url: settings.facebookUrl, label: 'Facebook' },
                    { url: settings.youtubeUrl, label: 'YouTube' },
                    { url: settings.twitterUrl, label: 'Twitter / X' },
                  ].map((link, i) => link.url && (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(255,42,42,0.5)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Map */}
            <div className="card bg-black/60 border border-white/10 overflow-hidden group">
              <div className="relative">
                {/* Overlay to give map a darker tint */}
                <div className="absolute inset-0 bg-red-900/10 mix-blend-color pointer-events-none z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                <iframe
                  src="https://maps.google.com/maps?q=8.367195,77.860868&z=17&output=embed"
                  width="100%"
                  height="320"
                  style={{ border: 0, display: 'block', filter: 'invert(90%) hue-rotate(180deg) contrast(80%)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="V V College of Engineering Location"
                  className="group-hover:filter-none transition-all duration-500"
                />
              </div>
              <div className="p-6 bg-black flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <MapPin size={16} />
                  </div>
                  <p className="text-xs font-medium text-gray-400">
                    V V Nagar, Tisaiyanvilai, Tuticorin - 628 656
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/dmFtkLAhmexXvozm6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white hover:text-black"
                >
                  Launch Maps <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Student Coordinators */}
            <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-8">
              <h3 className="font-display font-bold mb-6 text-xl text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
                Field Operatives
              </h3>
              <div className="space-y-4">
                {coordinators.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 flex-shrink-0 glow-red">
                      <span className="font-black text-lg text-red-500">{c.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate mb-1">{c.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <a
                          href={`tel:${c.phone.replace(/\s/g, '')}`}
                          className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Phone size={12} />
                          {c.phone}
                        </a>
                        <a
                          href={`mailto:${c.email}`}
                          className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors truncate"
                        >
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>          
          </motion.div>
        </div>
      </div>
    </div>
  );
}