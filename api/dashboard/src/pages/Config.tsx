import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings2, Copy, Check, ExternalLink, 
  Terminal, Monitor, Globe
} from 'lucide-react';

const Config = () => {
  const [status, setStatus] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('/admin/status');
        setStatus(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const configItems = [
    { label: 'Local API Endpoint', value: status?.api_url, icon: Monitor },
    { label: 'Cloudflare Tunnel', value: status?.tunnel_url, icon: Globe },
    { label: 'Database Name', value: status?.config?.DB_NAME, icon: Terminal },
    { label: 'API Port', value: status?.config?.API_PORT, icon: Settings2 },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Config Manager
        </h1>
        <p className="text-gray-400">
          Monitor and manage your server endpoints and core configuration.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configItems.map((item) => (
          <div key={item.label} className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <item.icon size={18} />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
              <button 
                onClick={() => handleCopy(item.value, item.label)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
              >
                {copied === item.label ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
              <code className="text-gray-200 font-mono text-sm truncate mr-4">
                {item.value || 'Loading...'}
              </code>
              {typeof item.value === 'string' && item.value.startsWith('http') && (
                <a href={item.value} target="_blank" rel="noreferrer" className="text-primary hover:scale-110 transition-transform">
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-3">
          <Settings2 className="text-primary" />
          Runtime Parameters
        </h2>
        
        <div className="grid grid-cols-2 gap-8">
          <Param label="Environment" value="Development" status="Active" />
          <Param label="API Host" value="0.0.0.0" status="Listening" />
          <Param label="Debug Mode" value="Enabled" status="Warning" color="text-yellow-500" />
          <Param label="Log Level" value={status?.config?.LOG_LEVEL || 'INFO'} status="Global" />
        </div>
      </div>
    </div>
  );
};

const Param = ({ label, value, status, color = "text-primary" }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</p>
    <div className="flex items-center gap-3">
      <span className="text-gray-200 font-medium">{value}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${color}`}>
        {status}
      </span>
    </div>
  </div>
);

export default Config;
