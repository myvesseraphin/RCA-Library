import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, BookOpen, CalendarDays, CheckCircle2, UserRound, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { PageLoader } from '../components/ui/PageLoader';
import { api, type DashboardData } from '../lib/api';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';

const statIcons = [Users, UserRound, BookOpen, Bell];

export function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { notifications } = useNotifications();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    api.getDashboard()
      .then((data) => {
        if (active) {
          setDashboardData(data);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : 'Unable to load the dashboard.');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [toast]);

  const noticeItems = useMemo(() => notifications.slice(0, 3), [notifications]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="page-shell space-y-5">
      <div>
        <h1 className="text-[1.45rem] font-bold leading-tight text-gray-900">Welcome to Library Management System</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData.stats.map((stat, index) => {
          const Icon = statIcons[index] ?? Bell;

          return (
            <div key={stat.label} className="showcase-metric-card p-5">
              <div className="flex flex-col items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#f8f3ff] text-[#8130d2]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 w-full mt-1">
                  <p className="text-[13px] font-medium text-gray-500 truncate">{stat.label}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[1.85rem] font-bold leading-none text-gray-900">{stat.value}</span>
                    {stat.trend ? (
                      <span className="flex items-center rounded-full bg-[#ecfccb] px-2 py-[2px] text-[11px] font-semibold text-[#65a30d]">
                        <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                        {stat.trend}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="showcase-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold text-gray-900">Weekly Attendance Trends</h2>
            <span className="showcase-section-dot">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.attendanceTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboard-attendance-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c2fd0" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#7c2fd0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#efe8f6" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#756a84', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#756a84', fontSize: 11 }} />
                <Tooltip
                  cursor={false}
                  contentStyle={{ borderRadius: '14px', border: '1px solid #efe8f6', boxShadow: '0 12px 30px rgba(92,64,146,0.10)' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7c2fd0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#dashboard-attendance-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="showcase-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold text-gray-900">Top Book Borrowing by Subject</h2>
            <span className="showcase-section-dot">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.topBorrowedCategories} margin={{ top: 10, right: 0, left: -12, bottom: 0 }} barSize={22}>
                <CartesianGrid stroke="#efe8f6" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#756a84', fontSize: 11 }} dy={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#756a84', fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 47, 208, 0.04)' }}
                  contentStyle={{ borderRadius: '14px', border: '1px solid #efe8f6', boxShadow: '0 12px 30px rgba(92,64,146,0.10)' }}
                />
                <Bar dataKey="value" fill="#7c2fd0" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <section className="showcase-card px-2 py-4">
          <div className="mb-4 px-4 flex items-center justify-between">
            <div>
              <h2 className="text-[1.05rem] font-bold text-gray-900">Recent Borrowers</h2>
            </div>
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[#8f829f]">
                  <th className="px-5 py-3 font-medium">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#7c2fd0] focus:ring-[#7c2fd0]" disabled />
                      Name
                    </label>
                  </th>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Percent</th>
                  <th className="px-5 py-3 font-medium">Year</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentBorrowers.slice(0, 5).map((borrower, idx) => (
                  <tr
                    key={borrower.id}
                    onClick={() => navigate(`/users/${borrower.id}/profile`)}
                    className="cursor-pointer transition hover:bg-[#fdfaff]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-gray-300 text-[#7c2fd0] focus:ring-[#7c2fd0]" defaultChecked={idx === 1} onClick={(e) => e.stopPropagation()} />
                        <InitialAvatar name={borrower.name} className="h-7 w-7 text-[10px]" />
                        <span className="font-semibold text-gray-900">{borrower.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{borrower.studentId}</td>
                    <td className="px-5 py-3.5 text-gray-500">{(Math.random() * 15 + 85).toFixed(0)}%</td>
                    <td className="px-5 py-3.5 text-gray-500">2024</td>
                  </tr>
                ))}
                {dashboardData.recentBorrowers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-4 text-center text-gray-500">No borrowers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="showcase-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.05rem] font-bold text-gray-900">Quick Actions</h2>
            <span className="showcase-section-dot">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="space-y-3 mt-6">
            {dashboardData.quickActions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.path)}
                className="w-full rounded-xl border border-[#eee6f7] bg-white px-4 py-2.5 text-center text-[13px] font-medium text-[#7c2fd0] transition hover:bg-[#fdfaff] shadow-sm shadow-[#7c2fd0]/5"
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
