import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type BookDetailsData } from '../lib/api';

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookData, setBookData] = useState<BookDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    api.getBook(id)
      .then((data) => {
        if (active) {
          setBookData(data);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load book information.');
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (!bookData) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Book Information</h1>
        <p className="text-sm text-gray-500">{error ?? 'Loading book information...'}</p>
      </div>
    );
  }

  const { book, availableCopies, currentBorrowers, historyPreview } = bookData;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Information</h1>
        <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Book Information</span></p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-8 mb-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Cover & Summary</h2>
          <div className="flex flex-col sm:flex-row gap-8">
            <img
              src={book.detailCover || book.cover}
              alt={book.title}
              className="rounded-lg shadow-md border border-gray-100 object-cover w-40 sm:w-48 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.subtitle}</p>
              </div>
              <p className="text-gray-800 font-medium text-sm leading-relaxed">{book.summary}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Details</h2>

          <div className="flex-1">
            <div className="grid grid-cols-[auto_1fr] gap-x-12 gap-y-4 text-sm">
              <div className="font-medium text-gray-800">Subject</div>
              <div className="text-gray-700">{book.subject}</div>

              <div className="font-medium text-gray-800">Author(s)</div>
              <div className="text-gray-700">{book.writer}</div>

              <div className="font-medium text-gray-800">Library ID</div>
              <div className="text-gray-700">{book.bookId}</div>

              <div className="font-medium text-gray-800">Dewey Decimal</div>
              <div className="text-gray-700">{book.deweyDecimal}</div>

              <div className="font-medium text-gray-800">Publication Date</div>
              <div className="text-gray-700">{book.publishDate}</div>

              <div className="font-medium text-gray-800">Publisher</div>
              <div className="text-gray-700">{book.publisher}</div>

              <div className="font-medium text-gray-800">Language</div>
              <div className="text-gray-700">{book.language}</div>

              <div className="font-medium text-gray-800">Pages</div>
              <div className="text-gray-700">{book.pages}</div>

              <div className="font-medium text-gray-800">ISBN-13</div>
              <div className="text-gray-700">{book.isbn13}</div>

              <div className="font-medium text-gray-800">Total Copies</div>
              <div className="text-gray-700">{book.totalCopies}</div>

              <div className="font-medium text-gray-800">Available Copies</div>
              <div className="text-gray-700">
                {availableCopies}
                {currentBorrowers.length > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({currentBorrowers[0].borrower} currently has {currentBorrowers[0].copyId})
                  </span>
                )}
              </div>

              <div className="font-medium text-gray-800 whitespace-nowrap">Book History (Recent Loans)</div>
              <div className="text-gray-700">
                {historyPreview.length > 0
                  ? historyPreview.map((entry) => `${entry.copyId} - ${entry.borrower} - ${entry.status}`).join(', ')
                  : 'No loan history yet.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <button
          onClick={() => navigate(`/library/${id}/edit`)}
          className="px-8 py-2.5 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm shadow-brand-primary/20"
        >
          Edit
        </button>
        <button
          onClick={() => navigate(`/library/${id}/history`)}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          View History
        </button>
      </div>
    </div>
  );
}
