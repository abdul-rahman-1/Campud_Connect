import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Globe, Server, Database, Activity, 
  User, Mail, ExternalLink, ShieldCheck
} from 'lucide-react';

const Home = () => {
  const [status, setStatus] = useState<any>(null);

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
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          System Overview
        </h1>
        <p className="text-gray-400 max-w-2xl">
          HydroPulse // TankWatch v2.0 is a mission-critical IoT water telemetry system for Integral University.
          Monitoring distributed tank nodes in real time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          icon={Globe} 
          label="Tunnel URL" 
          value={status?.tunnel_url !== 'Offline' ? (
            <a 
              href={status?.tunnel_url} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-bold transition-all border border-primary/20 mt-1"
            >
              OPEN LINK
              <ExternalLink size={12} />
            </a>
          ) : 'Offline'} 
          sub={status?.tunnel_status === 'online' ? 'Active Connection' : 'Disconnected'}
          color="text-primary"
        />
        <StatusCard 
          icon={Server} 
          label="Server Status" 
          value={status?.server_status === 'running' ? 'Running' : 'Stopped'} 
          sub={`Port: ${status?.config?.API_PORT || 8338}`}
          color="text-green-500"
        />
        <StatusCard 
          icon={Database} 
          label="MongoDB" 
          value={status?.db_status === 'connected' ? 'Connected' : 'Error'} 
          sub={status?.config?.DB_NAME || 'water_monitoring'}
          color="text-secondary"
        />
        <StatusCard 
          icon={Activity} 
          label="Uptime" 
          value="100%" 
          sub="Continuous Monitoring"
          color="text-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Project Description
            </h2>
            <div className="text-gray-400 leading-relaxed text-sm space-y-4">
              <p>
                HydroPulse // TankWatch v2.0 is a mission-critical IoT water telemetry system for Integral University. 
                It monitors distributed tank nodes in real time using ESP32-based sensor hardware, stores telemetry in MongoDB, 
                exposes data through a Flask API, and publishes it through a Cloudflare tunnel for secure remote access.
              </p>
              <p>
                The system is designed for continuous monitoring, alerts, service control, and operational visibility.
              </p>
            </div>
          </section>

          <section className="glass p-8 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold mb-6">Live Tunnel</h2>
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Public Endpoint</p>
                <code className="text-primary font-mono text-lg">{status?.tunnel_url || 'https://connecting.trycloudflare.com...'}</code>
              </div>
              {status?.tunnel_url && status.tunnel_url !== 'Offline' && (
                <a 
                  href={status.tunnel_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <img 
                src="/dev.jpeg" 
                alt="Abdul Rahman" 
                className="w-32 h-32 rounded-3xl object-cover border-2 border-primary/20 p-1 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#121214]"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Abdul Rahman</h3>
              <p className="text-primary font-medium text-sm">Full Stack Developer & Systems Engineer</p>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "Building robust IoT ecosystems for real-world reliability."
            </p>

            <div className="flex gap-4 pt-2">
              <SocialBtn icon={User} href="https://github.com/abdul-rahman-1" />
              <SocialBtn icon={Mail} href="mailto:abdalrahmankhankhan@gmail.com" />
            </div>


            <div className="w-full pt-4 space-y-2 text-left">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">About the Dev</p>
              <p className="text-xs text-gray-400">
                Made with ❤️ by Abdul Rahman for Integral University. Specialized in mission-critical GUI and backend infrastructure.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StatusCard = ({ icon: Icon, label, value, sub, color, link }: any) => (
  <div className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 group">
    <div className="flex items-center gap-4 mb-3">
      <div className={`p-3 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold truncate ${color}`}>
          {link ? <a href={link} target="_blank" rel="noreferrer" className="hover:underline">{value}</a> : value}
        </p>
      </div>
    </div>
    <div className="h-px bg-white/5 w-full mb-3"></div>
    <p className="text-[10px] text-gray-600 font-medium">{sub}</p>
  </div>
);

const SocialBtn = ({ icon: Icon, href }: any) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
  >
    <Icon size={18} />
  </a>
);

export default Home;
