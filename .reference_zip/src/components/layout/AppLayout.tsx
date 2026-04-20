import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-brand-bg relative overflow-hidden">
        {/* Background decorative blob */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
      
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 relative z-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
