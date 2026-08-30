import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../services/api';

const coordinators = [
  {
    name: 'Mr.Kirubakaran J',
    phone: '+91 9344170263',
  },
  {
    name: 'Mr.Ranjith Kumar R',
    phone: '+91 6382323556',
  },
  {
    name: 'Ms.Arockia Varsha M',
  },
  {
    name: 'Ms.Tharani M',
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
      <div className="relative border-b border-white/5 py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c]"></div>
        <div className="absolute inset-0 circuit-bg opacity-30"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <span className="badge badge-technical mb-6">TECH FEST '26</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-6 text-white tracking-tight">
              Contact <span className="text-gradient-red">Us</span>
            </h1>
            <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
              Get in touch with our event coordinators and staff for any inquiries
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-6"
          >
            {/* College Info */}
            <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center glow-red flex-shrink-0">
                  <span className="text-red-500 font-display font-black text-xl">VV</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-bold text-xl text-white truncate">V V College of Engineering</h2>
                  <p className="text-xs text-red-400 uppercase tracking-widest mt-1 font-semibold">Dept of CSE</p>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold mb-1.5 text-white uppercase tracking-wider">College Address</p>
                    <p className="text-sm leading-relaxed text-gray-400 font-light">
                      V V Nagar, Arasoor, Tisaiyanvilai,<br />
                      Sathankulam Taluk,<br />
                      Tuticorin District - 628 656
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
                <p className="text-[11px] text-gray-500 uppercase tracking-widest text-center font-semibold leading-relaxed">
                  Approved By AICTE, New Delhi | Affiliated To Anna University Chennai
                </p>
              </div>
            </div>

            {/* Organizers */}
            <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-6 sm:p-8">
              <h3 className="font-display font-bold mb-6 text-xl text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 glow-red flex-shrink-0"></span>
                Faculty Coordinators
              </h3>
              <div className="space-y-4">
                {/* Event Convener */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/20">
                    <span className="font-black text-base">C</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold mb-0.5 text-red-500 uppercase tracking-widest">Event Convener</p>
                    <p className="text-base text-white font-medium truncate">Dr. I. Muthu Lakshmi</p>
                    <p className="text-xs text-gray-400 mt-0.5">HOD of CSE</p>
                  </div>
                </div>

                {/* Staff Coordinators */}
                <div className="space-y-3 pt-1">
                  {[
                    { name: 'Dr. G. Sumilda Merlin', role: 'Staff Coordinator' },
                    { name: 'Mrs. E. Evelyn Tabitha', role: 'Staff Coordinator' },
                    { name: 'Mrs. M. Nithya', role: 'Staff Coordinator' },
                  ].map((staff, i) => (
                    <div key={i} className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 text-xs">
                        <span className="font-bold">{staff.name.charAt(staff.name.indexOf('.') + 2)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{staff.role}</p>
                        <p className="text-sm text-white font-medium truncate">{staff.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social media */}
            {(settings.instagramUrl || settings.facebookUrl || settings.youtubeUrl || settings.twitterUrl) && (
              <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-6 sm:p-8 text-center">
                <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-[0.2em] mb-5 text-white">
                  Follow Us On Social Media
                </h3>
                <div className="flex justify-center items-center gap-3 flex-wrap">
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
                      className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(255,42,42,0.5)] inline-flex items-center gap-2"
                    >
                      <span>{link.label}</span>
                      <ExternalLink size={12} />
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
            <div className="card bg-black/60 border border-white/10 overflow-hidden group !p-0">
              <div className="relative">
                {/* Overlay to give map a darker tint */}
                <div className="absolute inset-0 bg-red-900/10 mix-blend-color pointer-events-none z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                <iframe
                  src="https://maps.google.com/maps?q=8.367195,77.860868&z=17&output=embed"
                  width="100%"
                  height="300"
                  style={{ border: 0, display: 'block', filter: 'invert(90%) hue-rotate(180deg) contrast(80%)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="V V College of Engineering Location"
                  className="group-hover:filter-none transition-all duration-500 w-full"
                />
              </div>
              <div className="p-5 sm:p-6 bg-black/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center text-red-500">
                    <MapPin size={16} />
                  </div>
                  <p className="text-xs font-medium text-gray-400 leading-relaxed">
                    V V Nagar, Tisaiyanvilai, Tuticorin - 628 656
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/dmFtkLAhmexXvozm6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-shrink-0 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white hover:text-black"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Student Coordinators */}
            <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-colors p-6 sm:p-8">
              <h3 className="font-display font-bold mb-6 text-xl text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 glow-red flex-shrink-0"></span>
                Student Coordinators
              </h3>
              <div className="space-y-3.5">
                {coordinators.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 flex-shrink-0 glow-red">
                      <span className="font-black text-base text-red-500">
                        {c.name ? c.name.replace('Mr.', '').replace('Ms.', '').trim().charAt(0) : 'C'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{c.name}</p>
                      {(c.phone || c.email) ? (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                          {c.phone && (
                            <a
                              href={`tel:${c.phone.replace(/\s/g, '')}`}
                              className="text-xs inline-flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Phone size={12} className="flex-shrink-0" />
                              <span>{c.phone}</span>
                            </a>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="text-xs inline-flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors truncate"
                            >
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </a>
                          )}
                        </div>
                      ) : null}
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