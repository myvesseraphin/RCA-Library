import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, Trash2, Plus, Minus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { api, type BorrowingRecord } from '../lib/api';
import { formatFine, type SeedUser } from '../lib/seed';
import { InitialAvatar } from '../components/ui/InitialAvatar';

export function Borrowing() {
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [users, setUsers] = useState<SeedUser[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<BorrowingRecord | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [activeBorrowIds, setActiveBorrowIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([api.getBorrowings(), api.getUsers()])
      .then(([borrowingItems, userItems]) => {
        if (active) {
          setBorrowings(borrowingItems);
          setUsers(userItems);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load circulation data.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const borrowerChoices = useMemo(() => users.map((user) => ({
    id: user.id,
    label: `${user.name} (${user.className})`,
  })), [users]);

  const toggleSelect = (copyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setBorrowings((current) => current.map((record) => record.copyId === copyId ? { ...record, selected: !record.selected } : record));
  };

  const handleDeleteClick = (record: BorrowingRecord, event: React.MouseEvent) => {
    event.stopPropagation();
    setRecordToDelete(record);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) {
      return;
    }

    try {
      await api.deleteBorrowing(recordToDelete.copyId);
      setBorrowings((current) => current.filter((record) => record.copyId !== recordToDelete.copyId));
      setRecordToDelete(null);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete that circulation record.');
    }
  };

  const handleReturn = async (copyId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      const updatedBorrowings = await api.returnBorrowing(copyId);
      setBorrowings(updatedBorrowings);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to return that copy.');
    }
  };

  const openBorrowModalSingle = (copyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveBorrowIds([copyId]);
    setUserSearchTerm('');
    setIsBorrowModalOpen(true);
  };

  const openBorrowModalBulk = () => {
    const selectedIds = borrowings.filter((record) => record.selected && record.status === 'Available').map((record) => record.copyId);

    if (selectedIds.length === 0) {
      setError('Select one or more available copies before borrowing.');
      return;
    }

    setActiveBorrowIds(selectedIds);
    setUserSearchTerm('');
    setIsBorrowModalOpen(true);
  };

  const handleBulkReturn = async () => {
    const selectedIds = borrowings.filter((record) => record.selected && record.status !== 'Available').map((record) => record.copyId);

    if (selectedIds.length === 0) {
      setError('Select one or more borrowed copies before returning.');
      return;
    }

    try {
      let updatedBorrowings = borrowings;

      for (const copyId of selectedIds) {
        updatedBorrowings = await api.returnBorrowing(copyId);
      }

      setBorrowings(updatedBorrowings);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to complete the bulk return.');
    }
  };

  const confirmBorrow = async (borrowerUserId: number) => {
    try {
      const updatedBorrowings = await api.createBorrowing({
        copyIds: activeBorrowIds,
        borrowerUserId,
      });

      setBorrowings(updatedBorrowings);
      setIsBorrowModalOpen(false);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to borrow the selected copies.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Library: Borrow & Return</h1>
          <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Borrow & Return</span></p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
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
              {borrowings.length > 0 ? borrowings.map((record) => (
                <tr key={record.copyId} className={`hover:bg-gray-50/50 transition-colors ${record.selected ? 'bg-brand-primary/5' : ''}`}>
                  <td className="px-6 py-4">
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${record.selected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}
                      onClick={(event) => toggleSelect(record.copyId, event)}
                    >
                      {record.selected && (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-gray-100">
                        <img src={record.book.cover} alt={record.book.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{record.book.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{record.borrowerLabel}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{record.book.bookId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{record.dueDate ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{formatFine(record.fineRwf)}</td>
                  <td className="px-6 py-4">
                    {record.status === 'Available' ? (
                      <button
                        onClick={(event) => openBorrowModalSingle(record.copyId, event)}
                        className="px-3 py-1 bg-brand-primary text-white text-[13px] font-medium rounded hover:bg-brand-hover transition-colors shadow-sm"
                      >
                        Borrow
                      </button>
                    ) : (
                      <span className={`font-medium text-sm ${record.status === 'Overdue' ? 'text-red-600' : 'text-green-600'}`}>
                        {record.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {record.status !== 'Available' && (
                        <button
                          onClick={(event) => handleReturn(record.copyId, event)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          Return
                        </button>
                      )}
                      <button
                        onClick={(event) => handleDeleteClick(record, event)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    No circulation records yet. Add borrowers and books first, then start lending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                {' '}'{recordToDelete.book.title}' by {recordToDelete.borrowerLabel} (ID {recordToDelete.book.bookId})?
                This action cannot be undone.
              </p>

              {recordToDelete.fineRwf > 0 && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 group-hover:border-brand-primary flex items-center justify-center transition-colors"></div>
                  <span className="text-gray-800 font-medium text-[15px]">
                    Also delete associated fine of {formatFine(recordToDelete.fineRwf)}
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
              {borrowerChoices.filter((user) => user.label.toLowerCase().includes(userSearchTerm.toLowerCase())).map((user) => (
                <button
                  key={user.id}
                  onClick={() => confirmBorrow(user.id)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-800 font-medium flex items-center gap-3"
                >
                  <InitialAvatar name={user.label} className="w-8 h-8 text-xs" />
                  {user.label}
                </button>
              ))}
              {borrowerChoices.filter((user) => user.label.toLowerCase().includes(userSearchTerm.toLowerCase())).length === 0 && (
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
