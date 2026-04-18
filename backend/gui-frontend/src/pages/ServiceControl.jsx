import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, Activity, AlertCircle } from 'lucide-react';

const ServiceControl = () => {
  const [status, setStatus] = useState({ running: false, pid: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/service/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`http://localhost:3001/api/service/${action}`);
      setMessage({ type: 'success', text: res.data.message });
      fetchStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || `Failed to ${action} service` });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-white">Service Control</h2>
      
      {message && (
        <div className={`p-4 rounded flex items-center ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
          <AlertCircle size={20} className="mr-3" />
          {message.text}
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className={`p-6 rounded-full ${status.running ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
            <Activity size={64} className={status.running ? 'animate-pulse' : ''} />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Python Monitor Service</h3>
            <p className="text-slate-400">
              Status: <span className={`font-semibold ${status.running ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status.running ? 'RUNNING' : 'STOPPED'}
              </span>
            </p>
            {status.running && status.pid && (
              <p className="text-sm text-slate-500 mt-1">Process ID: {status.pid}</p>
            )}
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={() => handleAction('start')}
              disabled={status.running || actionLoading}
              className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 disabled:text-emerald-500/50 text-white rounded-lg font-medium transition-colors"
            >
              <Play size={20} className="mr-2" /> Start Service
            </button>
            <button
              onClick={() => handleAction('stop')}
              disabled={!status.running || actionLoading}
              className="flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800/50 disabled:text-rose-500/50 text-white rounded-lg font-medium transition-colors"
            >
              <Square size={20} className="mr-2" /> Stop Service
            </button>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-700">
          <h4 className="font-semibold text-slate-300 mb-2">About the Service</h4>
          <p className="text-slate-400 text-sm">
            The Python Monitor Service (<code>monitor_service.py</code>) runs continuously in the background. 
            It queries the configured ESP32 devices for water levels, calculates pressure, checks against alert 
            thresholds, and stores historical data directly in the connected MongoDB instance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceControl;
