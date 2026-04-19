import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThreeBackground from './ThreeBackground';
import gsap from 'gsap';

const Layout = () => {
  const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-transparent text-gray-200">
      <ThreeBackground />
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div ref={pageRef}>
          <Outlet />
        </div>
        
        <footer className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          <div>
            Made by <span className="text-gray-300 font-medium">Abdul Rahman</span> for Integral University
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
            <img src="https://www.iul.ac.in/img/logo.png" alt="IU" className="h-4 w-4 invert grayscale" />
            INTEGRAL UNIVERSITY
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
