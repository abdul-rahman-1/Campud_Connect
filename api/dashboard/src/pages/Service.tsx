import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, RotateCcw, Activity, Globe, Server } from 'lucide-react';

const Service = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/admin/status');
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (target: string, action: string) => {
    setLoading(`${target}-${action}`);
    try {
      await axios.post(`/admin/service/${action}`, { target });
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      alert(`Action failed: ${action} ${target}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Service Control
        </h1>
        <p className="text-gray-400">Manage runtime processes and connectivity tunnels.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Server Control */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Server size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">API Server</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Flask Application</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold">
              RUNNING
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleAction('server', 'restart')}
              disabled={loading === 'server-restart'}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group"
            >
              <RotateCcw size={20} className={`text-primary group-hover:rotate-180 transition-transform duration-500 ${loading === 'server-restart' ? 'animate-spin' : ''}`} />
              <span className="font-bold">RESTART SERVER</span>
            </button>
          </div>
          
          <p className="text-[10px] text-gray-600 leading-relaxed">
            Restarting the server will temporarily disconnect current API clients. 
            Uptime tracking will reset.
          </p>
        </div>

        {/* Tunnel Control */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Cloudflare Tunnel</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Public Endpoint</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${
              status?.tunnel_status === 'online' 
                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {status?.tunnel_status === 'online' ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleAction('tunnel', 'start')}
              disabled={status?.tunnel_status === 'online' || loading === 'tunnel-start'}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white disabled:opacity-30 disabled:hover:bg-green-500/10 disabled:hover:text-green-500 transition-all font-bold text-sm"
            >
              <Play size={18} fill="currentColor" />
              START
            </button>
            <button 
              onClick={() => handleAction('tunnel', 'stop')}
              disabled={status?.tunnel_status !== 'online' || loading === 'tunnel-stop'}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-500 transition-all font-bold text-sm"
            >
              <Square size={18} fill="currentColor" />
              STOP
            </button>
          </div>

          <p className="text-[10px] text-gray-600 leading-relaxed">
            Starting the tunnel requires valid Cloudflare credentials. 
            It creates a unique public endpoint for remote telemetry access.
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/5 flex items-center gap-6">
        <div className="p-4 rounded-2xl bg-primary/10 text-primary">
          <Activity size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Process Monitoring</h3>
          <p className="text-sm text-gray-500">
            System is using low-level task observation to ensure background processes are healthy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Service;
