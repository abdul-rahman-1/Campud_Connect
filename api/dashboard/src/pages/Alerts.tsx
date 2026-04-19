import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, CheckCircle2, 
  WifiOff, Database, CloudOff, ZapOff 
} from 'lucide-react';

const Alerts = () => {
  const [status, setStatus] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const handleFix = async (action: string) => {
    setLoading(action);
    try {
      if (action === 'fix-admin') {
        await axios.post('/admin/service/fix-admin', { target: 'system' });
        alert('Elevation requested. Check your taskbar for the UAC prompt (Shield icon).');
      }
    } catch (err) {
      alert('Failed to trigger fix.');
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const res = await axios.get('/admin/status');
        const data = res.data;
        setStatus(data);
        
        const newAlerts = [];
        
        if (data.db_status !== 'connected') {
          newAlerts.push({
            id: 'db',
            title: 'MongoDB Connection Error',
            desc: 'The API server cannot connect to the database cluster.',
            severity: 'critical',
            icon: Database
          });
        }
        
        if (data.tunnel_status !== 'online') {
          newAlerts.push({
            id: 'tunnel',
            title: 'Cloudflare Tunnel Offline',
            desc: 'The secure public tunnel is not active. Remote access is disabled.',
            severity: 'high',
            icon: CloudOff,
            action: 'fix-admin'
          });
        }

        if (data.tunnel_url === 'Offline' && data.tunnel_status === 'online') {
          newAlerts.push({
            id: 'login',
            title: 'Tunnel URL Missing',
            desc: 'Tunnel is running but no public URL was found in logs. Check login.',
            severity: 'medium',
            icon: WifiOff,
            action: 'fix-admin'
          });
        }

        setAlerts(newAlerts);
      } catch (err) {
        setAlerts([{
          id: 'server',
          title: 'Backend API Unreachable',
          desc: 'The dashboard cannot communicate with server.py.',
          severity: 'critical',
          icon: ZapOff
        }]);
      }
    };
    checkSystem();
    const interval = setInterval(checkSystem, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          System Alerts
        </h1>
        <p className="text-gray-400">Security and operational status of the Campus Connect infrastructure.</p>
      </header>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-green-500/20 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-green-500/10 text-green-500">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-200">System Healthy</h2>
              <p className="text-gray-500 text-sm">No critical issues detected in the telemetry pipeline.</p>
            </div>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`glass p-6 rounded-3xl border flex gap-6 items-start transition-all animate-in fade-in slide-in-from-top-4
                ${alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : 
                  alert.severity === 'high' ? 'border-orange-500/30 bg-orange-500/5' : 
                  'border-yellow-500/30 bg-yellow-500/5'}
              `}
            >
              <div className={`p-4 rounded-2xl 
                ${alert.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 
                  alert.severity === 'high' ? 'bg-orange-500/10 text-orange-500' : 
                  'bg-yellow-500/10 text-yellow-500'}
              `}>
                <alert.icon size={24} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-200">{alert.title}</h3>
                  <div className="flex items-center gap-3">
                    {alert.action && (
                      <button 
                        onClick={() => handleFix(alert.action)}
                        disabled={loading === alert.action}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold transition-all border border-white/10"
                      >
                        {loading === alert.action ? 'FIXING...' : 'FIX WITH ADMIN'}
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest
                      ${alert.severity === 'critical' ? 'bg-red-500 text-white' : 
                        alert.severity === 'high' ? 'bg-orange-500 text-white' : 
                        'bg-yellow-500 text-black'}
                    `}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{alert.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="glass p-8 rounded-3xl border border-white/5 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-primary" size={20} />
          Maintenance Guide
        </h2>
        <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
          <li>Ensure stable internet connection for Cloudflare tunnel.</li>
          <li>Check MongoDB Atlas whitelist if connection fails.</li>
          <li>Verify cloudflared is logged in via 'start.bat'.</li>
          <li>Monitor server logs for unexpected crash loops.</li>
        </ul>
      </section>
    </div>
  );
};

export default Alerts;
