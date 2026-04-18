import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Droplets } from 'lucide-react';

const Splash = ({ onComplete }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Automatically hide splash via App.jsx timeout, but we can also trigger it here
        // if we wanted sequence-based completion.
      }
    });

    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      .fromTo(logoRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "bounce.out" })
      .fromTo(textRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.4")
      .fromTo(infoRef.current.children, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }, 
        "+=0.2"
      );

  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      <div ref={logoRef} className="text-blue-500 mb-6">
        <Droplets size={80} strokeWidth={1.5} />
      </div>
      <div ref={textRef} className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Water Tank <span className="text-blue-400">Monitor</span>
        </h1>
        <p className="text-slate-400 text-lg">System Initialization...</p>
      </div>
      
      <div ref={infoRef} className="absolute bottom-12 flex flex-col items-center text-slate-500 text-sm space-y-1">
        <p className="font-medium text-slate-400">Developed by Abdul Rahman</p>
        <p>GitHub: github.com/abdul-rahman-1</p>
        <p>Email: abdalrahmankhankhan@gmail.com</p>
      </div>
      
      {/* Loading bar */}
      <div className="w-64 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-blue-500 animate-[progress_3s_ease-in-out_forwards]"></div>
      </div>
    </div>
  );
};

export default Splash;
