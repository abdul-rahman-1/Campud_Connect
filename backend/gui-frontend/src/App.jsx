import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import ConfigManager from './pages/ConfigManager';
import LogsViewer from './pages/LogsViewer';
import AlertsPanel from './pages/AlertsPanel';
import ServiceControl from './pages/ServiceControl';
import Settings from './pages/Settings';
import Contact from './pages/Contact';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/config" element={<ConfigManager />} />
          <Route path="/logs" element={<LogsViewer />} />
          <Route path="/alerts" element={<AlertsPanel />} />
          <Route path="/service" element={<ServiceControl />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
