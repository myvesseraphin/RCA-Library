import { useEffect, useMemo, useState, type SVGProps } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Minus, MoreHorizontal, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { api, type BorrowingRecord } from '../lib/api';
import { formatFine, type SeedUser } from '../lib/seed';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { BookCoverArtwork } from '../components/ui/BookCoverArtwork';
import { PageLoader } from '../components/ui/PageLoader';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';

const PAGE_SIZE = 10;



export function Borrowing() {
  const toast = useToast();
  const { refresh } = useNotifications();
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [users, setUsers] = useState<SeedUser[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<BorrowingRecord | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [activeBorrowIds, setActiveBorrowIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.all([api.getBorrowings(), api.getUsers()])
      .then(([borrowingItems, userItems]) => {
        if (active) {
          setBorrowings(borrowingItems);
          setUsers(userItems);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : 'Unable to load circulation data.');
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

  const borrowerChoices = useMemo(() => users.map((user) => ({
    id: user.id,
    label: `${user.name} (${user.className})`,
  })), [users]);

  const filteredBorrowings = useMemo(() => borrowings.filter((record) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      record.book.title,
      record.borrowerLabel,
      record.book.bookId,
      record.status,
      record.copyId,
    ].some((value) => value.toLowerCase().includes(query));
  }), [borrowings, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBorrowings.length / PAGE_SIZE));
  const pageItems = filteredBorrowings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const toggleSelect = (copyId: string) => {
    setBorrowings((current) => current.map((record) => record.copyId === copyId ? { ...record, selected: !record.selected } : record));
  };

  const confirmDelete = async () => {
    if (!recordToDelete) {
      return;
    }

    try {
      await api.deleteBorrowing(recordToDelete.copyId);
      setBorrowings((current) => current.filter((record) => record.copyId !== recordToDelete.copyId));
      setRecordToDelete(null);
      await refresh();
      toast.success('Circulation record deleted.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to delete that circulation record.');
    }
  };

  const handleReturn = async (copyId: string) => {
    try {
      const updatedBorrowings = await api.returnBorrowing(copyId);
      setBorrowings(updatedBorrowings);
      await refresh();
      toast.success('Book returned successfully.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to return that copy.');
    }
  };

  const openBorrowModalSingle = (copyId: string) => {
    setActiveBorrowIds([copyId]);
    setUserSearchTerm('');
    setIsBorrowModalOpen(true);
  };

  const openBorrowModalBulk = () => {
    const selectedIds = borrowings.filter((record) => record.selected && record.status === 'Available').map((record) => record.copyId);

    if (selectedIds.length === 0) {
      toast.info('Select one or more available copies before borrowing.');
      return;
    }

    setActiveBorrowIds(selectedIds);
    setUserSearchTerm('');
    setIsBorrowModalOpen(true);
  };

  const handleBulkReturn = async () => {
    const selectedIds = borrowings.filter((record) => record.selected && record.status !== 'Available').map((record) => record.copyId);

    if (selectedIds.length === 0) {
      toast.info('Select one or more borrowed copies before returning.');
      return;
    }

    try {
      let updatedBorrowings = borrowings;

      for (const copyId of selectedIds) {
        updatedBorrowings = await api.returnBorrowing(copyId);
      }

      setBorrowings(updatedBorrowings);
      await refresh();
      toast.success('Selected copies returned.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to complete the bulk return.');
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
      await refresh();
      toast.success('Borrowing recorded successfully.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to borrow the selected copies.');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="mb-0.5 text-[1.4rem] font-bold text-gray-900">Library: Borrow & Return</h1>
          <p className="text-[13px] text-gray-500">Library / Borrow & Return</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={openBorrowModalBulk} className="reference-primary-button !rounded-xl !bg-[#451483] px-5 py-2.5 text-[14px]">
            <Plus className="h-4 w-4" />
            Borrow Book
          </button>
          <button type="button" onClick={handleBulkReturn} className="reference-outline-button !rounded-xl !border-[#e2daec] !text-gray-700 px-5 py-2.5 text-[14px]">
            <Minus className="h-4 w-4" />
            Return Book
          </button>
        </div>
      </div>

      <div className="showcase-table-card p-5 px-3">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div>
            <h2 className="text-[1.05rem] font-bold text-gray-900">All Circulation</h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row items-center">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or roll"
                className="w-full bg-gray-50/80 border border-gray-100 rounded-lg py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-gray-400"
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-primary">
                <Search className="w-4 h-4 opacity-70" />
              </span>
            </div>
            <button type="button" className="reference-filter-button h-[42px] flex items-center justify-between gap-2 px-3 min-w-[120px] rounded-lg border-gray-100 shadow-sm">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span className="text-[13px] text-gray-600">Last 30 days</span>
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="showcase-table min-w-[980px]">
            <thead>
              <tr>
                <th className="w-12 px-5">
                   <label className="flex items-center cursor-pointer">
                     <div className="h-4 w-4 rounded-[4px] border border-gray-200 bg-white"></div>
                   </label>
                </th>
                <th>Book Title</th>
                <th>Borrower Name</th>
                <th>Id</th>
                <th>Due Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.length > 0 ? pageItems.map((record) => (
                <tr key={record.copyId} className={`transition hover:bg-[#fcfaff] ${record.selected ? 'is-selected' : ''}`}>
                  <td className="w-12 px-5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSelect(record.copyId); }}
                      className={`flex h-4 w-4 items-center justify-center rounded-[4px] transition-colors ${record.selected ? 'bg-[#5218a5] text-white border-transparent' : 'border border-gray-200 bg-transparent text-transparent'}`}
                      aria-label={`Select ${record.copyId}`}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-100 shrink-0">
                        <BookCoverArtwork src={record.book.cover} alt={record.book.title} compact />
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[160px]">{record.book.title}</span>
                    </div>
                  </td>
                  <td className="text-gray-600 truncate max-w-[140px]">{record.borrowerLabel}</td>
                  <td className="text-gray-500">{record.book.bookId}</td>
                  <td className="text-gray-500">{record.dueDate ?? '-'}</td>
                  <td className="text-gray-500">{formatFine(record.fineRwf)}</td>
                  <td>
                    {record.status === 'Available' ? (
                      <button
                        type="button"
                        onClick={() => openBorrowModalSingle(record.copyId)}
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[12px] font-semibold bg-[#491689] text-white transition hover:bg-[#341065]"
                      >
                        Borrow
                      </button>
                    ) : (
                      <span className={`font-semibold text-[13px] ${record.status === 'Overdue' ? 'text-red-500' : 'text-[#20a164]'}`}>
                        {record.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      {record.status !== 'Available' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReturn(record.copyId)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition hover:bg-gray-50"
                            aria-label={`Return ${record.copyId}`}
                          >
                            Return
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setRecordToDelete(record)}
                        className="rounded-md p-1.5 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Delete ${record.copyId}`}
                      >
                        <Trash2 className="h-[15px] w-[15px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-sm text-gray-500">
                    No circulation records match your current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>

      {recordToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="reference-modal">
            <div className="reference-modal-header">
              <Trash2 className="h-5 w-5 text-brand-primary" />
              <h3 className="text-[17px] font-bold text-gray-900">Confirm Deletion</h3>
            </div>

            <div className="reference-modal-body">
              <p className="text-[15px] leading-relaxed text-gray-800">
                Are you sure you want to delete the circulation record for &apos;{recordToDelete.book.title}&apos; assigned to {recordToDelete.borrowerLabel}? This action cannot be undone.
              </p>
            </div>

            <div className="reference-modal-actions">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="flex-1 rounded-lg bg-gray-200 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="reference-primary-button flex-1 justify-center px-6"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isBorrowModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="reference-modal flex max-h-[80vh] max-w-[440px] flex-col">
            <div className="reference-modal-header">
              <Search className="h-5 w-5 text-brand-primary" />
              <h3 className="text-[17px] font-bold text-gray-900">Select Borrower</h3>
            </div>

            <div className="border-b border-gray-100 p-4">
              <label className="reference-search block w-full">
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(event) => setUserSearchTerm(event.target.value)}
                  placeholder="Search borrowers..."
                  autoFocus
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-brand-primary">
                  <Search className="h-4 w-4 opacity-70" />
                </span>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {borrowerChoices.filter((user) => user.label.toLowerCase().includes(userSearchTerm.toLowerCase())).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => confirmBorrow(user.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
                >
                  <InitialAvatar name={user.label} className="h-8 w-8 text-[10px]" />
                  {user.label}
                </button>
              ))}
              {borrowerChoices.filter((user) => user.label.toLowerCase().includes(userSearchTerm.toLowerCase())).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No users found.</p>
              ) : null}
            </div>

            <div className="reference-modal-actions">
              <button
                type="button"
                onClick={() => setIsBorrowModalOpen(false)}
                className="flex-1 rounded-lg bg-gray-200 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages] as const;
}
