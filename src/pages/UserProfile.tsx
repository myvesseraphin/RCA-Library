import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { CornerUpLeft, RefreshCw } from 'lucide-react';
import { InitialAvatar } from '../components/ui/InitialAvatar';
import { BookCoverArtwork } from '../components/ui/BookCoverArtwork';
import { PageLoader } from '../components/ui/PageLoader';
import { api, type UserProfileData } from '../lib/api';
import { formatFine, formatRwf } from '../lib/seed';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';

const summaryChartData = [
  { name: 'Jan', val: 5 },
  { name: 'Feb', val: 12 },
  { name: 'Mar', val: 23 },
  { name: 'Apr', val: 18 },
  { name: 'May', val: 32 },
  { name: 'Jun', val: 20 },
  { name: 'Jul', val: 35 },
  { name: 'Aug', val: 42 },
  { name: 'Sep', val: 50 },
  { name: 'Oct', val: 78 },
  { name: 'Nov', val: 52 },
  { name: 'Dec', val: 68 },
];

const finesChartData = [
  { name: 'Jan', val: 3, type: 'purple' },
  { name: 'Feb', val: 12, type: 'purple' },
  { name: 'Mar', val: 25, type: 'green' },
  { name: 'Apr', val: 32, type: 'purple' },
  { name: 'May', val: 15, type: 'green' },
  { name: 'Jun', val: 40, type: 'green' },
  { name: 'Jul', val: 30, type: 'purple' },
  { name: 'Aug', val: 12, type: 'purple' },
];

export function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotifications();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fineFilter, setFineFilter] = useState<'all' | 'paid' | 'owed'>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'borrowed' | 'returned'>('all');

  const loadProfile = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.getUserProfile(id);
      setProfile(data);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to load the borrower profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const fineHistory = useMemo(() => {
    if (!profile) {
      return [];
    }

    if (fineFilter === 'paid') {
      return profile.fineHistory.filter((record) => record.amountOwedRwf === 0);
    }

    if (fineFilter === 'owed') {
      return profile.fineHistory.filter((record) => record.amountOwedRwf > 0);
    }

    return profile.fineHistory;
  }, [fineFilter, profile]);

  const borrowHistory = useMemo(() => {
    if (!profile) {
      return [];
    }

    if (historyFilter === 'borrowed') {
      return profile.borrowHistory.filter((record) => record.status === 'Borrowed');
    }

    if (historyFilter === 'returned') {
      return profile.borrowHistory.filter((record) => record.status === 'Returned');
    }

    return profile.borrowHistory;
  }, [historyFilter, profile]);

  const handleReturn = async (copyId: string) => {
    try {
      await api.returnBorrowing(copyId);
      await refresh();
      await loadProfile();
      toast.success('Book returned successfully.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to return that copy.');
    }
  };

  const handleRenew = async (copyId: string) => {
    try {
      await api.renewBorrowing(copyId);
      await refresh();
      await loadProfile();
      toast.success('Loan renewed.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to renew that copy.');
    }
  };

  const handlePayFine = async (fineId: string) => {
    if (!id) {
      return;
    }

    try {
      await api.payFine(id, fineId);
      await refresh();
      await loadProfile();
      toast.success('Fine payment recorded.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to record that payment.');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!profile) {
    return null;
  }

  const { user, currentBorrowings } = profile;

  return (
    <div className="page-shell pb-12">
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Borrower Profile: {user.name}</h1>
          <p className="text-sm text-gray-500">Library / Borrower Profile</p>
        </div>
        <div className="flex items-center gap-3">
          <InitialAvatar name={user.name} className="h-12 w-12 text-sm" />
          <div>
            <h2 className="text-base font-bold leading-tight text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">Class: {user.className}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="reference-card flex flex-col p-6">
          <h3 className="mb-6 text-[17px] font-bold text-gray-900">Personal Details</h3>
          <div className="grid flex-1 grid-cols-2 content-start gap-y-6">
            <ProfileStat label="Name" value={user.name} />
            <ProfileStat label="Class" value={user.className} />
            <div className="col-span-2">
              <ProfileStat label="Student ID" value={user.studentId} />
            </div>
            <div className="col-span-2">
              <ProfileStat label="Contact info" value={user.primaryEmail || '-'} />
            </div>
          </div>
        </section>

        <section className="reference-card flex flex-col p-6">
          <h3 className="mb-4 text-[17px] font-bold text-gray-900">Borrowing Summary</h3>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <SummaryMetric label="Lifetime Borrowed" value={`${user.lifetimeBorrowed} Books`} />
            <SummaryMetric label="Current Loans" value={`${currentBorrowings.length}`} />
            <SummaryMetric label="Overdue Events" value={`${user.overdueEvents}`} />
          </div>
          <div className="min-h-[140px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summaryChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} ticks={[0, 10, 20, 30, 40]} />
                <Line type="monotone" dataKey="val" stroke="#7E22CE" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="reference-card flex flex-col p-6">
          <h3 className="mb-4 text-[17px] font-bold text-gray-900">Fines &amp; Payments</h3>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <SummaryMetric label="Total Owed Fines" value={formatFine(user.totalFinesOwedRwf)} />
            <SummaryMetric label="Total Fines Paid" value={formatRwf(user.totalFinesPaidRwf)} />
          </div>
          <div className="mt-auto min-h-[140px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finesChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} ticks={[0, 5, 10]} />
                <Bar dataKey="val" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {finesChartData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.type === 'purple' ? '#7E22CE' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="reference-card flex flex-col overflow-hidden">
        <div className="border-b border-gray-50 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[17px] font-bold text-gray-900">Current Loans</h3>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate(`/users/${user.id}/details`)} className="reference-outline-button px-4 py-2 text-sm">
                Edit Borrower
              </button>
              <button type="button" onClick={() => navigate('/borrowing')} className="reference-secondary-button px-4 py-2 text-sm">
                Open Borrowing
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="reference-table min-w-[860px]">
            <thead>
              <tr>
                <th>Copy ID</th>
                <th>Book Title</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fines Accrued</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBorrowings.length > 0 ? currentBorrowings.map((entry) => (
                <tr key={entry.copyId}>
                  <td className="font-medium text-gray-800">{entry.copyId}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                        <BookCoverArtwork src={entry.book.cover} alt={entry.book.title} compact />
                      </div>
                      <span className="font-semibold text-gray-800">{entry.book.title}</span>
                    </div>
                  </td>
                  <td className="text-gray-800">{entry.book.subject}</td>
                  <td className="font-medium whitespace-nowrap text-gray-800">{entry.dueDate ?? '-'}</td>
                  <td>
                    <span className={`rounded px-3 py-1 text-xs font-semibold ${entry.status === 'Overdue' ? 'bg-red-200/60 text-red-700' : 'bg-green-200/60 text-green-700'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="font-medium text-gray-800">{formatFine(entry.fineRwf)}</td>
                  <td className="text-gray-500">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handleReturn(entry.copyId)} className="transition-colors hover:text-gray-900" aria-label={`Return ${entry.copyId}`}>
                        <CornerUpLeft className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleRenew(entry.copyId)} className="transition-colors hover:text-gray-900" aria-label={`Renew ${entry.copyId}`}>
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-gray-500">
                    No active loans for this borrower.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <section className="reference-card flex h-[340px] flex-col overflow-hidden">
          <div className="px-6 pb-4 pt-5">
            <h3 className="mb-4 text-[17px] font-bold text-gray-900">Detailed Fine History</h3>
            <div className="flex items-center gap-2">
              <FilterButton label="All Fines" active={fineFilter === 'all'} onClick={() => setFineFilter('all')} />
              <FilterButton label="Paid Fines" active={fineFilter === 'paid'} onClick={() => setFineFilter('paid')} />
              <FilterButton label="Owed Fines" active={fineFilter === 'owed'} onClick={() => setFineFilter('owed')} />
            </div>
          </div>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="reference-table-compact min-w-[640px]">
              <thead>
                <tr>
                  <th>Fine ID</th>
                  <th>Fine Type</th>
                  <th>Date Accrued</th>
                  <th>Amount</th>
                  <th>Amount Owed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fineHistory.length > 0 ? fineHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="font-medium">{record.id}</td>
                    <td>{record.type}</td>
                    <td>{record.dateAccrued || '-'}</td>
                    <td className="font-medium">{formatRwf(record.amountRwf)}</td>
                    <td className="font-medium">{formatRwf(record.amountOwedRwf)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handlePayFine(record.id)}
                        disabled={record.amountOwedRwf <= 0}
                        className="rounded border border-gray-200 px-3 py-1 font-medium text-brand-primary transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {record.amountOwedRwf > 0 ? 'Pay Fine' : 'Paid'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No fine records for this borrower.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="reference-card flex h-[340px] flex-col overflow-hidden">
          <div className="px-6 pb-4 pt-5">
            <h3 className="mb-4 text-[17px] font-bold text-gray-900">Borrow History</h3>
            <div className="flex items-center gap-2">
              <FilterButton label="Lifetime History" active={historyFilter === 'all'} onClick={() => setHistoryFilter('all')} />
              <FilterButton label="Borrowed" active={historyFilter === 'borrowed'} onClick={() => setHistoryFilter('borrowed')} />
              <FilterButton label="Returned" active={historyFilter === 'returned'} onClick={() => setHistoryFilter('returned')} />
            </div>
          </div>
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="reference-table-compact min-w-[760px]">
              <thead>
                <tr>
                  <th>Copy ID</th>
                  <th>Book Title</th>
                  <th>Subject</th>
                  <th>Loan Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Total Fines</th>
                </tr>
              </thead>
              <tbody>
                {borrowHistory.length > 0 ? borrowHistory.map((entry) => {
                  const statusLabel = entry.status === 'Returned'
                    ? entry.fineRwf > 0 ? 'Returned (Overdue)' : 'Returned (On-Time)'
                    : 'Borrowed';
                  const statusClass = entry.status === 'Borrowed'
                    ? 'bg-green-200/60 text-green-700'
                    : entry.fineRwf > 0
                      ? 'bg-red-200/60 text-red-700'
                      : 'bg-green-200/60 text-green-700';

                  return (
                    <tr key={entry.id}>
                      <td className="font-medium">{entry.copyId}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                            <BookCoverArtwork src={entry.bookCover} alt={entry.bookTitle} compact />
                          </div>
                          <span className="font-semibold text-gray-800">{entry.bookTitle}</span>
                        </div>
                      </td>
                      <td>{entry.subject}</td>
                      <td className="whitespace-nowrap">{entry.loanDate || '-'}</td>
                      <td className="whitespace-nowrap">{entry.dueDate || '-'}</td>
                      <td>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="text-right font-medium">{entry.fineRwf ? formatRwf(entry.fineRwf) : ''}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No borrowing history found for this borrower.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[13px] font-medium text-gray-500">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium leading-tight text-gray-500">{label}:</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  );
}
