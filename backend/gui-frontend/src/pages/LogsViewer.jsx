import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, Search, Filter } from 'lucide-react';

const LogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const logsEndRef = useRef(null);
  const wsRef = useRef(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    // Connect to WebSocket
    wsRef.current = new WebSocket('ws://localhost:3001');

    wsRef.current.onmessage = (event) => {
      if (isPausedRef.current) return;
      
      const data = JSON.parse(event.data);
      if (data.type === 'init' || data.type === 'update') {
        setLogs(prev => {
          const newLogs = [...prev, ...data.lines];
          // Keep only last 1000 lines to prevent memory issues
          return newLogs.slice(-1000);
        });
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Run only once on mount

  useEffect(() => {
    // Auto-scroll to bottom unless paused
    if (!isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isPaused]);

  const clearLogs = async () => {
    try {
      await fetch('http://localhost:3001/api/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
      // Fallback to clear local logs if backend fails
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'ALL') {
      const levelMatch = log.match(/ - (INFO|WARNING|ERROR|DEBUG|CRITICAL) - /);
      if (levelMatch) {
        if (levelMatch[1] !== filter) return false;
      } else {
        if (!log.includes(filter)) return false;
      }
    }
    if (searchTerm && !log.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getLogColor = (log) => {
    if (log.includes('ERROR') || log.includes('✗')) return 'text-rose-400';
    if (log.includes('WARNING') || log.includes('⚠') || log.includes('🚨')) return 'text-amber-400';
    if (log.includes('INFO') && log.includes('✓')) return 'text-emerald-400';
    return 'text-slate-300';
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Live Logs</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-48"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
          
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center px-4 py-2 rounded text-sm transition-colors ${
              isPaused ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <><Play size={16} className="mr-2" /> Resume</> : <><Pause size={16} className="mr-2" /> Pause</>}
          </button>
          
          <button 
            onClick={clearLogs}
            className="flex items-center px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 rounded text-sm transition-colors"
          >
            <Trash2 size={16} className="mr-2" /> Clear
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0d1117] rounded-xl border border-slate-700 overflow-hidden flex flex-col font-mono text-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center mt-10">No logs to display</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className={`break-words ${getLogColor(log)}`}>
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LogsViewer;
