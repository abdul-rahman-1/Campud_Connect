import React from 'react';
import { Code, Mail, Globe } from 'lucide-react';

const Contact = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-white">Developer Contact</h2>
      
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden">
              <img src="/dev.jpeg" alt="Abdul Rahman" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-1">Abdul Rahman</h3>
          <p className="text-blue-400 font-medium mb-6">Full Stack Developer & Systems Engineer</p>
          
          <div className="space-y-4">
            <div className="flex items-center text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <Code className="text-slate-400 mr-4" size={24} />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">GitHub Profile</p>
                <a href="https://github.com/abdul-rahman-1" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                  github.com/abdul-rahman-1
                </a>
              </div>
            </div>
            
            <div className="flex items-center text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <Mail className="text-slate-400 mr-4" size={24} />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Email Address</p>
                <a href="mailto:abdalrahmankhankhan@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                  abdalrahmankhankhan@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <Globe className="text-slate-400 mr-4" size={24} />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Project Info</p>
                <p className="text-slate-300">Water Tank Monitoring System GUI</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h4 className="text-lg font-semibold text-white mb-2">About this project</h4>
            <p className="text-slate-400 leading-relaxed">
              This graphical interface was built to manage the 24x7 water tank monitoring python service. 
              It provides real-time visualization of sensor data stored in MongoDB, live log streaming via WebSockets, 
              and configuration management for ESP32 devices. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;