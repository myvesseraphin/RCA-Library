import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Information</h1>
        <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Book Information</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
        {/* Left Card: Cover & Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-8 mb-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Cover & Summary</h2>
          <div className="flex flex-col sm:flex-row gap-8">
            <img 
              src={`https://picsum.photos/seed/physicsbook${id || 1}/240/320`} 
              alt="Book Cover" 
              className="rounded-lg shadow-md border border-gray-100 object-cover w-40 sm:w-48 shrink-0" 
              referrerPolicy="no-referrer"
            />
            <p className="text-gray-800 font-medium text-sm leading-relaxed mt-2 sm:mt-0">
              Synopsys/summary modern physics story moderntan placed, physics electum:onaries, and the motion modern physics.
            </p>
          </div>
        </div>

        {/* Right Card: Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Details</h2>

          <div className="flex-1">
            <div className="grid grid-cols-[auto_1fr] gap-x-12 gap-y-4 text-sm">
              <div className="font-medium text-gray-800">Subject</div>
              <div className="text-gray-700">Physics</div>

              <div className="font-medium text-gray-800">Author(s)</div>
              <div className="text-gray-700">Jacob Jones</div>

              <div className="font-medium text-gray-800">Library ID</div>
              <div className="text-gray-700">#0018</div>

              <div className="font-medium text-gray-800">Dewey Decimal</div>
              <div className="text-gray-700">530.1</div>

              <div className="font-medium text-gray-800">Publication Date</div>
              <div className="text-gray-700">23 Oct, 2023</div>

              <div className="font-medium text-gray-800">Publisher</div>
              <div className="text-gray-700">Academica Press</div>

              <div className="font-medium text-gray-800">Language</div>
              <div className="text-gray-700">English</div>

              <div className="font-medium text-gray-800">Pages</div>
              <div className="text-gray-700">450</div>

              <div className="font-medium text-gray-800">ISBN-13</div>
              <div className="text-gray-700">978-3-16-148410-0</div>

              <div className="font-medium text-gray-800">Total Copies</div>
              <div className="text-gray-700">5</div>

              <div className="font-medium text-gray-800">Available Copies</div>
              <div className="text-gray-700">1 (borrowed by Sarah Jones)</div>

              <div className="font-medium text-gray-800 whitespace-nowrap">Book History (Recent Loans):</div>
              <div className="text-gray-700">...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
