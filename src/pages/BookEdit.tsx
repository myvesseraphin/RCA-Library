import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, ChevronDown } from 'lucide-react';

export function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Book Information</h1>
        <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">Edit Book Information</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Cover Upload & Summary Edit</h2>
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image Upload Area */}
            <div className="relative w-40 sm:w-48 shrink-0 rounded-lg overflow-hidden border border-gray-200 group h-[260px] sm:h-[320px]">
              <img 
                src={`https://picsum.photos/seed/physicsbook${id || 1}/240/320`} 
                alt="Book Cover" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors border border-white/30">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <button className="text-sm font-medium hover:underline mb-1">+ Upload New Cover</button>
                <button className="text-xs hover:underline decoration-white/50 text-white/80">Remove Cover</button>
              </div>
            </div>

            {/* Text Fields Area */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Title</label>
                <input 
                  type="text" 
                  defaultValue="Modern Physics Moder" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-300 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Subtitle</label>
                <input 
                  type="text" 
                  defaultValue="A modern physics story" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-300 transition-colors" 
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Synopsis/summary</label>
                <div className="relative flex-1">
                  <textarea 
                    defaultValue="Modern Physics Modern Textbook 1st Edition. A comprehensive look at the field on physics racced, physics electumio: naries, and the motton modern modern physics."
                    className="w-full h-full min-h-[140px] border-2 border-[#6B31B2] rounded-lg px-3 py-3 pl-4 pr-9 text-sm focus:outline-none resize-none text-gray-800 font-medium"
                    style={{ lineHeight: '1.5' }}
                  />
                  <Edit2 className="w-4 h-4 text-[#6B31B2] absolute top-3 right-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Details Form</h2>

          <div className="grid grid-cols-[130px_1fr] items-center gap-y-3.5 text-sm">
            <label className="font-medium text-gray-900">Subject</label>
            <input type="text" defaultValue="Physics" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Author(s)</label>
            <input type="text" defaultValue="Jacob Jones" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Library ID</label>
            <div className="bg-gray-100 border border-gray-200 text-gray-500 rounded-md px-3 py-1.5 font-medium cursor-not-allowed">
              #0018
            </div>

            <div className="flex items-center justify-between font-medium text-gray-900 pr-3">
              Dewey Decimal <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <input type="text" defaultValue="530.1" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Publication Date</label>
            <input type="text" defaultValue="23 Oct, 2023" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Publisher</label>
            <input type="text" defaultValue="Academica Press" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Language</label>
            <input type="text" defaultValue="English" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Pages</label>
            <input type="number" defaultValue={450} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <div className="flex items-center justify-between font-medium text-gray-900 pr-3">
              ISBN-13 <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <input type="text" defaultValue="978-3-16-148410--" className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Total Copies</label>
            <input type="number" defaultValue={5} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <div className="flex items-center justify-between font-medium text-gray-900 self-start mt-2 pr-3">
              Available Copies <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="relative mt-2">
                <select className="appearance-none w-full border border-gray-800 font-medium text-gray-900 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary pr-8 bg-white cursor-pointer hover:border-gray-900 transition-colors">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              
              <div className="mt-1 flex flex-col items-end">
                <p className="text-[11px] text-gray-500 mb-2 self-start">Copies are managed individually below...</p>
                <div className="bg-white border rounded shadow-sm py-2 px-3 w-48 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-800">Copy #0018-01</span>
                    <div className="relative">
                      <select className="appearance-none text-[11px] border border-gray-200 rounded px-2 pr-5 py-0.5 bg-white cursor-pointer focus:outline-none hover:border-gray-300">
                        <option>Check in</option>
                        <option>Check out</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-gray-800">Copy #0018-02...</span>
                    <div className="relative">
                       <select className="appearance-none text-[11px] border border-gray-200 rounded px-2 pr-5 py-0.5 bg-white cursor-pointer focus:outline-none hover:border-gray-300 text-gray-400">
                        <option>in/out</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Spacer for bottom layout */}
            <div className="col-span-2 mt-4 flex justify-end gap-3 pt-6 border-t border-transparent">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-[#6B31B2] text-white font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
              >
                Save Changes
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-[#E2DFE9] text-[#4A4A4A] font-medium rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
