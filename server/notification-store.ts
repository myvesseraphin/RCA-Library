import { pool } from './db.ts';
import { formatDisplayDate } from './date-utils.ts';

type NotificationRow = {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function serializeNotification(row: NotificationRow) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.is_read,
    createdAt: formatDisplayDate(row.created_at) ?? row.created_at,
  };
}

export async function createNotification(payload: {
  type: string;
  title: string;
  message: string;
  link?: string | null;
}) {
  const title = payload.title.trim();
  const message = payload.message.trim();

  if (!title || !message) {
    return null;
  }

  const result = await pool.query<NotificationRow>(
    `
      INSERT INTO notifications (type, title, message, link, is_read)
      VALUES ($1, $2, $3, $4, FALSE)
      RETURNING *
    `,
    [
      payload.type.trim() || 'system',
      title,
      message,
      payload.link?.trim() || null,
    ],
  );

  return result.rows[0] ? serializeNotification(result.rows[0]) : null;
}

export async function getNotifications() {
  const result = await pool.query<NotificationRow>(
    `
      SELECT *
      FROM notifications
      ORDER BY is_read ASC, created_at DESC, id DESC
      LIMIT 100
    `,
  );

  return result.rows.map(serializeNotification);
}

export async function markNotificationAsRead(notificationId: number) {
  const result = await pool.query<NotificationRow>(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      RETURNING *
    `,
    [notificationId],
  );

  return result.rows[0] ? serializeNotification(result.rows[0]) : null;
}

export async function markAllNotificationsAsRead() {
  await pool.query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE is_read = FALSE
    `,
  );
}
