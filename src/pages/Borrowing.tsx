import React, { useState } from 'react';
import { Search, ChevronDown, Trash2, Edit3, Plus, Minus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const initialBorrowingData = [
  { id: 1, title: 'Mathematics', cover: 'https://picsum.photos/seed/math1/60/80', borrower: 'Alex Carter (9A)', bookId: '#0021', dueDate: '25 Oct, 2023', fine: 'None', status: 'Borrowed', selected: false },
  { id: 2, title: 'Literature', cover: 'https://picsum.photos/seed/lit1/60/80', borrower: 'Sarah Jones (10B)', bookId: '#0011', dueDate: '12 Oct, 2023', fine: '$5.00', status: 'Overdue', selected: false },
  { id: 3, title: 'English', cover: 'https://picsum.photos/seed/eng1/60/80', borrower: 'Kristin Watson', bookId: '#0031', dueDate: '12 Oct, 2023', fine: '$5.00', status: 'Borrowed', selected: true },
  { id: 4, title: 'Mathematics', cover: 'https://picsum.photos/seed/math2/60/80', borrower: 'Savannah Nguyen', bookId: '#0013', dueDate: '12 Oct, 2023', fine: '$5.00', status: 'Borrowed', selected: false },
  { id: 5, title: 'Physics', cover: 'https://picsum.photos/seed/phys1/60/80', borrower: '-', bookId: '#0041', dueDate: '-', fine: 'None', status: 'Available', selected: false },
  { id: 6, title: 'Mathematics', cover: 'https://picsum.photos/seed/math3/60/80', borrower: 'Arlene McCoy', bookId: '#0019', dueDate: '23 Oct, 2023', fine: '$5.00', status: 'Borrowed', selected: false },
  { id: 7, title: 'Biology', cover: 'https://picsum.photos/seed/bio1/60/80', borrower: '-', bookId: '#0055', dueDate: '-', fine: 'None', status: 'Available', selected: false },
  { id: 8, title: 'History', cover: 'https://picsum.photos/seed/hist1/60/80', borrower: '-', bookId: '#0062', dueDate: '-', fine: 'None', status: 'Available', selected: false },
  { id: 9, title: 'English', cover: 'https://picsum.photos/seed/eng3/60/80', borrower: 'Sarah Jones (10B)', bookId: '#0011', dueDate: '12 Oct, 2023', fine: '$5.00', status: 'Overdue', selected: false },
];

export function Borrowing() {
  const [borrowings, setBorrowings] = useState(initialBorrowingData);
  const [recordToDelete, setRecordToDelete] = useState<(typeof initialBorrowingData)[0] | null>(null);

  // Borrow Modal State
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [activeBorrowIds, setActiveBorrowIds] = useState<number[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const mockUsersList = [
    "Alex Carter (9A)", "Sarah Jones (10B)", "Kristin Watson", 
    "Savannah Nguyen", "Jacob Jones", "Arlene McCoy", 
    "Jane Doe (11C)", "Eleanor Pena (12A)"
  ];

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBorrowings(borrowings.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
  };

  const handleDeleteClick = (record: typeof initialBorrowingData[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordToDelete(record);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setBorrowings(borrowings.filter(b => b.id !== recordToDelete.id));
      setRecordToDelete(null);
    }
  };

  const handleReturn = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBorrowings(borrowings.map(b => b.id === id ? { ...b, borrower: '-', dueDate: '-', fine: 'None', status: 'Available' } : b));
  };

  const openBorrowModalSingle = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveBorrowIds([id]);
    setUserSearchTerm('');
    setIsBorrowModalOpen(true);
  };

  const openBorrowModalBulk = () => {
    const selectedIds = borrowings.filter(b => b.selected && b.status === 'Available').map(b => b.id);
    if (selectedIds.length === 0) return;
    setActiveBorrowIds(selectedIds);
    setUserSearchTerm('');
    setIsBorrowModalOpen(true);
  };

  const handleBulkReturn = () => {
    const selectedIds = borrowings.filter(b => b.selected && b.status !== 'Available').map(b => b.id);
    if (selectedIds.length === 0) return;
    setBorrowings(borrowings.map(b => 
      selectedIds.includes(b.id) 
        ? { ...b, borrower: '-', dueDate: '-', fine: 'None', status: 'Available', selected: false } 
        : b
    ));
  };

  const confirmBorrow = (borrowerName: string) => {
    setBorrowings(borrowings.map(b => 
      activeBorrowIds.includes(b.id)
        ? { ...b, borrower: borrowerName, dueDate: '30 Oct, 2023', status: 'Borrowed', selected: false }
        : b
    ));
    setIsBorrowModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
       <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Library: Borrow & Return</h1>
          <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Borrow & Return</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={openBorrowModalBulk}
            className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20"
          >
            <Plus className="w-4 h-4" />
            Borrow Book
          </button>
          <button 
            onClick={handleBulkReturn}
            className="flex items-center gap-2 bg-white text-brand-primary border border-brand-primary/30 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-secondary transition-colors shadow-sm"
          >
            <Minus className="w-4 h-4" />
            Return Book
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">All Circulation</h2>
          <div className="flex items-center gap-4">
             <div className="relative">
              <input
                type="text"
                placeholder="Search by name or roll"
                className="w-full sm:w-64 bg-gray-50/50 border border-gray-200 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Last 30 days
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                 <th className="px-6 py-4 w-12">
                   <div className="w-5 h-5 border-2 rounded border-gray-300"></div>
                </th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Book Title</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Borrower Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Id</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Due Date</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Fine</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {borrowings.map((b) => (
                <tr key={b.id} className={`hover:bg-gray-50/50 transition-colors ${b.selected ? 'bg-brand-primary/5' : ''}`}>
                   <td className="px-6 py-4">
                    <div 
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${b.selected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}
                      onClick={(e) => toggleSelect(b.id, e)}
                    >
                      {b.selected && (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-gray-100`}>
                        <img src={b.cover} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{b.borrower}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{b.bookId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{b.dueDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{b.fine}</td>
                  <td className="px-6 py-4">
                    {b.status === 'Available' ? (
                      <button 
                        onClick={(e) => openBorrowModalSingle(b.id, e)}
                        className="px-3 py-1 bg-brand-primary text-white text-[13px] font-medium rounded hover:bg-brand-hover transition-colors shadow-sm"
                      >
                        Borrow
                      </button>
                    ) : (
                      <span className={`font-medium text-sm ${b.status === 'Overdue' ? 'text-red-600' : 'text-green-600'}`}>
                        {b.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {b.status !== 'Available' && (
                        <button 
                          onClick={(e) => handleReturn(b.id, e)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          Return
                        </button>
                      )}
                       <button 
                         onClick={(e) => handleDeleteClick(b, e)}
                         className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                       >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-6 text-sm text-gray-600 bg-gray-50/30 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:text-brand-primary hover:bg-brand-secondary rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex items-center gap-1 font-medium">
              <button className="w-8 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">2</button>
              <button className="w-8 h-8 rounded bg-brand-primary text-white shadow-sm flex items-center justify-center">3</button>
              <button className="w-8 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">4</button>
              <button className="w-8 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">5</button>
              <MoreHorizontal className="w-4 h-4 mx-1 text-gray-400" />
              <button className="w-8 h-8 rounded hover:bg-gray-100 transition-colors flex items-center justify-center">100</button>
            </div>
            <button className="p-1 hover:text-brand-primary hover:bg-brand-secondary rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-6 cursor-pointer hover:text-gray-800 transition-colors">
            <span>10 / page</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Trash2 className="w-5 h-5 text-brand-primary" />
              <h3 className="text-[17px] font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <div className="p-6">
              <p className="text-[15px] text-gray-800 leading-relaxed mb-6">
                Are you sure you want to delete the circulation record for 
                '{recordToDelete.title}' by {recordToDelete.borrower} (ID {recordToDelete.bookId})? 
                This action cannot be undone.
              </p>
              
              {recordToDelete.fine && recordToDelete.fine !== 'None' && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 group-hover:border-brand-primary flex items-center justify-center transition-colors">
                    {/* Simplified checkbox UI for visual match; actual state could be wired if fine deletion is complex */}
                  </div>
                  <span className="text-gray-800 font-medium text-[15px]">
                    Also delete associated fine of {recordToDelete.fine}
                  </span>
                </label>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setRecordToDelete(null)}
                className="flex-1 px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Borrow Modal */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Search className="w-5 h-5 text-brand-primary" />
              <h3 className="text-[17px] font-bold text-gray-900">Select Borrower</h3>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
                  autoFocus
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
              {mockUsersList.filter(u => u.toLowerCase().includes(userSearchTerm.toLowerCase())).map(user => (
                <button
                  key={user}
                  onClick={() => confirmBorrow(user)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-800 font-medium flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {user.charAt(0)}
                  </div>
                  {user}
                </button>
              ))}
              {mockUsersList.filter(u => u.toLowerCase().includes(userSearchTerm.toLowerCase())).length === 0 && (
                <p className="text-center text-sm text-gray-500 py-6">No users found.</p>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => setIsBorrowModalOpen(false)}
                className="flex-1 px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
