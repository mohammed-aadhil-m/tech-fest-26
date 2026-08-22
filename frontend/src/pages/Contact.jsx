import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone } from 'lucide-react';
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF2' }}>
      {/* Header */}
      <div className="border-b py-14 circuit-bg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge badge-technical mb-4">Get In Touch</span>
            <h1 className="text-4xl font-display font-black mb-3" style={{ color: '#222222' }}>
              Contact <span className="text-gradient-red">Us</span>
            </h1>
            <p style={{ color: '#555555' }}>Have questions? Reach out to us</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* College Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-gradient rounded-xl flex items-center justify-center">
                  <span className="text-white font-display font-bold text-sm">VV</span>
                </div>
                <div>
                  <h2 className="font-display font-bold" style={{ color: '#222222' }}>V V College of Engineering</h2>
                  <p className="text-xs" style={{ color: '#555555' }}>Department of Computer Science and Engineering</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#C40001' }} />
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#222222' }}>Address</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                      V V Nagar, Arasoor, Tisaiyanvilai,<br />
                      Sathankulam Taluk,<br />
                      Tuticorin District - 628 656
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #E5E5E5' }}>
                <p className="text-xs" style={{ color: '#999999' }}>
                  Approved By AICTE, New Delhi | Affiliated To Anna University Chennai
                </p>
              </div>
            </div>

            {/* Organizers */}
            <div className="card p-6">
              <h3 className="font-display font-bold mb-4 text-base" style={{ color: '#222222' }}>Event Organizers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0f0' }}>
                    <span className="font-bold" style={{ color: '#C40001' }}>C</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#222222' }}>Event Convener</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                      Dr. I. Muthu Lakshmi<br />
                      HOD of CSE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0f0' }}>
                    <span className="font-bold" style={{ color: '#C40001' }}>S</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#222222' }}>Staff Coordinator</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                      Dr. G. Sumilda Merlin<br />
                      AP of CSE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0f0' }}>
                    <span className="font-bold" style={{ color: '#C40001' }}>S</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#222222' }}>Staff Coordinator</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                      Mrs. E. Evelyn Tabitha<br />
                      AP of CSE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0f0' }}>
                    <span className="font-bold" style={{ color: '#C40001' }}>S</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#222222' }}>Staff Coordinator</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                      Mrs. M. Nithya<br />
                      AP of CSE
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #E5E5E5' }}>
                <p className="text-xs" style={{ color: '#999999' }}>
                  Approved By AICTE, New Delhi | Affiliated To Anna University Chennai
                </p>
              </div>
            </div>

            {/* Social media — unified VVCOE red style */}
            {(settings.instagramUrl || settings.facebookUrl || settings.youtubeUrl || settings.twitterUrl) && (
              <div className="card p-6">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wide mb-4" style={{ color: '#222222' }}>
                  Follow Us
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
                      style={{ backgroundColor: '#C40001', color: '#FFFFFF' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A80000'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C40001'; }}
                    >
                      Instagram
                    </a>
                  )}
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
                      style={{ backgroundColor: '#C40001', color: '#FFFFFF' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A80000'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C40001'; }}
                    >
                      Facebook
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
                      style={{ backgroundColor: '#C40001', color: '#FFFFFF' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A80000'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C40001'; }}
                    >
                      YouTube
                    </a>
                  )}
                  {settings.twitterUrl && (
                    <a
                      href={settings.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
                      style={{ backgroundColor: '#C40001', color: '#FFFFFF' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A80000'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C40001'; }}
                    >
                      Twitter / X
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Map + Coordinators */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* Map */}
            <div className="card overflow-hidden">
              {/* Google Maps embed */}
              <div className="relative">
                <iframe
                  src="https://maps.google.com/maps?q=8.367195,77.860868&z=17&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="V V College of Engineering Location"
                />
              </div>
              {/* Open in Maps button */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #E5E5E5', backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={15} style={{ color: '#C40001' }} />
                  <p className="text-xs font-medium" style={{ color: '#555555' }}>
                    V V Nagar, Tisaiyanvilai, Tuticorin - 628 656
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/dmFtkLAhmexXvozm6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 flex-shrink-0 ml-3"
                  style={{ backgroundColor: '#C40001', color: '#FFFFFF' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A80000'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C40001'; }}
                >
                  Open in Maps ↗
                </a>
              </div>
            </div>

            {/* Student Coordinators */}
            <div className="card p-6">
              <h3 className="font-display font-bold mb-4 text-base" style={{ color: '#222222' }}>Student Coordinators</h3>
              <div className="space-y-4">
                {coordinators.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 last:pb-0" style={{ borderBottom: i < coordinators.length - 1 ? '1px solid #E5E5E5' : 'none' }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#fff0f0', border: '1px solid #ffc1c1' }}
                    >
                      <span className="font-bold text-sm" style={{ color: '#C40001' }}>{c.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#222222' }}>{c.name}</p>
                      <a
                        href={`tel:${c.phone.replace(/\s/g, '')}`}
                        className="text-xs flex items-center gap-1 mt-0.5 transition-colors"
                        style={{ color: '#555555' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C40001'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#555555'; }}
                      >
                        <Phone size={11} />
                        {c.phone}
                      </a>
                      <a
                        href={`mailto:${c.email}`}
                        className="text-xs flex items-center gap-1 mt-0.5 transition-colors"
                        style={{ color: '#555555' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C40001'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#555555'; }}
                      >
                        <Mail size={11} />
                        {c.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>          </motion.div>
        </div>
      </div>
    </div>
  );
}