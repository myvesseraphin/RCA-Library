import { useMemo, useState } from 'react';
import { Bell, BookOpen, CheckCheck, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/ui/PageLoader';
import { useNotifications } from '../lib/notifications';
import { useToast } from '../lib/toast';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
] as const;

const NOTIFICATION_META: Record<string, { icon: typeof Bell; shell: string; iconColor: string; image?: boolean }> = {
  auth: { icon: ShieldCheck, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]' },
  security: { icon: KeyRound, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]' },
  user: { icon: UserRound, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]', image: true },
  book: { icon: BookOpen, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]' },
  circulation: { icon: Bell, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]' },
  fine: { icon: Bell, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]' },
  system: { icon: Bell, shell: 'bg-[#f4eef9]', iconColor: 'text-[#6b31b2]' },
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { notifications, unreadCount, isLoading, markAllRead, markRead } = useNotifications();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('all');

  const visibleNotifications = useMemo(() => notifications.filter((notification) => {
    if (filter === 'unread') {
      return !notification.isRead;
    }

    if (filter === 'read') {
      return notification.isRead;
    }

    return true;
  }), [filter, notifications]);

  if (isLoading && notifications.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell">
      <div className="mb-4">
        <h1 className="mb-1.5 text-[1.4rem] font-bold text-gray-900">System Notifications</h1>
        <p className="text-[13px] text-gray-500">Home / Notifications</p>
      </div>
      <div className="showcase-card p-0 flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 pt-2 border-b border-[#f1ebf8]">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`pb-3 pt-3 text-[14px] font-semibold transition-all border-b-[3px] ${
                filter === item.value
                  ? 'border-[#451483] text-[#451483]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label} {item.value === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
          <button className="pb-3 pt-3 text-[14px] font-semibold transition-all border-b-[3px] border-transparent text-gray-600 hover:text-gray-900">Mentions</button>
          <button className="pb-3 pt-3 text-[14px] font-semibold transition-all border-b-[3px] border-transparent text-gray-600 hover:text-gray-900">Library</button>
          <button className="pb-3 pt-3 text-[14px] font-semibold transition-all border-b-[3px] border-transparent text-gray-600 hover:text-gray-900">System</button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="showcase-input min-w-[320px] px-3 h-[42px] bg-white border border-gray-200 shadow-sm rounded-lg flex-1 sm:flex-none">
            <svg className="showcase-input-icon h-[18px] w-[18px] text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search notifications..."
              className="text-[14px] bg-transparent w-full"
            />
            <svg className="showcase-input-icon h-4 w-4 text-[#7c2fd0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  await markAllRead();
                  toast.success('All notifications marked as read.');
                } catch (reason) {
                  toast.error(reason instanceof Error ? reason.message : 'Unable to update notifications.');
                }
              }}
              className="reference-outline-button !rounded-lg !border-[#451483] !text-[#451483] px-4 py-2 font-semibold text-[13px] hover:!bg-[#fcfaff]"
            >
              Mark all as read
            </button>
            <button className="reference-filter-button h-[42px] flex items-center justify-between gap-2 px-3 min-w-[120px] rounded-lg border border-gray-200 shadow-sm bg-white">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="text-[13px] text-gray-600">10-02-13-2023</span>
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          </div>
        </div>

      {visibleNotifications.length === 0 ? (
        <div className="border-t border-[#f1ebf8] px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-secondary text-brand-primary">
            <Bell className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No notifications here yet</h2>
          <p className="mt-2 text-sm text-gray-500">Try a different filter or keep working.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {visibleNotifications.map((notification) => {
            const meta = NOTIFICATION_META[notification.type] ?? NOTIFICATION_META.system;
            const Icon = meta.icon;

            return (
              <div
                key={notification.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#f1ebf8] px-6 py-5 transition hover:bg-[#fcfaff] group"
              >
                <div className="flex items-center gap-5 flex-1 pr-4">
                  <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full ${meta.shell}`}>
                    {meta.image ? (
                        <div className="h-full w-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                           <UserRound className="h-6 w-6 text-gray-400" />
                        </div>
                    ) : (
                      <Icon className={`h-6 w-6 ${meta.iconColor}`} />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <h2 className="text-[15px] font-bold text-[#1f152e]">{notification.title}</h2>
                    <p className="text-[13px] text-[#4d4458] mt-[2px]">{notification.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-4 sm:mt-0 w-[300px] flex-shrink-0 justify-between">
                  <div className="text-[14px] font-bold text-[#1f152e] min-w-[80px]">
                    {notification.createdAt}
                  </div>
                  
                  <div className="w-4 flex items-center justify-center">
                    <div className={`h-[14px] w-[14px] rounded-full ${!notification.isRead ? 'bg-[#5b1ea5]' : 'bg-[#e2dee8]'}`} />
                  </div>

                  <div className="flex flex-col items-end min-w-[90px] gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await markRead(notification.id);
                          } catch (reason) {
                            toast.error(reason instanceof Error ? reason.message : 'Unable to update that notification.');
                          }
                        }}
                        className="text-[13px] font-bold text-[#1f152e] transition hover:text-[#5b1ea5]"
                      >
                        Mark as Read
                      </button>
                    )}
                    {notification.link && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (!notification.isRead) {
                              await markRead(notification.id);
                            }
                            navigate(notification.link);
                          } catch (reason) {
                            toast.error(reason instanceof Error ? reason.message : 'Unable to open that notification.');
                          }
                        }}
                        className="text-[13px] font-bold text-[#1f152e] transition hover:text-[#5b1ea5]"
                      >
                         Open
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Footer Pagination mock */}
      {visibleNotifications.length > 0 && (
         <div className="flex flex-col items-center justify-center gap-3 px-6 py-4 border-t border-[#f1ebf8] text-[13px] text-gray-700 sm:flex-row shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
               <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">1</button>
            <button className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">2</button>
            <button className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">3</button>
            <button className="w-8 h-8 flex items-center justify-center font-bold bg-[#5b1ea5] text-white rounded-md">4</button>
            <button className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">5</button>
            <span className="font-bold text-gray-700 tracking-widest pl-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center font-bold text-gray-700">100</button>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
               <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            
            <button className="ml-4 flex items-center gap-2 font-bold px-3 py-1 rounded hover:bg-gray-50 text-gray-700 border-none transition-none">
              10 / page
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
         </div>
      )}
      
      </div>
    </div>
  );
}
