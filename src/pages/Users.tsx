import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2, ChevronDown, MoreHorizontal } from 'lucide-react';
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
          <div className="flex items-center gap-3 w-full sm:w-auto">
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
            <button className="flex items-center gap-2 border border-gray-100 text-gray-600 bg-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
              Last 30 days
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="showcase-table min-w-[860px]">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="font-semibold text-gray-700 bg-white px-5">
                   <label className="flex items-center cursor-pointer">
                     <div className="h-4 w-4 rounded-[4px] border border-gray-200 bg-white"></div>
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
              {visibleUsers.length > 0 ? visibleUsers.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => navigate(`/users/${student.id}/profile`)}
                  className="cursor-pointer transition hover:bg-[#fcfaff]"
                >
                  <td className="w-12 px-5">
                    <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                         <div className="h-4 w-4 rounded-[4px] border border-gray-200 bg-transparent"></div>
                    </label>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{student.roll}</td>
                  <td className="text-gray-500">{student.studentId}</td>
                  <td className="text-gray-500">{student.className}</td>
                  <td className="text-gray-500">{student.primaryEmail || '-'}</td>
                  <td className="text-gray-500">{student.primaryPhone || '-'}</td>
                  <td>
                    <div className="flex items-center justify-center gap-4 text-[#8f829f]">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setRecordToDelete(student);
                        }}
                        className="hover:text-red-600 transition"
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="h-[15px] w-[15px]" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/users/${student.id}/details`);
                        }}
                        className="hover:text-[#5218a5] transition"
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit3 className="h-[15px] w-[15px]" />
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

        <div className="p-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-1 mx-auto text-sm">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getVisiblePages(page, totalPages).map((item, index) => item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-400"><MoreHorizontal className="w-4 h-4" /></span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors ${item === page ? 'text-white bg-brand-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
             <button className="flex items-center gap-2 border border-gray-100 text-gray-600 bg-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              {PAGE_SIZE} / page
              <ChevronDown className="w-4 h-4" />
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
