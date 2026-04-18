import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle2, Server, ServerOff } from 'lucide-react';

const Dashboard = () => {
  const [tanks, setTanks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({ running: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tanksRes, alertsRes, statusRes] = await Promise.all([
          axios.get('http://localhost:3001/api/data/tanks'),
          axios.get('http://localhost:3001/api/data/alerts?limit=5'),
          axios.get('http://localhost:3001/api/service/status')
        ]);
        setTanks(tanksRes.data);
        setAlerts(alertsRes.data);
        setServiceStatus(statusRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const activeTanks = tanks.filter(t => t.status === 'active');
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Service Status</p>
              <h3 className={`text-2xl font-bold mt-1 ${serviceStatus.running ? 'text-emerald-400' : 'text-rose-400'}`}>
                {serviceStatus.running ? 'Running' : 'Stopped'}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${serviceStatus.running ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
              {serviceStatus.running ? <Activity size={24} /> : <ServerOff size={24} />}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Devices</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{activeTanks.length} <span className="text-sm text-slate-500 font-normal">/ {tanks.length}</span></h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Server size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Critical Alerts</p>
              <h3 className={`text-2xl font-bold mt-1 ${criticalAlerts.length > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {criticalAlerts.length}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${criticalAlerts.length > 0 ? 'bg-rose-400/10 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">System Health</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">Good</h3>
            </div>
            <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tanks List */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Live Device Readings</h2>
          </div>
          <div className="p-6 flex-1">
            {tanks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                No tank data available in database
              </div>
            ) : (
              <div className="space-y-4">
                {tanks.map((tank) => {
                  // Simplified level calc for UI if not stored
                  const pressure = tank.last_reading?.pressure_MPa || 0;
                  const level = Math.min(100, Math.max(0, (pressure / 0.01793) * 100)).toFixed(1);
                  const isLow = level < 20;

                  return (
                    <div key={tank._id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-slate-200">{tank.unit_id}</h4>
                        <span className="text-xs text-slate-400">
                          {tank.last_reading?.timestamp ? new Date(tank.last_reading.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-3xl font-bold text-white">{level}%</p>
                          <p className="text-xs text-slate-500 mt-1">Pressure: {pressure.toFixed(4)} MPa</p>
                        </div>
                        <div className="w-1/2">
                          <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isLow ? 'bg-rose-500' : 'bg-blue-500'} transition-all duration-1000`}
                              style={{ width: `${level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                No recent alerts
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert._id} className={`p-3 rounded border-l-4 ${
                    alert.severity === 'CRITICAL' ? 'border-rose-500 bg-rose-500/10' :
                    alert.severity === 'URGENT' ? 'border-orange-500 bg-orange-500/10' :
                    'border-yellow-500 bg-yellow-500/10'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900/50 text-slate-300">
                        {alert.unit_id}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-slate-200">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
