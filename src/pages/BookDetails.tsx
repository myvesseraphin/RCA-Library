import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookCoverArtwork } from '../components/ui/BookCoverArtwork';
import { PageLoader } from '../components/ui/PageLoader';
import { api, type BookDetailsData } from '../lib/api';
import { useToast } from '../lib/toast';

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookData, setBookData] = useState<BookDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    setIsLoading(true);

    api.getBook(id)
      .then((data) => {
        if (active) {
          setBookData(data);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : 'Unable to load book information.');
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

  const availableCopiesLabel = useMemo(() => {
    if (!bookData) {
      return '-';
    }

    if (bookData.currentBorrowers.length === 0) {
      return `${bookData.availableCopies}`;
    }

    const firstBorrower = bookData.currentBorrowers[0]?.borrower;
    return `${bookData.availableCopies} (borrowed by ${firstBorrower})`;
  }, [bookData]);

  const historyLabel = useMemo(() => {
    if (!bookData || bookData.historyPreview.length === 0) {
      return '...';
    }

    return bookData.historyPreview.map((entry) => entry.borrower).slice(0, 2).join(', ');
  }, [bookData]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!bookData) {
    return null;
  }

  const { book } = bookData;

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="mb-0.5 text-[1.4rem] font-bold text-gray-900">Book Information</h1>
          <p className="text-[13px] text-gray-500">Library / Book Information</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/library/${id}/edit`)}
            className="reference-primary-button !rounded-xl !bg-[#451483] px-6 py-2 text-[14px]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => navigate(`/library/${id}/history`)}
            className="reference-outline-button !rounded-xl !border-[#e2daec] !text-gray-700 px-6 py-2 text-[14px]"
          >
            View History
          </button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="showcase-card px-8 py-6">
          <h2 className="mb-8 text-[17px] font-bold text-gray-900">Book Cover &amp; Summary</h2>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center sm:items-start shrink-0">
              <div className="h-[280px] w-[180px] overflow-hidden rounded-lg border border-gray-200">
                <BookCoverArtwork src={book.detailCover || book.cover} alt={book.title} />
              </div>
              <div className="mt-4 text-center sm:text-left">
                <h3 className="text-[16px] font-bold text-gray-900">{book.title}</h3>
                <p className="text-[13px] text-gray-500 mt-1">Library ID {book.bookId}</p>
              </div>
            </div>
            
            <div className="flex-1">
              <span className="mb-2 block text-[13px] font-medium text-[#998baf]">Synopsis/summary</span>
              <div className="min-h-[160px] w-full rounded-lg border border-[#e2daec] bg-[#fcfaff] p-4 text-[13px] leading-6 text-gray-700">
                {book.summary || 'No summary has been added for this title yet.'}
              </div>
            </div>
          </div>
        </section>

        <section className="showcase-card px-8 py-6">
          <h2 className="mb-6 text-[17px] font-bold text-gray-900">Book Details Form</h2>
          <div className="grid grid-cols-[140px_1fr] gap-y-4 text-[15px]">
            <DetailRow label="Subject" value={book.subject} />
            <DetailRow label="Author(s)" value={book.writer} />
            <DetailRow label="Library ID" value={book.bookId} />
            <DetailRow label="Dewey Decimal" value={book.deweyDecimal || '-'} />
            <DetailRow label="Publication Date" value={book.publishDate || '-'} />
            <DetailRow label="Publisher" value={book.publisher || '-'} />
            <DetailRow label="Language" value={book.language || '-'} />
            <DetailRow label="Pages" value={String(book.pages || 0)} />
            <DetailRow label="ISBN-13" value={book.isbn13 || '-'} />
            <DetailRow label="Total Copies" value={String(book.totalCopies)} />
            <DetailRow label="Available Copies" value={availableCopiesLabel} />
            <DetailRow label="Book History (Recent Loans)" value={historyLabel} />
          </div>
        </section>
      </div>

    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="text-[12px] font-medium text-[#998baf] flex items-center">{label}</div>
      <div className="text-[13px] font-semibold text-[#251f30]">{value}</div>
    </>
  );
}
