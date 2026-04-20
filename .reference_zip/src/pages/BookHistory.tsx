import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const historyData = [
  { copyId: '#0018-A', borrower: 'Sarah Jones', roll: '#2102', loanDate: '10 Oct, 2023', dueDate: '25 Oct, 2023', status: 'Borrowed', avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { copyId: '#0018-C', borrower: 'Emily Chen', roll: '#2130', loanDate: '02 Oct, 2023', dueDate: '17 Oct, 2023', status: 'Returned' },
  { copyId: '#0018-B', borrower: 'David Lee', roll: '#2111', loanDate: '20 Sep, 2023', dueDate: '05 Oct, 2023', status: 'Returned' },
  { copyId: '#0018-C', borrower: 'Sarah Jones', roll: '#2102', loanDate: '20 Sep, 2023', dueDate: '05 Oct, 2023', status: 'Returned' },
];

export function BookHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Loan History</h1>
        <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Book Loan History</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        
        {/* Top Summary Card */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-gray-200">
               <img src={`https://picsum.photos/seed/physicsbook${id || 1}/240/320`} alt="Book Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-gray-900 leading-snug">Modern Physics</h2>
               <p className="text-gray-600">Library ID #0018</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-brand-primary text-brand-primary font-medium rounded-lg hover:bg-brand-secondary transition-colors text-sm"
          >
            Back to Details
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Copy Selection</label>
            <div className="relative">
              <select className="appearance-none w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-400 transition-colors">
                <option>Copy #0018-A</option>
                <option>Copy #0018-B</option>
                <option>Copy #0018-C</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <div className="relative">
              <select className="appearance-none w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-400 transition-colors">
                <option>Borrowed</option>
                <option>Returned</option>
                <option>Overdue</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                defaultValue="10-02-2023 - 19-03-2023"
                className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-2.5 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-400 transition-colors"
                readOnly
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute right-3" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[800px]">
             <thead>
              <tr className="bg-gray-100/50 border-b border-gray-200">
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Copy Id</th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Borrower Name</th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Id/Roll</th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Loan Date</th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Due Date</th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-800 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {historyData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">{row.copyId}</td>
                  <td className="px-6 py-4 text-gray-800">{row.borrower}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{row.roll}</td>
                  <td className="px-6 py-4 text-gray-800">{row.loanDate}</td>
                  <td className="px-6 py-4 text-gray-800">{row.dueDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded text-xs font-semibold ${
                         row.status === 'Borrowed' ? 'bg-green-200/50 text-green-700' : 'bg-gray-200/60 text-gray-600'
                       }`}>
                         {row.status}
                       </span>
                       {row.avatar && (
                         <img src={row.avatar} alt={row.borrower} className="w-6 h-6 rounded-full object-cover border border-gray-200 shadow-sm" referrerPolicy="no-referrer" />
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     {row.status === 'Borrowed' && (
                       <div className="flex flex-col gap-1 text-xs font-medium">
                         <button className="text-brand-primary hover:text-brand-hover text-left transition-colors">Print Record</button>
                         <button className="text-brand-primary hover:text-brand-hover text-left transition-colors">Email Borrower</button>
                       </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-6 text-sm text-gray-900 font-medium bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <div className="relative border border-gray-200 rounded px-3 py-1 flex items-center gap-2 cursor-pointer hover:bg-gray-50">
               <span>10</span>
               <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
            <span>Page 1</span>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
