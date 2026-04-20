import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, UploadCloud } from 'lucide-react';
import { api, type BookMutationPayload } from '../lib/api';

type BookFormData = BookMutationPayload;

function createEmptyForm(): BookFormData {
  return {
    title: '',
    subtitle: '',
    subject: '',
    writer: '',
    bookId: '',
    deweyDecimal: '',
    publishDate: '',
    publisher: '',
    language: '',
    pages: 0,
    isbn13: '',
    totalCopies: 1,
    className: '',
    cover: '/logo.png',
    detailCover: '/logo.png',
    summary: '',
  };
}

export function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = !id;
  const [formData, setFormData] = useState<BookFormData>(createEmptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      setFormData(createEmptyForm());
      setError(null);
      return;
    }

    let active = true;

    api.getBook(id)
      .then((data) => {
        if (!active) {
          return;
        }

        setFormData({
          title: data.book.title,
          subtitle: data.book.subtitle,
          subject: data.book.subject,
          writer: data.book.writer,
          bookId: data.book.bookId,
          deweyDecimal: data.book.deweyDecimal,
          publishDate: data.book.publishDate,
          publisher: data.book.publisher,
          language: data.book.language,
          pages: data.book.pages,
          isbn13: data.book.isbn13,
          totalCopies: data.book.totalCopies,
          className: data.book.className,
          cover: data.book.cover,
          detailCover: data.book.detailCover,
          summary: data.book.summary,
        });
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load this book.');
        }
      });

    return () => {
      active = false;
    };
  }, [id, isCreateMode]);

  const handleChange = (field: keyof BookFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingCover(true);
      setError(null);

      const uploadedCover = await api.uploadBookCover(file);

      setFormData((prev) => ({
        ...prev,
        cover: uploadedCover.publicUrl,
        detailCover: uploadedCover.publicUrl,
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to upload the selected cover image.');
    } finally {
      setIsUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    try {
      if (isCreateMode) {
        const createdBook = await api.createBook(formData);
        navigate(`/library/${createdBook.book.id}/details`, { replace: true });
        return;
      }

      await api.updateBook(id, formData);
      navigate(`/library/${id}/details`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : isCreateMode ? 'Unable to create this book.' : 'Unable to save this book.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{isCreateMode ? 'Add New Book' : 'Edit Book Information'}</h1>
        <p className="text-gray-500 text-sm">Library <span className="mx-1">/</span> <span className="font-medium text-gray-700">{isCreateMode ? 'Add New Book' : 'Edit Book Information'}</span></p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">{isCreateMode ? 'Book Cover & Summary' : 'Book Cover Upload & Summary Edit'}</h2>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-40 sm:w-48 shrink-0 rounded-lg overflow-hidden border border-gray-200 h-[260px] sm:h-[320px]">
              <img
                src={formData.detailCover || formData.cover}
                alt={formData.title || 'Book Cover'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Book Cover</label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brand-primary/40 bg-brand-secondary/40 px-4 py-3 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-secondary">
                  <UploadCloud className="w-4 h-4" />
                  {isUploadingCover ? 'Uploading cover...' : 'Upload cover image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleCoverUpload}
                    disabled={isUploadingCover}
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500 break-all">
                  {formData.cover && formData.cover !== '/logo.png'
                    ? `Saved in bucket: ${formData.cover}`
                    : 'No uploaded cover yet. Choose an image to save it to Supabase Storage.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-300 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:border-gray-300 transition-colors"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Synopsis/summary</label>
                <div className="relative flex-1">
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    className="w-full h-full min-h-[160px] border-2 border-[#6B31B2] rounded-lg px-3 py-3 pl-4 pr-9 text-sm focus:outline-none resize-none text-gray-800 font-medium"
                    style={{ lineHeight: '1.5' }}
                  />
                  <Edit2 className="w-4 h-4 text-[#6B31B2] absolute top-3 right-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Book Details Form</h2>

          <div className="grid grid-cols-[130px_1fr] items-center gap-y-3.5 text-sm">
            <label className="font-medium text-gray-900">Subject</label>
            <input type="text" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Author(s)</label>
            <input type="text" value={formData.writer} onChange={(e) => handleChange('writer', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Library ID</label>
            <div className="bg-gray-100 border border-gray-200 text-gray-500 rounded-md px-3 py-1.5 font-medium">
              {isCreateMode ? 'Generated automatically on save' : formData.bookId}
            </div>

            <label className="font-medium text-gray-900">Class</label>
            <input type="text" value={formData.className} onChange={(e) => handleChange('className', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <div className="flex items-center justify-between font-medium text-gray-900 pr-3">
              Dewey Decimal <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <input type="text" value={formData.deweyDecimal} onChange={(e) => handleChange('deweyDecimal', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Publication Date</label>
            <input type="text" value={formData.publishDate} onChange={(e) => handleChange('publishDate', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Publisher</label>
            <input type="text" value={formData.publisher} onChange={(e) => handleChange('publisher', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Language</label>
            <input type="text" value={formData.language} onChange={(e) => handleChange('language', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Pages</label>
            <input type="number" value={formData.pages} onChange={(e) => handleChange('pages', Number(e.target.value))} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <div className="flex items-center justify-between font-medium text-gray-900 pr-3">
              ISBN-13 <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <input type="text" value={formData.isbn13} onChange={(e) => handleChange('isbn13', e.target.value)} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />

            <label className="font-medium text-gray-900">Total Copies</label>
            <input type="number" value={formData.totalCopies} onChange={(e) => handleChange('totalCopies', Number(e.target.value))} className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-primary hover:border-gray-300 transition-colors" />
            <div className="col-span-2 mt-4 flex justify-end gap-3 pt-6 border-t border-transparent">
              <button
                onClick={handleSave}
                disabled={isUploadingCover}
                className="px-6 py-2 bg-[#6B31B2] text-white font-medium rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
              >
                {isCreateMode ? 'Create Book' : 'Save Changes'}
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
