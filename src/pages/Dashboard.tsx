import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, BookOpen, Bell, CheckCircle2, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { api, type DashboardData } from '../lib/api';

const statIcons = [Users, Users, BookOpen, Bell];

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    api.getDashboard()
      .then((data) => {
        if (active) {
          setDashboardData(data);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load the dashboard.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{error ?? 'Loading dashboard data...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {dashboardData.welcomeName}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat, i) => {
          const Icon = statIcons[i];

          return (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 flex flex-col justify-between items-start">
            <div className={`p-3 rounded-xl mb-4 ${stat.bg}`}>
              <Icon className={`w-6 h-6 ${stat.text}`} />
            </div>
            <div>
               <h3 className="text-gray-500 text-sm mb-1 font-medium">{stat.label}</h3>
               <div className="flex items-end gap-3">
                 <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                 {stat.trend && (
                   <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                     <ArrowUpRight className="w-3 h-3 mr-0.5" />
                     {stat.trend}
                   </span>
                 )}
               </div>
            </div>
          </div>
        )})}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Weekly Attendance Trends</h2>
            <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.attendanceTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6D28D9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#6D28D9', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6D28D9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Book Borrowing by Subject */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Book Borrowing by Subject</h2>
             <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.topBorrowedCategories} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6D28D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Borrowers Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Borrowers</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar -mx-6 px-6">
             <table className="w-full text-left text-sm min-w-[400px]">
               <thead>
                 <tr className="text-gray-500 border-b border-gray-100">
                    <th className="pb-3 w-8">
                       <div className="w-4 h-4 border-2 rounded border-gray-300"></div>
                    </th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Percent</th>
                    <th className="pb-3 font-medium">Class</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {dashboardData.recentBorrowers.length > 0 ? dashboardData.recentBorrowers.map((student) => (
                    <tr
                      key={student.id}
                      className={`${student.selected ? 'bg-brand-primary/5' : ''} cursor-pointer`}
                      onClick={() => navigate(`/users/${student.id}/profile`)}
                    >
                       <td className="py-3">
                         <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${student.selected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                           {student.selected && (
                             <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                           )}
                         </div>
                       </td>
                       <td className="py-3">
                         <div className="flex items-center gap-2">
                           <InitialAvatar name={student.name} className="w-7 h-7 text-[11px]" />
                           <span className="font-semibold text-gray-800">{student.name}</span>
                         </div>
                       </td>
                       <td className="py-3 text-gray-600">{student.studentId}</td>
                       <td className="py-3 text-gray-600">{student.percent}</td>
                       <td className="py-3 text-gray-600">{student.className}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                        No borrowers yet. Add users to see activity here.
                      </td>
                    </tr>
                  )}
               </tbody>
             </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
             <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-4">
            {dashboardData.quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="w-full py-3 px-4 border text-brand-primary font-medium border-brand-primary/20 rounded-xl hover:bg-brand-secondary transition-colors text-center"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
