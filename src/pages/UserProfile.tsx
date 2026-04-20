import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, ResponsiveContainer, BarChart, Bar, Cell, YAxis, CartesianGrid } from 'recharts';
import { CornerUpLeft, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { api, type UserProfileData } from '../lib/api';
import { formatFine, formatRwf } from '../lib/seed';

const summaryChartData = [
  { name: 'Jan', val: 5 },
  { name: 'Feb', val: 12 },
  { name: 'Mar', val: 23 },
  { name: 'Apr', val: 18 },
  { name: 'May', val: 32 },
  { name: 'Jun', val: 20 },
  { name: 'Jul', val: 35 },
  { name: 'Aug', val: 42 },
  { name: 'Sep', val: 50 },
  { name: 'Oct', val: 78 },
  { name: 'Nov', val: 52 },
  { name: 'Dec', val: 68 },
];

const finesChartData = [
  { name: 'Jan', val: 3, type: 'purple' },
  { name: 'Feb', val: 12, type: 'purple' },
  { name: 'Mar', val: 25, type: 'green' },
  { name: 'Apr', val: 32, type: 'purple' },
  { name: 'May', val: 15, type: 'green' },
  { name: 'Jun', val: 40, type: 'green' },
  { name: 'Jul', val: 30, type: 'purple' },
  { name: 'Aug', val: 12, type: 'purple' },
];

export function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    api.getUserProfile(id)
      .then((data) => {
        if (active) {
          setProfile(data);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load the borrower profile.');
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Borrower Profile</h1>
        <p className="text-sm text-gray-500">{error ?? 'Loading borrower profile...'}</p>
      </div>
    );
  }

  const { user, currentBorrowings, fineHistory, borrowHistory } = profile;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Borrower Profile: {user.name} ({user.className})</h1>
          <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Borrower Profile</span></p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          <InitialAvatar name={user.name} className="w-12 h-12 text-base" />
          <div>
            <h2 className="text-gray-900 font-bold text-base leading-tight">{user.name}</h2>
            <p className="text-gray-500 text-sm">Class: {user.className}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-900 mb-6">Personal Details</h3>
          <div className="flex-1 grid grid-cols-2 gap-y-6 content-start">
            <div>
              <p className="text-gray-500 text-[13px] font-medium mb-1">Name</p>
              <p className="text-gray-900 font-bold text-base">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[13px] font-medium mb-1">Class</p>
              <p className="text-gray-900 font-bold text-base">{user.className}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-[13px] font-medium mb-1">Student ID</p>
              <p className="text-gray-900 font-bold text-base">{user.studentId}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-[13px] font-medium mb-1">Contact info:</p>
              <p className="text-gray-900 font-bold text-[13px] mt-0.5">{user.primaryEmail}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-900 mb-4">Borrowing Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-[11px] font-medium leading-tight mb-1">Lifetime Borrowed:</p>
              <p className="text-gray-900 font-bold text-xl">{user.lifetimeBorrowed} Books</p>
            </div>
            <div>
              <p className="text-gray-500 text-[11px] font-medium leading-tight mb-1">Current Loans:</p>
              <p className="text-gray-900 font-bold text-xl">{currentBorrowings.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[11px] font-medium leading-tight mb-1">Total Overdue Events:</p>
              <p className="text-gray-900 font-bold text-xl">{user.overdueEvents}</p>
            </div>
          </div>
          <div className="flex-1 min-h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summaryChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} ticks={[0, 20, 40, 60, 80]} />
                <Line type="monotone" dataKey="val" stroke="#7E22CE" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-900 mb-4">Fines & Payments</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-[12px] font-medium mb-1">Total Owed Fines:</p>
              <p className="text-gray-900 font-bold text-2xl">{formatFine(user.totalFinesOwedRwf)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px] font-medium mb-1">Total Fines Paid:</p>
              <p className="text-gray-900 font-bold text-2xl">{formatRwf(user.totalFinesPaidRwf)}</p>
            </div>
          </div>
          <div className="flex-1 min-h-[140px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finesChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} ticks={[0, 10, 20, 30, 40]} />
                <Bar dataKey="val" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {finesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'purple' ? '#7E22CE' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="text-[17px] font-bold text-gray-900">Current Loans</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px]">Copy ID</th>
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px]">Book Title</th>
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px]">Subject</th>
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px]">Due Date</th>
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px]">Status</th>
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px]">Fines Accrued</th>
                <th className="px-6 py-3.5 font-semibold text-gray-800 text-[13px] w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentBorrowings.length > 0 ? currentBorrowings.map((entry) => (
                <tr key={entry.copyId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">{entry.copyId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={entry.book.cover} alt={entry.book.title} className="w-8 h-8 rounded-full border border-gray-200 object-cover" referrerPolicy="no-referrer" />
                      <span className="font-semibold text-gray-800">{entry.book.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">{entry.book.subject}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">{entry.dueDate ?? '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${entry.status === 'Overdue' ? 'bg-red-200/60 text-red-700' : 'bg-green-200/60 text-green-700'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{formatFine(entry.fineRwf)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-3">
                      <button className="hover:text-gray-900 transition-colors"><CornerUpLeft className="w-4 h-4" /></button>
                      <button className="hover:text-gray-900 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No active loans for this borrower.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[340px]">
          <div className="px-6 pt-5 pb-4">
            <h3 className="text-[17px] font-bold text-gray-900 mb-4">Detailed Fine History</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[13px] font-medium">All Fines</button>
              <button className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-[13px] font-medium transition-colors">Paid Fines</button>
              <button className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-[13px] font-medium transition-colors">Owed Fines</button>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[12px] min-w-[500px]">
              <thead className="bg-[#F8F6FA]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-800">Fine ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Book Title</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Fine Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Date Accrued</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Amount</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Amount Owed</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fineHistory.length > 0 ? fineHistory.map((record) => {
                  const relatedBook = borrowHistory.find((entry) => entry.bookId === record.bookId);

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3.5 text-gray-800 font-medium">{record.id}</td>
                      <td className="px-4 py-3.5 text-gray-800">{relatedBook?.bookTitle ?? 'Library Book'}</td>
                      <td className="px-4 py-3.5 text-gray-800">{record.type}</td>
                      <td className="px-4 py-3.5 text-gray-800">{record.dateAccrued}</td>
                      <td className="px-4 py-3.5 text-gray-800 font-medium">{formatRwf(record.amountRwf)}</td>
                      <td className="px-4 py-3.5 text-gray-800 font-medium">{formatRwf(record.amountOwedRwf)}</td>
                      <td className="px-4 py-3.5">
                        <button className="px-3 py-1 border border-gray-200 rounded text-brand-primary hover:bg-brand-secondary transition-colors font-medium">
                          {record.amountOwedRwf > 0 ? 'Pay Fine' : 'Paid'}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No fine records for this borrower.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-1 py-4 text-[12px] mt-auto border-t border-gray-50">
            <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><ChevronLeft className="w-3 h-3" /></button>
            <button className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">1</button>
            <button className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">2</button>
            <button className="w-5 h-5 flex items-center justify-center rounded bg-brand-primary text-white font-medium">3</button>
            <span className="w-5 h-5 flex items-center justify-center text-gray-400"><MoreHorizontal className="w-3 h-3" /></span>
            <button className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">100</button>
            <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[340px]">
          <div className="px-6 pt-5 pb-4">
            <h3 className="text-[17px] font-bold text-gray-900 mb-4">Borrow History</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[13px] font-medium">Lifetime History</button>
              <button className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-[13px] font-medium transition-colors">Last 12 Months</button>
              <button className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 text-[13px] font-medium transition-colors">Completed Loans</button>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[12px] min-w-[500px]">
              <thead className="bg-[#F8F6FA]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-800">Copy ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Book Title</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Subject</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Loan Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-800 text-right">Total Fines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {borrowHistory.length > 0 ? borrowHistory.map((entry) => {
                  const statusLabel = entry.status === 'Returned'
                    ? entry.fineRwf > 0 ? 'Returned (Late)' : 'Returned'
                    : 'Borrowed';
                  const statusClass = entry.status === 'Borrowed'
                    ? 'bg-green-200/60 text-green-700'
                    : entry.fineRwf > 0
                      ? 'bg-red-200/60 text-red-700'
                      : 'bg-slate-200/60 text-slate-700';

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 text-gray-800 font-medium">{entry.copyId}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <img src={entry.bookCover} alt={entry.bookTitle} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <span className="font-semibold text-gray-800">{entry.bookTitle}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-800">{entry.subject}</td>
                      <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{entry.loanDate}</td>
                      <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{entry.dueDate}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-800 font-medium text-right">
                        {entry.fineRwf ? formatRwf(entry.fineRwf) : 'None'}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No borrowing history found for this borrower.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-1 py-4 text-[12px] mt-auto border-t border-gray-50">
            <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><ChevronLeft className="w-3 h-3" /></button>
            <button className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">1</button>
            <button className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">2</button>
            <button className="w-5 h-5 flex items-center justify-center rounded bg-brand-primary text-white font-medium">3</button>
            <span className="w-5 h-5 flex items-center justify-center text-gray-400"><MoreHorizontal className="w-3 h-3" /></span>
            <button className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:bg-gray-50">100</button>
            <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><ChevronRight className="w-3 h-3" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
