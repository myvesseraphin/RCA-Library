import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookCoverArtwork } from '../components/ui/BookCoverArtwork';
import { PageLoader } from '../components/ui/PageLoader';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { api, type BookDetailsData, type UserProfileData } from '../lib/api';
import { useToast } from '../lib/toast';

const PAGE_SIZE = 10;

export function BookHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookData, setBookData] = useState<BookDetailsData | null>(null);
  const [historyData, setHistoryData] = useState<UserProfileData['borrowHistory']>([]);
  const [copyFilter, setCopyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    setIsLoading(true);

    Promise.all([api.getBook(id), api.getBookHistory(id)])
      .then(([book, history]) => {
        if (active) {
          setBookData(book);
          setHistoryData(history);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : 'Unable to load book history.');
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
  }, [id, toast]);

  const filteredHistory = useMemo(() => historyData.filter((entry) => {
    if (copyFilter !== 'all' && entry.copyId !== copyFilter) {
      return false;
    }

    if (statusFilter !== 'all' && entry.status !== statusFilter) {
      return false;
    }

    return true;
  }), [copyFilter, historyData, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const visibleRows = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [copyFilter, statusFilter]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!bookData) {
    return null;
  }

  const { book } = bookData;
  const copyIds = Array.from(new Set(historyData.map((entry) => entry.copyId)));
  const dateLabel = getDateRangeLabel(historyData);

  return (
    <div className="page-shell">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Book Loan History</h1>
        <p className="text-sm text-gray-500">Library / Book Loan History</p>
      </div>

      <div className="showcase-card p-0 overflow-hidden border-[#f1ebf8] mb-8">
        <div className="flex flex-col gap-4 border-b border-[#f1ebf8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="flex h-[76px] w-[52px] items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-100 shadow-sm shrink-0">
              <BookCoverArtwork src={book.cover} alt={book.title} compact />
            </div>
            <div>
              <h2 className="text-[1.35rem] font-bold leading-none text-gray-900 mb-2">{book.title}</h2>
              <p className="text-[13px] font-medium text-gray-500">Library ID {book.bookId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="reference-outline-button !rounded-lg !border-[#491689] !text-[#491689] px-4 py-1.5 text-[13px] hover:!bg-[#fcfaff]"
          >
            Back to Details
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 border-b border-[#f1ebf8] px-6 py-5 md:grid-cols-3 bg-white">
          <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-gray-900">Copy Selection</span>
            <div className="showcase-input px-3 h-[42px] bg-white border border-gray-200 shadow-sm rounded-lg text-[13px]">
              <select value={copyFilter} onChange={(event) => setCopyFilter(event.target.value)} className="w-full text-gray-600 outline-none">
                <option value="all">Copy #0018-A</option>
                {copyIds.map((copyId) => (
                  <option key={copyId} value={copyId}>{copyId}</option>
                ))}
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-gray-900">Status</span>
            <div className="showcase-input px-3 h-[42px] bg-white border border-gray-200 shadow-sm rounded-lg text-[13px]">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full text-gray-600 outline-none">
                <option value="all">Borrowed</option>
                <option value="Borrowed">Borrowed</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </label>

          <div>
            <span className="mb-2 block text-[13px] font-bold text-gray-900">Date</span>
            <div className="showcase-input px-3 h-[42px] bg-white border border-gray-200 shadow-sm rounded-lg w-full flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 text-gray-500">
                <CalendarDays className="h-4 w-4" />
                <span className="text-[13px]">{dateLabel}</span>
              </div>
              <CalendarDays className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f1ebf8] bg-[#fdfcff] text-[#3a3145]">
                <th className="px-6 py-4 font-bold">Copy Id</th>
                <th className="px-6 py-4 font-bold">Borrower Name</th>
                <th className="px-6 py-4 font-bold">Id/Roll</th>
                <th className="px-6 py-4 font-bold">Loan Date</th>
                <th className="px-6 py-4 font-bold">Due Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1ebf8]">
              {visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-[#fdfaff]">
                  <td className="px-6 py-4 font-bold text-gray-800">{row.copyId}</td>
                  <td className="px-6 py-4 text-gray-600">{row.borrower}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{row.roll}</td>
                  <td className="px-6 py-4 text-gray-600">{row.loanDate || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{row.dueDate || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className={`px-2 py-[3px] rounded items-center text-[11px] font-bold leading-none ${row.status === 'Borrowed' ? 'bg-[#e2fceb] text-[#2ebd60]' : 'bg-[#f4f2f6] text-[#9181a4]'}`}>
                      {row.status}
                    </span>
                    {row.status === 'Borrowed' && <InitialAvatar name={row.borrower} className="h-5 w-5 text-[8px] inline-flex ml-2 rounded-full" />}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col gap-[3px] text-[12px] font-medium text-[#7c2fd0]">
                      <button
                        type="button"
                        onClick={() => {
                          if (!row.borrowerId) {
                            toast.info('This record is no longer linked to an active borrower.');
                            return;
                          }
                          navigate(`/users/${row.borrowerId}/profile`);
                        }}
                        className="text-left py-1 hover:text-[#6522b9]"
                      >
                        Print Record
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!row.borrowerEmail) {
                            toast.info('This borrower does not have an email address yet.');
                            return;
                          }
                          window.location.href = `mailto:${row.borrowerEmail}`;
                        }}
                        className="text-left py-1 hover:text-[#6522b9]"
                      >
                        Email Borrower
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No history matches the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-end gap-3 px-6 py-4 border-t border-[#f1ebf8] text-[13px] text-gray-700 sm:flex-row">
          <div className="flex items-center gap-3 mr-auto"></div>
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <div className="flex h-8 items-center gap-2 rounded border border-gray-200 px-2 bg-white">
              <span className="font-semibold">{PAGE_SIZE}</span>
              <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-6">
            <span className="font-semibold text-gray-900">Page {page}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="flex items-center justify-center p-1 text-gray-500 hover:text-gray-900 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center p-1 text-gray-500 hover:text-gray-900 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDateRangeLabel(rows: UserProfileData['borrowHistory']) {
  const values = rows.map((row) => row.loanDate).filter(Boolean) as string[];

  if (values.length === 0) {
    return 'All dates';
  }

  if (values.length === 1) {
    return values[0];
  }

  return `${values.at(-1)} - ${values[0]}`;
}
