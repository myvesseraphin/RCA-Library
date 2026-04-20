import React from 'react';
import { Search, Bell, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InitialAvatar } from '../ui/InitialAvatar';
import { useAuth } from '../../lib/auth';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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

        <div className="flex items-center gap-3 px-2.5 py-1.5 rounded-full transition-colors">
          <InitialAvatar name={user?.name ?? 'Library Staff'} className="h-10 w-10 text-sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name ?? 'Library Staff'}</p>
            <p className="text-xs text-gray-500">{user?.role ?? 'Librarian'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-brand-primary"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
