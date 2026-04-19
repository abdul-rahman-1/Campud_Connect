import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Config from './pages/Config';
import Contact from './pages/Contact';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import Service from './pages/Service';
import Setting from './pages/Setting';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/config" element={<Config />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/service" element={<Service />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
