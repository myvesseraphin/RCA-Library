import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <header className="h-20 bg-white sticky top-0 z-10 flex items-center justify-between px-8 border-b border-gray-100">
      <div className="flex-1 max-w-xl relative">
        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-primary">
          <Search className="w-5 h-5 opacity-70" />
        </span>
        <input
          type="text"
          placeholder="What do you want to find?"
          className="w-full bg-gray-50/80 border border-gray-100 rounded-full py-2.5 px-5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-6 ml-4">
        <button className="text-gray-500 hover:text-brand-primary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full translate-x-0.5 -translate-y-0.5 border-2 border-white"></span>
        </button>
        <button className="text-gray-500 hover:text-brand-primary transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2.5 py-1.5 rounded-full transition-colors">
          <img
            src="https://picsum.photos/seed/priscilla/100/100"
            alt="Priscilla Lily"
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">Priscilla Lily</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
