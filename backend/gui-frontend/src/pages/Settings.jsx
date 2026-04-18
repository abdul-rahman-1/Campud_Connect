import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Code, Database, Clock, BellRing, Settings2, Save, AlertCircle } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    mongoUri: '',
    fetchInterval: '',
    alertThreshold: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/settings');
        setSettings({ ...res.data, mongoUri: '' });
      } catch (err) {
        console.error("Failed to load settings:", err);
        setMessage({ type: 'error', text: 'Failed to load settings from server.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await axios.post('http://localhost:3001/api/settings', {
        mongoUri: settings.mongoUri,
        fetchInterval: parseFloat(settings.fetchInterval),
        alertThreshold: parseInt(settings.alertThreshold)
      });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage({ type: 'error', text: 'Failed to save settings to server.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Application Settings</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded transition-colors"
        >
          <Save size={16} className="mr-2"/> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded flex items-center ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
          <AlertCircle size={20} className="mr-3" />
          {message.text}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center text-lg font-medium text-slate-200">
            <Database size={20} className="mr-3 text-blue-400" /> Database Configuration
          </div>
          <p className="text-sm text-slate-400 mt-1 pl-8">MongoDB connection URI used by the Python monitoring service.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2 pl-8">
            <label className="text-sm font-medium text-slate-300">MongoDB Connection String</label>
            <input 
              type="text" 
              name="mongoUri"
              value={settings.mongoUri} 
              onChange={handleChange}
              placeholder="Paste new URL here to update, or leave blank to keep existing"
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500">Changing this will rewrite the MONGO_URI in monitor_service.py. Credentials are hidden for security.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center text-lg font-medium text-slate-200">
            <Settings2 size={20} className="mr-3 text-blue-400" /> Monitoring Parameters
          </div>
          <p className="text-sm text-slate-400 mt-1 pl-8">Global parameters for the monitor service</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2 pl-8">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Clock size={16} className="mr-2 text-slate-500" /> Fetch Interval (seconds)
              </label>
              <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">Default: 0.02s</span>
            </div>
            <input 
              type="number" 
              name="fetchInterval"
              value={settings.fetchInterval} 
              onChange={handleChange}
              step="0.01"
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 pl-8">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <BellRing size={16} className="mr-2 text-slate-500" /> Alert Threshold Low (%)
              </label>
              <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">Default: 20%</span>
            </div>
            <input 
              type="number" 
              name="alertThreshold"
              value={settings.alertThreshold} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500">Threshold below which alerts will be triggered.</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-4 border-t border-slate-700 pl-14">
          <p className="text-sm text-emerald-400 flex items-center">
            <Code size={16} className="mr-2" /> Note: Settings are now editable. Click "Save Changes" to update the Python script directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;