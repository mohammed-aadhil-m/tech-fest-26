import { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
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
        <h1 className="text-3xl font-display font-black text-white tracking-wide">System <span className="text-red-500">Configuration</span></h1>
        <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-bold">Configure TECH FEST '26 core parameters</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
        {/* Countdown */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Temporal Parameters</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Event Initiation Vector</label>
              <input
                type="datetime-local"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                value={settings.eventDate ? new Date(settings.eventDate).toISOString().slice(0, 16) : ''}
                onChange={e => update('eventDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Defines T-Zero for main countdown matrix. Null overrides to standby.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Registration Termination</label>
              <input
                type="datetime-local"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm"
                value={settings.registrationDeadline ? new Date(settings.registrationDeadline).toISOString().slice(0, 16) : ''}
                onChange={e => update('registrationDeadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Defines access cutoff timeline. Null overrides to standby.</p>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Global Access Control</h2>
          <div className="flex items-start gap-4">
            <div
              onClick={() => update('registrationOpen', !settings.registrationOpen)}
              className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-300 border ${settings.registrationOpen ? 'bg-green-500/20 border-green-500/50 glow-green' : 'bg-white/5 border-white/20'}`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-300 ${settings.registrationOpen ? 'translate-x-7 bg-green-400' : 'bg-gray-500'}`} />
            </div>
            <div>
              <span className={`text-sm font-bold uppercase tracking-widest block mb-1 ${settings.registrationOpen ? 'text-green-400' : 'text-gray-400'}`}>
                Global Registration {settings.registrationOpen ? 'Online' : 'Offline'}
              </span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Master override switch for all event entry protocols.</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Comms Relay Info</h2>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Comms Email</label>
                <input type="email" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder="info@vvcoe.edu.in"
                  value={settings.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Comms Frequency (Phone)</label>
                <input type="text" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder="Phone number"
                  value={settings.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Geolocation Matrix (Maps Embed)</label>
              <input type="url" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" placeholder="https://maps.google.com/maps/embed?..."
                value={settings.mapEmbedUrl || ''} onChange={e => update('mapEmbedUrl', e.target.value)} />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Google Maps → Share → Embed → Src URL</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-black/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] p-6 md:p-8">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Social Network Hooks</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { key: 'instagramUrl', label: 'Instagram Vector', placeholder: 'https://instagram.com/...' },
              { key: 'facebookUrl', label: 'Facebook Vector', placeholder: 'https://facebook.com/...' },
              { key: 'youtubeUrl', label: 'YouTube Vector', placeholder: 'https://youtube.com/...' },
              { key: 'twitterUrl', label: 'X Vector', placeholder: 'https://twitter.com/...' },
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
          {saving ? <><LoadingSpinner size="sm" /> Writing Configuration...</> : <><Save size={16} /> Execute Configuration Update</>}
        </button>
      </form>
    </div>
  );
}
