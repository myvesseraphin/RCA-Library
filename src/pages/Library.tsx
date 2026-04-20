import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookCoverArtwork } from '../components/ui/BookCoverArtwork';
import { PageLoader } from '../components/ui/PageLoader';
import type { SeedBook } from '../lib/seed';
import { api } from '../lib/api';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';

const PAGE_SIZE = 8;

export function Library() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotifications();
  const [books, setBooks] = useState<SeedBook[]>([]);
  const [recordToDelete, setRecordToDelete] = useState<SeedBook | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.getBooks()
      .then((items) => {
        if (active) {
          setBooks(items);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : 'Unable to load books.');
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

  const filteredBooks = useMemo(() => books.filter((book) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      book.title,
      book.writer,
      book.bookId,
      book.subject,
      book.className,
    ].some((value) => value.toLowerCase().includes(query));
  }), [books, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const visibleBooks = filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      await api.deleteBook(recordToDelete.id);
      setBooks((current) => current.filter((book) => book.id !== recordToDelete.id));
      setRecordToDelete(null);
      await refresh();
      toast.success('Book removed from the catalog.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to delete that book.');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-sm text-gray-500">Library / Books Catalog</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/library/new/edit')}
          className="reference-outline-button"
        >
          <Plus className="h-5 w-5" />
          Add book
        </button>
      </div>

      <div className="showcase-table-card p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[1.1rem] font-bold text-gray-900">All Books</h2>
            <p className="mt-1 text-sm text-gray-500">{filteredBooks.length} book{filteredBooks.length === 1 ? '' : 's'} in the catalog</p>
          </div>
          <label className="showcase-input min-w-[280px] px-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, author, subject..."
            />
            <Search className="showcase-input-icon h-4 w-4" />
          </label>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="showcase-table min-w-[860px]">
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Writer</th>
                <th>Id</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Publish Date</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleBooks.length > 0 ? visibleBooks.map((book) => (
                <tr
                  key={book.id}
                  onClick={() => navigate(`/library/${book.id}/details`)}
                  className="cursor-pointer"
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50 shadow-sm">
                        <BookCoverArtwork src={book.cover} alt={book.title} compact />
                      </div>
                      <span className="font-semibold text-gray-900">{book.title}</span>
                    </div>
                  </td>
                  <td className="font-medium text-gray-700">{book.writer}</td>
                  <td className="font-semibold text-gray-800">{book.bookId}</td>
                  <td>{book.subject}</td>
                  <td className="font-medium text-gray-700">{book.className}</td>
                  <td>{book.publishDate || '-'}</td>
                  <td>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/library/${book.id}/edit`);
                        }}
                        className="rounded-md p-1.5 transition hover:bg-brand-secondary hover:text-brand-primary"
                        aria-label={`Edit ${book.title}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setRecordToDelete(book);
                        }}
                        className="rounded-md p-1.5 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Delete ${book.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-500">
                    No books match your current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-[#f3edf8] pt-4 text-sm text-[#6f647d] sm:flex-row">
          <div className="showcase-pagination">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="showcase-page-button"
              aria-label="Previous page"
            >
              <ChevronLeft className="mx-auto h-4 w-4" />
            </button>
            {getVisiblePages(page, totalPages).map((item, index) => item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-base">…</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`showcase-page-button ${item === page ? 'is-active' : ''}`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="showcase-page-button"
              aria-label="Next page"
            >
              <ChevronRight className="mx-auto h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span>{filteredBooks.length} records</span>
            <div className="showcase-input h-auto min-h-0 w-auto gap-2 px-3 py-1.5">
              <span className="showcase-input-value text-sm">{PAGE_SIZE} / page</span>
            </div>
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
                Are you sure you want to delete the library record for &apos;{recordToDelete.title}&apos; by {recordToDelete.writer} ({recordToDelete.bookId})? This action cannot be undone.
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
