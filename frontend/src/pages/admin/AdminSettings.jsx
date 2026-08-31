import { useState, useEffect, useCallback } from 'react';
import { Save, QrCode, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      const settingsMap = {};
      res.data.data.forEach(s => { settingsMap[s.key] = s.value; });
      setSettings(settingsMap);
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully!');
    } catch { toast.error('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 md:p-8 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-white tracking-wide">General <span className="text-red-500">Settings</span></h1>
        <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">Manage event dates, deadlines, registration status, and contact info</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
        {/* Countdown */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Event Dates & Deadlines</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event Date & Time</label>
              <input
                type="datetime-local"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                value={settings.eventDate ? new Date(settings.eventDate).toISOString().slice(0, 16) : ''}
                onChange={e => update('eventDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Sets the date and time for the event countdown on the home page.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Registration Deadline</label>
              <input
                type="datetime-local"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                value={settings.registrationDeadline ? new Date(settings.registrationDeadline).toISOString().slice(0, 16) : ''}
                onChange={e => update('registrationDeadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Sets the deadline date for participant registration.</p>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Registration Status</h2>
          <div className="flex items-start gap-4">
            <div
              onClick={() => update('registrationOpen', !settings.registrationOpen)}
              className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-300 border ${settings.registrationOpen ? 'bg-green-500/20 border-green-500/50 glow-green' : 'bg-white/5 border-white/20'}`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-300 ${settings.registrationOpen ? 'translate-x-7 bg-green-400' : 'bg-gray-500'}`} />
            </div>
            <div>
              <span className={`text-sm font-bold uppercase tracking-widest block mb-1 ${settings.registrationOpen ? 'text-green-400' : 'text-gray-400'}`}>
                Registration {settings.registrationOpen ? 'Open' : 'Closed'}
              </span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Toggle to open or close registrations across the entire website.</p>
            </div>
          </div>
        </div>

        {/* Payment & UPI QR Code Settings */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-2.5">
                <QrCode size={20} className="text-red-500" />
                Payment &amp; UPI QR Code
              </h2>
              <p className="text-xs text-gray-400 mt-1">Configure UPI ID, Payee Name, Fee, and preview the live generated QR code</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">
              Dynamic QR Active
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Input fields */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                  UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@okaxis, phonepe, or gpay"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                  value={settings.upiId || ''}
                  onChange={e => update('upiId', e.target.value)}
                />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1.5 font-bold">
                  The receiver UPI ID encoded inside the payment QR code.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                    Payee / Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. V V College of Engineering"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium"
                    value={settings.upiPayeeName || ''}
                    onChange={e => update('upiPayeeName', e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1.5 font-bold">
                    Official payee name displayed to participants.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                    Registration Fee (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="250"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                    value={settings.registrationFee || ''}
                    onChange={e => update('registrationFee', e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1.5 font-bold">
                    Fee amount auto-filled when scanning QR.
                  </p>
                </div>
              </div>
            </div>

            {/* Live QR Preview Box */}
            <div className="bg-[#050505] border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                <CreditCard size={12} className="text-red-500" /> Live QR Preview
              </span>
              <div className="p-3 bg-white rounded-xl shadow-lg border border-red-500/20">
                <QRCodeSVG
                  value={`upi://pay?pa=${encodeURIComponent(settings.upiId || 'aadhilaadhil8851-2@okicici')}&pn=${encodeURIComponent(settings.upiPayeeName || 'Mohammed Aadhil M')}&am=${encodeURIComponent(Number(settings.registrationFee || 250).toFixed(2))}`}
                  size={140}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="mt-3 text-center w-full">
                <p className="text-[11px] text-gray-300 font-mono font-bold truncate">
                  {settings.upiId || 'aadhilaadhil8851-2@okicici'}
                </p>
                <p className="text-[10px] text-red-400 font-bold mt-0.5">
                  ₹{settings.registrationFee || '250'} • {settings.upiPayeeName || 'Mohammed Aadhil M'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Contact Information</h2>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Contact Email</label>
                <input type="email" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder="info@vvcoe.edu.in"
                  value={settings.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Contact Phone</label>
                <input type="text" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder="Phone number"
                  value={settings.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Google Maps Embed URL</label>
              <input type="url" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder="https://maps.google.com/maps/embed?..."
                value={settings.mapEmbedUrl || ''} onChange={e => update('mapEmbedUrl', e.target.value)} />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Google Maps → Share → Embed → Src URL</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Social Media Links</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
              { key: 'facebookUrl', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
              { key: 'youtubeUrl', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
              { key: 'twitterUrl', label: 'Twitter / X URL', placeholder: 'https://twitter.com/...' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{field.label}</label>
                <input type="url" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder={field.placeholder}
                  value={settings[field.key] || ''} onChange={e => update(field.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs py-4 px-8 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 w-full sm:w-auto disabled:opacity-50">
          {saving ? <><LoadingSpinner size="sm" /> Saving Settings...</> : <><Save size={16} /> Save Settings</>}
        </button>
      </form>
    </div>
  );
}
