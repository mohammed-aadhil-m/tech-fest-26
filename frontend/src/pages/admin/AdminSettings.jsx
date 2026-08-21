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
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure TECH FEST '26 website settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Countdown */}
        <div className="admin-card">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">Countdown Timers</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Event Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={settings.eventDate ? new Date(settings.eventDate).toISOString().slice(0, 16) : ''}
                onChange={e => update('eventDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-xs text-gray-400 mt-1">Set the event start date/time for the homepage countdown. Leave empty to show "Date to be announced".</p>
            </div>
            <div>
              <label className="form-label">Registration Deadline</label>
              <input
                type="datetime-local"
                className="form-input"
                value={settings.registrationDeadline ? new Date(settings.registrationDeadline).toISOString().slice(0, 16) : ''}
                onChange={e => update('registrationDeadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              <p className="text-xs text-gray-400 mt-1">Set the last date to register for the homepage countdown. Leave empty to show "Date to be announced".</p>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="admin-card">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">Registration</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => update('registrationOpen', !settings.registrationOpen)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.registrationOpen ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${settings.registrationOpen ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Global Registration {settings.registrationOpen ? 'Open' : 'Closed'}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-2">Toggle registration availability for all events globally.</p>
        </div>

        {/* Contact Info */}
        <div className="admin-card">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">📞 Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-input" placeholder="info@vvcoe.edu.in"
                value={settings.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input type="text" className="form-input" placeholder="Phone number"
                value={settings.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Google Maps Embed URL</label>
              <input type="url" className="form-input" placeholder="https://maps.google.com/maps/embed?..."
                value={settings.mapEmbedUrl || ''} onChange={e => update('mapEmbedUrl', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Get this from Google Maps → Share → Embed a map → Copy HTML src URL</p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="admin-card">
          <h2 className="text-lg font-display font-semibold text-gray-900 mb-4">📱 Social Media Links</h2>
          <div className="space-y-4">
            {[
              { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
              { key: 'facebookUrl', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
              { key: 'youtubeUrl', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
              { key: 'twitterUrl', label: 'Twitter / X URL', placeholder: 'https://twitter.com/...' },
            ].map(field => (
              <div key={field.key}>
                <label className="form-label">{field.label}</label>
                <input type="url" className="form-input" placeholder={field.placeholder}
                  value={settings[field.key] || ''} onChange={e => update(field.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary text-base py-3 disabled:opacity-50">
          {saving ? <><LoadingSpinner size="sm" /> Saving...</> : <><Save size={16} /> Save Settings</>}
        </button>
      </form>
    </div>
  );
}
