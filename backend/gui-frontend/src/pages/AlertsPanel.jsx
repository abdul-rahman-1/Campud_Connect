import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, AlertTriangle, AlertOctagon, RefreshCw } from 'lucide-react';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/data/alerts?limit=100');
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertOctagon className="text-rose-500" />;
      case 'URGENT': return <AlertTriangle className="text-orange-500" />;
      default: return <AlertCircle className="text-yellow-500" />;
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-500/10 border-rose-500/30';
      case 'URGENT': return 'bg-orange-500/10 border-orange-500/30';
      default: return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">System Alerts</h2>
        <button 
          onClick={fetchAlerts}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {alerts.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-500">
            No alerts found in the database.
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {alerts.map((alert) => (
              <div key={alert._id} className={`p-4 flex items-start gap-4 border-l-4 ${getSeverityBg(alert.severity)}`}>
                <div className="mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-slate-200 font-medium">{alert.message}</h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-slate-400">
                    <div><span className="font-medium text-slate-500 uppercase text-xs mr-1">Unit:</span> {alert.unit_id}</div>
                    <div><span className="font-medium text-slate-500 uppercase text-xs mr-1">Type:</span> {alert.alert_type}</div>
                    <div><span className="font-medium text-slate-500 uppercase text-xs mr-1">Level:</span> {alert.level_percentage?.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
