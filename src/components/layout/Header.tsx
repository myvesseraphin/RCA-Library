import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InitialAvatar } from '../ui/InitialAvatar';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import { useToast } from '../../lib/toast';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.info('You have been signed out.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-20 bg-white sticky top-0 z-10 flex items-center justify-between px-8 border-b border-gray-100">
      <div className="flex-1 max-w-xl">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="What do you want to find?"
            className="w-full bg-[#f8f9fc] border-none rounded-full py-2.5 px-6 pr-12 text-[14px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-[#a09eb1]"
          />
          <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#7c2fd0]">
            <Search className="w-[18px] h-[18px]" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="text-gray-500 hover:text-brand-primary transition-colors relative"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
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
