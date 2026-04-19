import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, RefreshCw } from 'lucide-react';

const Logs = () => {
  const [serverLogs, setServerLogs] = useState<string[]>([]);
  const [tunnelLogs, setTunnelLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const serverEndRef = useRef<HTMLDivElement>(null);
  const tunnelEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        axios.get('/admin/logs/server'),
        axios.get('/admin/logs/cloudflare')
      ]);
      setServerLogs(sRes.data.logs || []);
      setTunnelLogs(tRes.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    serverEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [serverLogs]);

  useEffect(() => {
    tunnelEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tunnelLogs]);

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Log Viewer
            <div className="flex gap-2 ml-4">
              <StatusLED label="Server" active={serverLogs.length > 0} />
              <StatusLED label="Tunnel" active={tunnelLogs.length > 0} />
            </div>
          </h1>
          <p className="text-gray-400">Real-time telemetry and service diagnostic streams.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-primary"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <LogWindow 
          title="Server.py Stream" 
          logs={serverLogs} 
          endRef={serverEndRef} 
        />
        <LogWindow 
          title="Cloudflare Tunnel Stream" 
          logs={tunnelLogs} 
          endRef={tunnelEndRef} 
          accent="text-orange-400"
        />
      </div>
    </div>
  );
};

const LogWindow = ({ title, logs, endRef, accent = "text-primary" }: any) => (
  <div className="glass rounded-3xl border border-white/5 flex flex-col min-h-0">
    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
      <div className="flex items-center gap-3">
        <Terminal size={16} className={accent} />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</span>
      </div>
      <div className="flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed scrollbar-hide space-y-1">
      {logs.length === 0 ? (
        <p className="text-gray-600 italic">No log data available...</p>
      ) : (
        logs.map((line: string, i: number) => (
          <div key={i} className="flex gap-4 group">
            <span className="text-gray-700 select-none w-8">{i + 1}</span>
            <span className={line.includes('ERROR') || line.includes('✗') ? 'text-red-400' : line.includes('WARN') ? 'text-yellow-400' : 'text-gray-400'}>
              {line}
            </span>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  </div>
);

const StatusLED = ({ label, active }: any) => (
  <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{label}</span>
  </div>
);

export default Logs;
