import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, Settings, Terminal, ShieldAlert, 
  Activity, User, Power, Server, FileCode
} from 'lucide-react';
import axios from 'axios';

const Sidebar = () => {
  const navItems = [
    { to: '/home', icon: Home, label: 'Dashboard' },
    { to: '/config', icon: Server, label: 'Config Manager' },
    { to: '/logs', icon: Terminal, label: 'Log Viewer' },
    { to: '/alerts', icon: ShieldAlert, label: 'Alerts' },
    { to: '/service', icon: Activity, label: 'Service Control' },
    { to: '/setting', icon: Settings, label: 'Settings' },
  ];

  const handleShutdown = async () => {
    if (confirm('Are you sure you want to shut down all services?')) {
      try {
        await axios.post('/admin/shutdown');
        alert('Shutdown initiated. You can close this tab.');
      } catch (err) {
        alert('Shutdown failed.');
      }
    }
  };

  return (
    <div className="w-64 h-screen glass border-r border-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Campus Connect
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
          API Server v2.0
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
              ${isActive 
                ? 'bg-primary/20 text-primary border border-primary/30 neon-glow' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <Link 
          to="/contact" 
          className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-3">
            <img 
              src="/dev.jpeg" 
              alt="Developer" 
              className="w-10 h-10 rounded-full border border-primary/50 object-cover group-hover:scale-110 transition-transform"
            />
            <div>
              <p className="text-xs font-bold text-gray-200 group-hover:text-primary transition-colors">Abdul Rahman</p>
              <p className="text-[10px] text-gray-500">Systems Engineer</p>
            </div>
          </div>
        </Link>

        <button 
          onClick={handleShutdown}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-sm"
        >
          <Power size={18} />
          SYSTEM SHUTDOWN
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
