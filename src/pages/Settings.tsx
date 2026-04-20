import { HardDriveUpload, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="page-shell max-w-5xl">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Library / Settings</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="reference-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-secondary text-brand-primary">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Account</h2>
              <p className="text-sm text-gray-500">Current authenticated librarian account</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <DetailBlock label="Full Name" value={user?.name ?? 'Not signed in'} />

            <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <Mail className="mt-1 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Email</p>
                <p className="mt-1 break-all text-base font-semibold text-gray-900">{user?.email ?? '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <ShieldCheck className="mt-1 h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Role</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{user?.role ?? '-'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="reference-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-secondary text-brand-primary">
              <HardDriveUpload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Storage</h2>
              <p className="text-sm text-gray-500">Book covers upload into the Supabase bucket named <code>images</code></p>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-6 text-gray-600">
            <p>
              New book covers are uploaded through the backend and then saved in your Supabase storage bucket.
            </p>
            <p>
              If uploads fail, check that your <code>SUPABASE_SERVICE_ROLE_KEY</code> is present in <code>.env</code> and that the <code>images</code> bucket exists.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}
