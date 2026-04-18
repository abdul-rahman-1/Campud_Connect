import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';

const ConfigManager = () => {
  const [config, setConfig] = useState({ devices: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/config');
      setConfig(res.data);
      setMessage(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load configuration.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleDeviceChange = (index, field, value) => {
    const newConfig = { ...config };
    newConfig.devices[index][field] = value;
    setConfig(newConfig);
  };

  const addDevice = () => {
    const newConfig = { ...config };
    newConfig.devices.push({
      unit_id: `TANK_${newConfig.devices.length + 1}`,
      name: 'New Tank',
      ip_address: '192.168.1.x'
    });
    setConfig(newConfig);
  };

  const removeDevice = (index) => {
    const newConfig = { ...config };
    newConfig.devices.splice(index, 1);
    setConfig(newConfig);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:3001/api/config', config);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading configuration...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Device Configuration</h2>
        <div className="flex space-x-3">
          <button 
            onClick={fetchConfig}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            <RefreshCw size={16} className="mr-2" /> Reload
          </button>
          <button 
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded transition-colors"
          >
            <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Config'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6">
          <p className="text-slate-400 mb-6">Manage ESP32 monitoring devices stored in esp32_config.json.</p>
          
          <div className="space-y-4">
            {config.devices.map((device, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Unit ID</label>
                  <input 
                    type="text" 
                    value={device.unit_id} 
                    onChange={(e) => handleDeviceChange(index, 'unit_id', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Name</label>
                  <input 
                    type="text" 
                    value={device.name} 
                    onChange={(e) => handleDeviceChange(index, 'name', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">IP Address</label>
                  <input 
                    type="text" 
                    value={device.ip_address} 
                    onChange={(e) => handleDeviceChange(index, 'ip_address', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <button 
                    onClick={() => removeDevice(index)}
                    className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
                    title="Remove device"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addDevice}
            className="mt-6 flex items-center px-4 py-2 border border-dashed border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded w-full justify-center transition-colors"
          >
            <Plus size={16} className="mr-2" /> Add Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigManager;
