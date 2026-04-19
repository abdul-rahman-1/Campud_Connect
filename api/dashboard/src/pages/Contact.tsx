import React from 'react';
import { 
  User, Mail, ExternalLink, ShieldCheck, 
  Briefcase, Info, Terminal, Award 
} from 'lucide-react';

const Contact = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Developer Contact
        </h1>
        <p className="text-gray-400">System Dashboard & Infrastructure Engineer Information</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center space-y-6 sticky top-8">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2.2rem] blur opacity-25"></div>
              <img 
                src="/dev.jpeg" 
                alt="Abdul Rahman" 
                className="relative w-48 h-48 rounded-[2rem] object-cover border-2 border-white/10 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-[#050505] shadow-lg shadow-green-500/20"></div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white tracking-tight">Abdul Rahman</h2>
              <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs">Full Stack Developer</p>
              <p className="text-gray-500 font-medium text-xs uppercase tracking-widest">Systems Engineer</p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <ContactLink 
                icon={User} 
                label="GitHub Profile" 
                value="github.com/abdul-rahman-1" 
                href="https://github.com/abdul-rahman-1" 
              />
              <ContactLink 
                icon={Mail} 
                label="Email Address" 
                value="abdalrahmankhan@gmail.com" 
                href="mailto:abdalrahmankhankhan@gmail.com" 
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass p-10 rounded-[2.5rem] border border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white">Project Info</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoBox label="System Name" value="HydroPulse // TankWatch" />
                <InfoBox label="Platform" value="Water Monitoring GUI" />
                <InfoBox label="Infrastructure" value="Flask API & Vite Dashboard" />
                <InfoBox label="Deployment" value="Cloudflare Tunnels" />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={14} className="text-primary" />
                  About this project
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  This mission-critical API server serves as the backbone for the TankWatch ecosystem. 
                  It facilitates real-time data ingestion from ESP32 sensor nodes, orchestrates long-term storage 
                  in MongoDB clusters, and provides a secure, administrative-grade GUI for system oversight. 
                  Integrated with Cloudflare Zerotrust architecture, it enables global accessibility 
                  without compromising local network security.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="text-yellow-500" size={20} />
                  <span className="text-sm font-bold text-gray-300">Made by Abdul Rahman for Integral University</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                  <div className="w-2 h-2 rounded-full bg-secondary/40"></div>
                  <div className="w-2 h-2 rounded-full bg-accent/40"></div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Feature icon={Briefcase} title="Experience" desc="Full-stack engineering with focus on IoT dashboards." />
            <Feature icon={User} title="Role" desc="Lead architect for Campus Connect infrastructure." />
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactLink = ({ icon: Icon, label, value, href }: any) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
      <div className="text-left">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{label}</p>
        <p className="text-sm font-medium text-gray-300">{value}</p>
      </div>
    </div>
    <ExternalLink size={14} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-all" />
  </a>
);

const InfoBox = ({ label, value }: any) => (
  <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-gray-200">{value}</p>
  </div>
);

const Feature = ({ icon: Icon, title, desc }: any) => (
  <div className="glass p-6 rounded-3xl border border-white/5 space-y-2">
    <div className="p-2 w-fit rounded-lg bg-white/5 text-primary">
      <Icon size={18} />
    </div>
    <h4 className="font-bold text-white">{title}</h4>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default Contact;
