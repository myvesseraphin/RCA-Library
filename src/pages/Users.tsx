import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { PageLoader } from '../components/ui/PageLoader';
import type { SeedUser } from '../lib/seed';
import { api } from '../lib/api';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';

const PAGE_SIZE = 8;

export function Users() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotifications();
  const [users, setUsers] = useState<SeedUser[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<SeedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.getUsers()
      .then((items) => {
        if (active) {
          setUsers(items);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : 'Unable to load users.');
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

  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      user.name,
      user.roll,
      user.studentId,
      user.className,
      user.primaryEmail,
      user.primaryPhone,
    ].some((value) => value.toLowerCase().includes(query));
  }), [searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const confirmDelete = async () => {
    if (!recordToDelete) {
      return;
    }

    try {
      await api.deleteUser(recordToDelete.id);
      setUsers((current) => current.filter((user) => user.id !== recordToDelete.id));
      setRecordToDelete(null);
      await refresh();
      toast.success('Borrower deleted.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to delete that user.');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="mb-0.5 text-[1.4rem] font-bold text-gray-900">Users List</h1>
          <p className="text-[13px] text-gray-500">Home / Users</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/users/new')}
          className="reference-outline-button !rounded-xl !border-[#d2bbef] !text-[#7c2fd0] hover:!bg-[#fcfaff] px-4 py-2 text-[14px]"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="showcase-table-card p-5">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div>
            <h2 className="text-[1.05rem] font-bold text-gray-900">Users Information</h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="showcase-input min-w-[280px] px-3 h-[42px] bg-white border-gray-100 shadow-sm rounded-lg">
               <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or roll"
                className="text-[13px] bg-transparent"
              />
              <Search className="showcase-input-icon h-[18px] w-[18px] text-gray-400" />
            </label>
            <button type="button" className="reference-filter-button h-[42px] flex items-center justify-between gap-2 px-3 min-w-[120px] rounded-lg border-gray-100 shadow-sm">
              <span className="text-[13px] text-gray-600">Last 30 days</span>
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="showcase-table min-w-[860px]">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="font-semibold text-gray-700 bg-white">
                   <label className="flex items-center cursor-pointer">
                     <input type="checkbox" className="rounded border-gray-300 text-[#7c2fd0] focus:ring-[#7c2fd0]" disabled />
                   </label>
                </th>
                <th className="font-semibold text-gray-700 bg-white">User Name</th>
                <th className="font-semibold text-gray-700 bg-white">Roll</th>
                <th className="font-semibold text-gray-700 bg-white">Student ID</th>
                <th className="font-semibold text-gray-700 bg-white">Class</th>
                <th className="font-semibold text-gray-700 bg-white">Email</th>
                <th className="font-semibold text-gray-700 bg-white">Phone</th>
                <th className="text-center font-semibold text-gray-700 bg-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleUsers.length > 0 ? visibleUsers.map((student, idx) => (
                <tr
                  key={student.id}
                  onClick={() => navigate(`/users/${student.id}/profile`)}
                  className={`cursor-pointer transition hover:bg-[#fcfaff] ${idx === 2 ? 'is-selected' : ''}`}
                >
                  <td className="w-12">
                    <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                       <input type="checkbox" className="rounded border-gray-300 text-[#7c2fd0] focus:ring-[#7c2fd0]" defaultChecked={idx === 2} />
                    </label>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <InitialAvatar name={student.name} className="h-[30px] w-[30px] text-[11px]" />
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{student.roll}</td>
                  <td className="text-gray-500">{student.studentId}</td>
                  <td className="text-gray-500">{student.className}</td>
                  <td className="text-gray-500">{student.primaryEmail || '-'}</td>
                  <td className="text-gray-500">{student.primaryPhone || '-'}</td>
                  <td>
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setRecordToDelete(student);
                        }}
                        className="p-1 hover:text-gray-600 transition"
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/users/${student.id}/details`);
                        }}
                        className="p-1 hover:text-gray-600 transition"
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-500">
                    No borrowers match your current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-4 pt-4 text-sm text-[#6f647d] sm:flex-row px-2 pb-2">
          <div className="flex-1"></div>
          
           <div className="showcase-pagination flex-1 justify-center">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="showcase-page-button hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft className="mx-auto h-4 w-4 text-gray-400" />
            </button>
            {getVisiblePages(page, totalPages).map((item, index) => item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-base">…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`showcase-page-button !h-7 !min-w-7 ${item === page ? '!bg-[#7c2fd0] !text-white !rounded-md !shadow-none' : 'hover:!bg-gray-50'}`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="showcase-page-button hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight className="mx-auto h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center justify-end flex-1 gap-3 text-[13px]">
            <button type="button" className="reference-filter-button h-[36px] flex items-center justify-between gap-2 px-3 min-w-[90px] rounded-lg border border-gray-100 shadow-sm bg-white">
              <span className="text-[13px] text-gray-600">{PAGE_SIZE} / page</span>
              <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
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
                Are you sure you want to delete the borrower record for &apos;{recordToDelete.name}&apos; ({recordToDelete.className})? This action cannot be undone.
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
    </div>
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
