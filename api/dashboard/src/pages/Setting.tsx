import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Setting = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [envData, setEnvData] = useState<{key: string, value: string, newValue: string}[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const AUTH_PWD = "Abdul_Rahman-Developer";

  const handleUnlock = async () => {
    if (password !== AUTH_PWD) {
      alert('Invalid access password');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get('/admin/config', {
        headers: { 'X-Admin-Password': password }
      });
      
      // Parse .env into structured data
      const lines = res.data.env.split('\n');
      const structured = lines
        .filter((line: string) => line.includes('=') && !line.startsWith('#'))
        .map((line: string) => {
          const [key, ...valParts] = line.split('=');
          return {
            key: key.trim(),
            value: valParts.join('=').trim(),
            newValue: ''
          };
        });
      
      setEnvData(structured);
      setIsLocked(false);
    } catch (err) {
      alert('Authentication failed on server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const confirmPwd = prompt('Please re-enter password to confirm changes:');
    if (confirmPwd !== AUTH_PWD) {
      alert('Unauthorized. Save cancelled.');
      return;
    }

    setLoading(true);
    try {
      // Reconstruct .env content
      const newContent = envData.map(item => {
        const finalValue = item.newValue.trim() !== '' ? item.newValue.trim() : item.value;
        return `${item.key}=${finalValue}`;
      }).join('\n');

      await axios.post('/admin/config', { env: newContent }, {
        headers: { 'X-Admin-Password': AUTH_PWD }
      });
      
      setMessage('Config updated! Restarting server to apply changes...');
      setTimeout(async () => {
        await axios.post('/admin/service/restart', { target: 'server' });
        window.location.reload();
      }, 2000);
    } catch (err) {
      alert('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const updateNewValue = (key: string, val: string) => {
    setEnvData(prev => prev.map(item => 
      item.key === key ? { ...item, newValue: val } : item
    ));
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="p-6 rounded-full bg-primary/10 text-primary border border-primary/20 neon-glow">
          <Lock size={48} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Config Access</h1>
          <p className="text-gray-500 font-medium tracking-wide">Identity verification required for sensitive data manipulation.</p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Developer Token"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 transition-all text-center tracking-widest text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button 
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Config Values</h1>
          <p className="text-gray-400">Structured manipulation of core environment variables.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
        >
          <Save size={20} />
          COMMIT CHANGES
        </button>
      </header>

      {message && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-center animate-bounce">
          {message}
        </div>
      )}

      <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/2 border-b border-white/5">
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Variable Key</th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest w-1/3">Default Value</th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest w-1/3">New Value Override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {envData.map((item) => (
              <tr key={item.key} className="hover:bg-white/1 transition-colors">
                <td className="px-8 py-6 font-mono text-sm text-primary font-bold">{item.key}</td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 font-mono text-xs border border-white/5 truncate block max-w-[200px]">
                    {item.value}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <input 
                    type="text"
                    value={item.newValue}
                    onChange={(e) => updateNewValue(item.key, e.target.value)}
                    placeholder="Enter new value..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 transition-all font-mono text-xs text-white"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 flex items-center gap-4">
        <AlertCircle className="text-yellow-500" size={24} />
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          Note: Leave fields empty to keep default values. Saving will automatically trigger a server restart. 
          Session is authenticated for <span className="text-yellow-500/80">Abdul_Rahman-Developer</span>.
        </p>
      </div>
    </div>
  );
};

export default Setting;
