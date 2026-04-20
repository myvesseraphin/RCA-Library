import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, Users, Lightbulb, Library, UserCircle, 
  BookOpen, Book, CalendarDays, ClipboardCheck, 
  FileText, Megaphone, Bus, Building2, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Users', path: '/users', icon: Users, hasSub: true },
  { name: 'Library', path: '/library', icon: Library },
  { name: 'Borrowing', path: '/borrowing', icon: Book },
  { name: 'Analytics & Reports', path: '/analytics', icon: FileText },
  { name: 'Account', path: '/account', icon: UserCircle, hasSub: true },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto hidden md:flex pb-10 custom-scrollbar">
      <div className="p-6 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-brand-primary p-1.5 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="white" fillOpacity="0.1"/>
              <path d="M12 22V12L22 7M12 12L2 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-brand-primary tracking-tight">sp!k</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-gray-600 hover:bg-brand-secondary hover:text-brand-primary'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {item.hasSub && <ChevronDown className="w-4 h-4 opacity-50" />}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
