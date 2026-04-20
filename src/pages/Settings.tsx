import React from 'react';
import { ShieldCheck, Mail, UserCircle2, HardDriveUpload } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Home <span className="mx-1">/</span> <span className="font-medium text-gray-700">Settings</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-2xl bg-brand-secondary text-brand-primary flex items-center justify-center">
              <UserCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Account</h2>
              <p className="text-sm text-gray-500">Current authenticated librarian account</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Full Name</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{user?.name ?? 'Not signed in'}</p>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3 flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Email</p>
                <p className="mt-1 text-base font-semibold text-gray-900 break-all">{user?.email ?? '-'}</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Role</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{user?.role ?? '-'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-2xl bg-brand-secondary text-brand-primary flex items-center justify-center">
              <HardDriveUpload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Storage</h2>
              <p className="text-sm text-gray-500">Book covers upload into the Supabase bucket named <code>images</code></p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-600 leading-6">
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
