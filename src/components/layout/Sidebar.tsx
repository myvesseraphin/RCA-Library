import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Book,
  Home,
  Library,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BrandLogo } from '../ui/BrandLogo';

type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Library', path: '/library', icon: Library },
  { name: 'Borrowing', path: '/borrowing', icon: Book },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto hidden md:flex pb-6 custom-scrollbar">
      <div className="p-6 pb-2">
        <Link to="/dashboard">
          <BrandLogo imageClassName="h-9" titleClassName="text-xl" />
        </Link>
      </div>

      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : 'text-gray-600 hover:bg-brand-secondary hover:text-brand-primary',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
