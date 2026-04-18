import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings2, FileText, Bell, Power, Settings, User, LogOut } from 'lucide-react';
import axios from 'axios';

const Layout = ({ children }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Config Manager', path: '/config', icon: <Settings2 size={20} /> },
    { name: 'Logs Viewer', path: '/logs', icon: <FileText size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell size={20} /> },
    { name: 'Service Control', path: '/service', icon: <Power size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Contact', path: '/contact', icon: <User size={20} /> },
  ];

  const handleShutdown = async () => {
    if (window.confirm("Are you sure you want to shutdown the backend server? The terminal window will stop serving the backend API.")) {
      try {
        await axios.post('http://localhost:3001/api/system/shutdown');
        alert("Backend server has been shut down. You can now close this browser window and the terminal.");
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (err) {
        console.error("Failed to shutdown", err);
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">Water Monitor</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-400 border-r-4 border-blue-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleShutdown} className="flex items-center w-full px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors text-sm font-medium">
            <LogOut size={16} className="mr-2" /> Shutdown System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-200">System Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-emerald-400 font-medium">System Online</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-8">
          {children}
        </main>
        <footer className="h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-center text-xs text-slate-500">
          Made by Abdul Rahman for Integral University
        </footer>
      </div>
    </div>
  );
};

export default Layout;