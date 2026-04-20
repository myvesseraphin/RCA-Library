import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type BookMutationPayload } from '../lib/api';
import { BookCoverArtwork } from '../components/ui/BookCoverArtwork';
import { PageLoader } from '../components/ui/PageLoader';
import { Spinner } from '../components/ui/Spinner';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';
import { toDateInputValue } from '../lib/utils';

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
    cover: '',
    detailCover: '',
    summary: '',
  };
}

export function BookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotifications();
  const isCreateMode = !id;
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [formData, setFormData] = useState<BookFormData>(createEmptyForm);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      setFormData(createEmptyForm());
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

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
          publishDate: toDateInputValue(data.book.publishDate),
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
      })
      .catch((reason: unknown) => {
        toast.error(reason instanceof Error ? reason.message : 'Unable to load this book.');
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, isCreateMode, toast]);

  const handleChange = (field: keyof BookFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingCover(true);
      const uploadedCover = await api.uploadBookCover(file);

      setFormData((prev) => ({
        ...prev,
        cover: uploadedCover.publicUrl,
        detailCover: uploadedCover.publicUrl,
      }));

      toast.success('Cover image uploaded.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to upload the selected cover image.');
    } finally {
      setIsUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (isCreateMode) {
        const createdBook = await api.createBook(formData);
        await refresh();
        toast.success('Book created successfully.');
        navigate(`/library/${createdBook.book.id}/details`, { replace: true });
        return;
      }

      await api.updateBook(id, formData);
      await refresh();
      toast.success('Book saved successfully.');
      navigate(`/library/${id}/details`);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : isCreateMode ? 'Unable to create this book.' : 'Unable to save this book.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell">
      <div className="mb-2">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{isCreateMode ? 'Add Book Information' : 'Edit Book Information'}</h1>
        <p className="text-sm text-gray-500">
          {isCreateMode ? 'Create a new catalog record.' : 'Update the cover, summary, and details for this title.'}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <section className="reference-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Book Cover Upload &amp; Summary Edit</h2>

          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="relative h-[260px] w-40 shrink-0 overflow-hidden rounded-lg border border-gray-200 sm:h-[320px] sm:w-48">
              <BookCoverArtwork src={formData.detailCover || formData.cover} alt={formData.title || 'Book cover'} />
              <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/50 p-4 text-white">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30">
                  {isUploadingCover ? <Spinner className="h-6 w-6 border-2 border-white/30 border-t-white" /> : <Plus className="h-6 w-6" />}
                </div>
                <span className="mb-1 text-sm font-medium">{isUploadingCover ? 'Uploading cover...' : '+ Upload New Cover'}</span>
                <span className="text-xs text-white/80">Replace the current book image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                />
              </label>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <InputField label="Title" value={formData.title} onChange={(value) => handleChange('title', value)} />
              <InputField label="Subtitle" value={formData.subtitle} onChange={(value) => handleChange('subtitle', value)} />

              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-gray-900">Synopsis/summary</label>
                <div className="relative">
                  <textarea
                    value={formData.summary}
                    onChange={(event) => handleChange('summary', event.target.value)}
                    className="min-h-[180px] w-full resize-none rounded-lg border-2 border-[#6B31B2] px-4 py-3 pr-9 text-sm font-medium text-gray-800 focus:outline-none"
                    style={{ lineHeight: '1.5' }}
                  />
                  <Edit2 className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#6B31B2]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="reference-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Book Details Form</h2>

          <div className="grid grid-cols-[130px_1fr] items-center gap-y-3.5 text-sm">
            <FormRow label="Subject">
              <CompactInput value={formData.subject} onChange={(value) => handleChange('subject', value)} />
            </FormRow>
            <FormRow label="Author(s)">
              <CompactInput value={formData.writer} onChange={(value) => handleChange('writer', value)} />
            </FormRow>
            <FormRow label="Library ID">
              <CompactInput value={formData.bookId} onChange={(value) => handleChange('bookId', value)} disabled={!isCreateMode} placeholder={isCreateMode ? 'Generated if left blank' : ''} />
            </FormRow>
            <FormRow label="Class">
              <CompactInput value={formData.className} onChange={(value) => handleChange('className', value)} />
            </FormRow>
            <FormRow label="Dewey Decimal">
              <CompactInput value={formData.deweyDecimal} onChange={(value) => handleChange('deweyDecimal', value)} />
            </FormRow>
            <FormRow label="Publication Date">
              <CompactInput type="date" value={formData.publishDate} onChange={(value) => handleChange('publishDate', value)} />
            </FormRow>
            <FormRow label="Publisher">
              <CompactInput value={formData.publisher} onChange={(value) => handleChange('publisher', value)} />
            </FormRow>
            <FormRow label="Language">
              <CompactInput value={formData.language} onChange={(value) => handleChange('language', value)} />
            </FormRow>
            <FormRow label="Pages">
              <CompactInput type="number" value={String(formData.pages)} onChange={(value) => handleChange('pages', Number(value) || 0)} />
            </FormRow>
            <FormRow label="ISBN-13">
              <CompactInput value={formData.isbn13} onChange={(value) => handleChange('isbn13', value)} />
            </FormRow>
            <FormRow label="Total Copies">
              <CompactInput type="number" value={String(formData.totalCopies)} onChange={(value) => handleChange('totalCopies', Math.max(1, Number(value) || 1))} />
            </FormRow>

            <div className="col-span-2 mt-4 flex justify-end gap-3 border-t border-transparent pt-6">
              <button type="button" onClick={() => navigate(-1)} className="reference-muted-button">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUploadingCover || isSaving}
                className="reference-primary-button px-6 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isSaving ? <Spinner className="h-4 w-4 border-2 border-white/30 border-t-white" /> : null}
                <span>{isCreateMode ? 'Create Book' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </label>
  );
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <label className="font-medium text-gray-900">{label}</label>
      {children}
    </>
  );
}

function CompactInput({
  value,
  onChange,
  type = 'text',
  disabled = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-200 px-3 py-1.5 transition-colors hover:border-gray-300 focus:outline-none focus:border-brand-primary disabled:cursor-not-allowed disabled:bg-gray-100"
    />
  );
}
