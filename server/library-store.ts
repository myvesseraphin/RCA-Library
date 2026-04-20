import type { PoolClient } from 'pg';
import { hashPassword } from './auth.ts';
import { config } from './config.ts';
import { formatDisplayDate, parseHumanDate } from './date-utils.ts';
import { pool } from './db.ts';

type UserRow = {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  date_of_birth: string | null;
  religion: string;
  class_level: string;
  stream_name: string;
  class_name: string;
  roll: string;
  student_id: string;
  admission_date: string | null;
  primary_phone: string;
  secondary_phone: string;
  primary_email: string;
  secondary_email: string;
  address: string;
  street_address: string;
  house_name: string;
  house_number: string;
  borrow_score: number;
  lifetime_borrowed: number;
  overdue_events: number;
  total_fines_paid_rwf: number;
  total_fines_owed_rwf: number;
  is_selected: boolean;
};

type BookRow = {
  id: number;
  title: string;
  subtitle: string;
  writer: string;
  book_id: string;
  subject: string;
  class_name: string;
  publish_date: string | null;
  cover: string;
  detail_cover: string;
  summary: string;
  dewey_decimal: string;
  publisher: string;
  language: string;
  pages: number;
  isbn13: string;
  total_copies: number;
};

type BorrowingRow = {
  copy_row_id: number;
  copy_code: string;
  status: 'Available' | 'Borrowed' | 'Overdue';
  loan_date: string | null;
  due_date: string | null;
  fine_rwf: number;
  book_db_id: number;
  book_title: string;
  book_subtitle: string;
  book_writer: string;
  book_code: string;
  book_subject: string;
  book_class_name: string;
  book_publish_date: string | null;
  book_cover: string;
  book_detail_cover: string;
  book_summary: string;
  book_dewey_decimal: string;
  book_publisher: string;
  book_language: string;
  book_pages: number;
  book_isbn13: string;
  book_total_copies: number;
  borrower_id: number | null;
  borrower_name: string | null;
  borrower_class_name: string | null;
};

type LoanHistoryRow = {
  id: number;
  copy_code: string;
  loan_date: string;
  due_date: string;
  returned_date: string | null;
  status: 'Borrowed' | 'Returned';
  fine_rwf: number;
  borrower_id: number | null;
  borrower_name: string | null;
  borrower_roll: string | null;
  borrower_student_id: string | null;
  borrower_class_name: string | null;
  book_id: number;
  book_title: string;
  book_subject: string;
  book_cover: string;
};

type FineRow = {
  id: string;
  user_id: number;
  book_id: number;
  type: string;
  date_accrued: string;
  amount_rwf: number;
  amount_owed_rwf: number;
};

function buildClassName(classLevel: string, streamName: string) {
  return streamName ? `${classLevel} - ${streamName}` : classLevel;
}

function copyCodeSuffix(index: number) {
  return String.fromCharCode('A'.charCodeAt(0) + index);
}

function normalizeText(value: unknown) {
  return String(value ?? '').trim();
}

function buildFullName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

function parsePositiveInteger(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function generateNextStudentId(client: PoolClient) {
  const result = await client.query<{ student_id: string }>(
    `
      SELECT student_id
      FROM borrowers
      WHERE student_id ~ '^LSM-[0-9]+$'
      ORDER BY LENGTH(student_id) DESC, student_id DESC
      LIMIT 1
    `,
  );

  const currentValue = Number(result.rows[0]?.student_id.replace('LSM-', '') ?? 2400);
  return `LSM-${currentValue + 1}`;
}

async function generateNextBookCode(client: PoolClient) {
  const result = await client.query<{ book_id: string }>(
    `
      SELECT book_id
      FROM books
      WHERE book_id ~ '^BK-RW-[0-9]+$'
      ORDER BY LENGTH(book_id) DESC, book_id DESC
      LIMIT 1
    `,
  );

  const currentValue = Number(result.rows[0]?.book_id.replace('BK-RW-', '') ?? 0);
  return `BK-RW-${String(currentValue + 1).padStart(3, '0')}`;
}

function serializeUser(row: UserRow) {
  return {
    id: row.id,
    name: row.full_name,
    firstName: row.first_name,
    lastName: row.last_name,
    fatherName: row.father_name,
    motherName: row.mother_name,
    fatherOccupation: row.father_occupation,
    motherOccupation: row.mother_occupation,
    dob: formatDisplayDate(row.date_of_birth),
    religion: row.religion,
    classLevel: row.class_level,
    section: row.stream_name,
    className: row.class_name,
    roll: row.roll,
    studentId: row.student_id,
    admissionDate: formatDisplayDate(row.admission_date),
    primaryPhone: row.primary_phone,
    secondaryPhone: row.secondary_phone,
    primaryEmail: row.primary_email,
    secondaryEmail: row.secondary_email,
    address: row.address,
    streetAddress: row.street_address,
    houseName: row.house_name,
    houseNumber: row.house_number,
    borrowScore: row.borrow_score,
    lifetimeBorrowed: row.lifetime_borrowed,
    overdueEvents: row.overdue_events,
    totalFinesPaidRwf: row.total_fines_paid_rwf,
    totalFinesOwedRwf: row.total_fines_owed_rwf,
    selected: row.is_selected,
  };
}

function serializeBook(row: BookRow) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    writer: row.writer,
    bookId: row.book_id,
    subject: row.subject,
    className: row.class_name,
    publishDate: formatDisplayDate(row.publish_date),
    cover: row.cover,
    detailCover: row.detail_cover,
    summary: row.summary,
    deweyDecimal: row.dewey_decimal,
    publisher: row.publisher,
    language: row.language,
    pages: row.pages,
    isbn13: row.isbn13,
    totalCopies: row.total_copies,
    selected: false,
  };
}

function serializeBorrowing(row: BorrowingRow) {
  return {
    id: row.copy_row_id,
    copyId: row.copy_code,
    bookId: row.book_db_id,
    borrowerUserId: row.borrower_id,
    loanDate: formatDisplayDate(row.loan_date),
    dueDate: formatDisplayDate(row.due_date),
    fineRwf: row.fine_rwf,
    status: row.status,
    book: serializeBook({
      id: row.book_db_id,
      title: row.book_title,
      subtitle: row.book_subtitle,
      writer: row.book_writer,
      book_id: row.book_code,
      subject: row.book_subject,
      class_name: row.book_class_name,
      publish_date: row.book_publish_date,
      cover: row.book_cover,
      detail_cover: row.book_detail_cover,
      summary: row.book_summary,
      dewey_decimal: row.book_dewey_decimal,
      publisher: row.book_publisher,
      language: row.book_language,
      pages: row.book_pages,
      isbn13: row.book_isbn13,
      total_copies: row.book_total_copies,
    }),
    borrowerLabel: row.borrower_name && row.borrower_class_name
      ? `${row.borrower_name} (${row.borrower_class_name})`
      : '-',
  };
}

function serializeFine(row: FineRow) {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    type: row.type,
    dateAccrued: formatDisplayDate(row.date_accrued),
    amountRwf: row.amount_rwf,
    amountOwedRwf: row.amount_owed_rwf,
  };
}

function serializeLoanHistory(row: LoanHistoryRow) {
  return {
    id: row.id,
    copyId: row.copy_code,
    borrower: row.borrower_name ?? '-',
    borrowerClassName: row.borrower_class_name,
    roll: row.borrower_roll ?? '-',
    studentId: row.borrower_student_id ?? '-',
    loanDate: formatDisplayDate(row.loan_date),
    dueDate: formatDisplayDate(row.due_date),
    returnedDate: formatDisplayDate(row.returned_date),
    status: row.status,
    fineRwf: row.fine_rwf,
    bookId: row.book_id,
    bookTitle: row.book_title,
    subject: row.book_subject,
    bookCover: row.book_cover,
  };
}

async function ensureAdminUser() {
  await pool.query(
    `
      INSERT INTO users (
        email,
        full_name,
        role,
        password_hash
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `,
    [
      config.seedAdminEmail.trim().toLowerCase(),
      config.seedAdminName,
      config.seedAdminRole,
      hashPassword(config.seedAdminPassword),
    ],
  );
}

async function refreshOverdueStatuses() {
  await pool.query(`
    UPDATE book_copies
    SET
      status = CASE
        WHEN borrower_user_id IS NULL THEN 'Available'
        WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE THEN 'Overdue'
        ELSE 'Borrowed'
      END,
      updated_at = NOW()
    WHERE borrower_user_id IS NOT NULL
      AND status <> CASE
        WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE THEN 'Overdue'
        ELSE 'Borrowed'
      END
  `);
}

export async function initializeLibraryStore() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      full_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      father_name TEXT NOT NULL DEFAULT '',
      mother_name TEXT NOT NULL DEFAULT '',
      father_occupation TEXT NOT NULL DEFAULT '',
      mother_occupation TEXT NOT NULL DEFAULT '',
      date_of_birth DATE,
      religion TEXT NOT NULL DEFAULT '',
      class_level TEXT NOT NULL,
      stream_name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      roll TEXT NOT NULL UNIQUE,
      student_id TEXT NOT NULL UNIQUE,
      admission_date DATE,
      primary_phone TEXT NOT NULL DEFAULT '',
      secondary_phone TEXT NOT NULL DEFAULT '',
      primary_email TEXT NOT NULL DEFAULT '',
      secondary_email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      street_address TEXT NOT NULL DEFAULT '',
      house_name TEXT NOT NULL DEFAULT '',
      house_number TEXT NOT NULL DEFAULT '',
      borrow_score INTEGER NOT NULL DEFAULT 0,
      lifetime_borrowed INTEGER NOT NULL DEFAULT 0,
      overdue_events INTEGER NOT NULL DEFAULT 0,
      total_fines_paid_rwf INTEGER NOT NULL DEFAULT 0,
      total_fines_owed_rwf INTEGER NOT NULL DEFAULT 0,
      is_selected BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      writer TEXT NOT NULL,
      book_id TEXT NOT NULL UNIQUE,
      subject TEXT NOT NULL,
      class_name TEXT NOT NULL,
      publish_date DATE,
      cover TEXT NOT NULL DEFAULT '/logo.png',
      detail_cover TEXT NOT NULL DEFAULT '/logo.png',
      summary TEXT NOT NULL DEFAULT '',
      dewey_decimal TEXT NOT NULL DEFAULT '',
      publisher TEXT NOT NULL DEFAULT '',
      language TEXT NOT NULL DEFAULT '',
      pages INTEGER NOT NULL DEFAULT 0,
      isbn13 TEXT NOT NULL DEFAULT '',
      total_copies INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS book_copies (
      id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      copy_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('Available', 'Borrowed', 'Overdue')),
      borrower_user_id INTEGER REFERENCES borrowers(id) ON DELETE SET NULL,
      loan_date DATE,
      due_date DATE,
      fine_rwf INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS loan_history (
      id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      copy_code TEXT NOT NULL,
      borrower_user_id INTEGER NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
      loan_date DATE NOT NULL,
      due_date DATE NOT NULL,
      returned_date DATE,
      status TEXT NOT NULL CHECK (status IN ('Borrowed', 'Returned')),
      fine_rwf INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (copy_code, borrower_user_id, loan_date)
    );

    CREATE TABLE IF NOT EXISTS fine_records (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      date_accrued DATE NOT NULL,
      amount_rwf INTEGER NOT NULL DEFAULT 0,
      amount_owed_rwf INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await ensureAdminUser();
  await refreshOverdueStatuses();
}

export async function getDashboardData() {
  await refreshOverdueStatuses();

  const [
    borrowerCountResult,
    activeLoansResult,
    libraryBooksResult,
    overdueCopiesResult,
    attendanceTrendResult,
    topCategoriesResult,
    recentBorrowerRows,
  ] = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM borrowers'),
    pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM book_copies WHERE status <> 'Available'"),
    pool.query<{ count: string }>('SELECT COALESCE(SUM(total_copies), 0)::text AS count FROM books'),
    pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM book_copies WHERE status = 'Overdue'"),
    pool.query<{ day_label: string; loan_count: string }>(
      `
        SELECT
          TO_CHAR(day_series.day, 'Dy') AS day_label,
          COALESCE(COUNT(history.id), 0)::text AS loan_count
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS day_series(day)
        LEFT JOIN loan_history history ON history.loan_date = day_series.day::date
        GROUP BY day_series.day
        ORDER BY day_series.day
      `,
    ),
    pool.query<{ name: string; value: string }>(
      `
        SELECT
          books.subject AS name,
          COUNT(history.id)::text AS value
        FROM loan_history history
        JOIN books ON books.id = history.book_id
        GROUP BY books.subject
        ORDER BY COUNT(history.id) DESC, books.subject ASC
        LIMIT 6
      `,
    ),
    pool.query<UserRow>(
      `
        SELECT *
        FROM borrowers
        ORDER BY lifetime_borrowed DESC, borrow_score DESC, id ASC
        LIMIT 3
      `,
    ),
  ]);

  const recentBorrowers = recentBorrowerRows.rows.map((row, index, collection) => {
    const topScore = Math.max(collection[0]?.lifetime_borrowed ?? 0, 1);
    const percent = row.lifetime_borrowed > 0
      ? Math.round((row.lifetime_borrowed / topScore) * 100)
      : 0;

    return {
      id: row.id,
      name: row.full_name,
      studentId: row.student_id,
      percent: `${percent}%`,
      className: row.class_name,
      selected: index === 0,
    };
  });

  return {
    staffProfile: {
      name: config.librarianName,
      role: config.librarianRole,
    },
    welcomeName: config.librarianName.split(' ').at(-1) ?? config.librarianName,
    stats: [
      { label: 'Total Borrowers', value: borrowerCountResult.rows[0]?.count ?? '0', trend: null, bg: 'bg-purple-50', text: 'text-purple-600' },
      { label: 'Active Loans', value: activeLoansResult.rows[0]?.count ?? '0', trend: null, bg: 'bg-purple-50', text: 'text-purple-600' },
      { label: 'Library Books', value: libraryBooksResult.rows[0]?.count ?? '0', trend: null, bg: 'bg-gray-50', text: 'text-purple-600' },
      { label: 'Overdue Copies', value: overdueCopiesResult.rows[0]?.count ?? '0', trend: null, bg: 'bg-gray-50', text: 'text-purple-600' },
    ],
    attendanceTrend: attendanceTrendResult.rows.map((row) => ({
      name: row.day_label.trim(),
      value: Number(row.loan_count),
    })),
    topBorrowedCategories: topCategoriesResult.rows.map((row) => ({
      name: row.name,
      value: Number(row.value),
    })),
    recentBorrowers,
    quickActions: [
      { id: 'users', label: 'Add User', path: '/users/new' },
      { id: 'library', label: 'Add Book', path: '/library/new/edit' },
      { id: 'borrowing', label: 'Check-out Book', path: '/borrowing' },
      { id: 'settings', label: 'Settings', path: '/settings' },
    ],
  };
}

export async function getAllUsers() {
  const result = await pool.query<UserRow>('SELECT * FROM borrowers ORDER BY id ASC');
  return result.rows.map(serializeUser);
}

export async function getUserById(userId: number) {
  const result = await pool.query<UserRow>('SELECT * FROM borrowers WHERE id = $1', [userId]);
  const row = result.rows[0];
  return row ? serializeUser(row) : null;
}

export async function createUser(payload: Record<string, unknown>) {
  const firstName = normalizeText(payload.firstName);
  const lastName = normalizeText(payload.lastName);
  const classLevel = normalizeText(payload.classLevel);
  const section = normalizeText(payload.section);
  const roll = normalizeText(payload.roll);

  if (!firstName || !lastName || !classLevel || !section || !roll) {
    throw new Error('First name, last name, year, stream, and roll are required.');
  }

  const existingBorrower = await pool.query<{ id: number }>(
    'SELECT id FROM borrowers WHERE roll = $1 LIMIT 1',
    [roll],
  );

  if (existingBorrower.rowCount) {
    throw new Error('A borrower with that roll already exists.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const studentId = await generateNextStudentId(client);
    const className = buildClassName(classLevel, section);

    const result = await client.query<UserRow>(
      `
        INSERT INTO borrowers (
          full_name,
          first_name,
          last_name,
          father_name,
          mother_name,
          father_occupation,
          mother_occupation,
          date_of_birth,
          religion,
          class_level,
          stream_name,
          class_name,
          roll,
          student_id,
          admission_date,
          primary_phone,
          secondary_phone,
          primary_email,
          secondary_email,
          address,
          street_address,
          house_name,
          house_number,
          borrow_score,
          lifetime_borrowed,
          overdue_events,
          total_fines_paid_rwf,
          total_fines_owed_rwf,
          is_selected
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, 0, 0, 0, 0, 0, FALSE
        )
        RETURNING *
      `,
      [
        buildFullName(firstName, lastName),
        firstName,
        lastName,
        normalizeText(payload.fatherName),
        normalizeText(payload.motherName),
        normalizeText(payload.fatherOccupation),
        normalizeText(payload.motherOccupation),
        parseHumanDate(normalizeText(payload.dob)),
        normalizeText(payload.religion),
        classLevel,
        section,
        className,
        roll,
        studentId,
        parseHumanDate(normalizeText(payload.admissionDate)),
        normalizeText(payload.primaryPhone),
        normalizeText(payload.secondaryPhone),
        normalizeText(payload.primaryEmail),
        normalizeText(payload.secondaryEmail),
        normalizeText(payload.address),
        normalizeText(payload.streetAddress),
        normalizeText(payload.houseName),
        normalizeText(payload.houseNumber),
      ],
    );

    await client.query('COMMIT');
    return serializeUser(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateUserById(userId: number, payload: Record<string, unknown>) {
  const classLevel = normalizeText(payload.classLevel);
  const section = normalizeText(payload.section);
  const className = buildClassName(classLevel, section);
  const firstName = normalizeText(payload.firstName);
  const lastName = normalizeText(payload.lastName);
  const roll = normalizeText(payload.roll);
  const fullName = buildFullName(firstName, lastName);

  const conflictingBorrower = await pool.query<{ id: number }>(
    'SELECT id FROM borrowers WHERE roll = $1 AND id <> $2 LIMIT 1',
    [roll, userId],
  );

  if (conflictingBorrower.rowCount) {
    throw new Error('A borrower with that roll already exists.');
  }

  const result = await pool.query<UserRow>(
    `
      UPDATE borrowers
      SET
        full_name = $2,
        first_name = $3,
        last_name = $4,
        father_name = $5,
        mother_name = $6,
        father_occupation = $7,
        mother_occupation = $8,
        date_of_birth = $9,
        religion = $10,
        class_level = $11,
        stream_name = $12,
        class_name = $13,
        roll = $14,
        admission_date = $15,
        primary_phone = $16,
        secondary_phone = $17,
        primary_email = $18,
        secondary_email = $19,
        address = $20,
        street_address = $21,
        house_name = $22,
        house_number = $23,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      userId,
      fullName,
      firstName,
      lastName,
      normalizeText(payload.fatherName),
      normalizeText(payload.motherName),
      normalizeText(payload.fatherOccupation),
      normalizeText(payload.motherOccupation),
      parseHumanDate(normalizeText(payload.dob)) ?? null,
      normalizeText(payload.religion),
      classLevel,
      section,
      className,
      roll,
      parseHumanDate(normalizeText(payload.admissionDate)) ?? null,
      normalizeText(payload.primaryPhone),
      normalizeText(payload.secondaryPhone),
      normalizeText(payload.primaryEmail),
      normalizeText(payload.secondaryEmail),
      normalizeText(payload.address),
      normalizeText(payload.streetAddress),
      normalizeText(payload.houseName),
      normalizeText(payload.houseNumber),
    ],
  );

  return result.rows[0] ? serializeUser(result.rows[0]) : null;
}

export async function deleteUserById(userId: number) {
  const activeLoans = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM book_copies WHERE borrower_user_id = $1 AND status <> $2',
    [userId, 'Available'],
  );

  const historyRows = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM loan_history WHERE borrower_user_id = $1',
    [userId],
  );

  if (Number(activeLoans.rows[0]?.count ?? 0) > 0 || Number(historyRows.rows[0]?.count ?? 0) > 0) {
    return { deleted: false, reason: 'This borrower still has circulation activity and cannot be removed.' };
  }

  const result = await pool.query('DELETE FROM borrowers WHERE id = $1', [userId]);
  return { deleted: result.rowCount > 0, reason: result.rowCount ? null : 'Borrower not found.' };
}

export async function getAllBooks() {
  const result = await pool.query<BookRow>('SELECT * FROM books ORDER BY id ASC');
  return result.rows.map(serializeBook);
}

export async function getBookById(bookId: number) {
  await refreshOverdueStatuses();

  const result = await pool.query<
    BookRow & {
      available_copies: string;
      borrowed_copies: string;
    }
  >(
    `
      SELECT
        b.*,
        COUNT(c.id) FILTER (WHERE c.status = 'Available')::text AS available_copies,
        COUNT(c.id) FILTER (WHERE c.status <> 'Available')::text AS borrowed_copies
      FROM books b
      LEFT JOIN book_copies c ON c.book_id = b.id
      WHERE b.id = $1
      GROUP BY b.id
    `,
    [bookId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const currentBorrowersResult = await pool.query<LoanHistoryRow>(
    `
      SELECT
        c.copy_code,
        c.loan_date,
        c.due_date,
        NULL::date AS returned_date,
        'Borrowed'::text AS status,
        c.fine_rwf,
        u.id AS borrower_id,
        u.full_name AS borrower_name,
        u.roll AS borrower_roll,
        u.student_id AS borrower_student_id,
        u.class_name AS borrower_class_name,
        b.id AS book_id,
        b.title AS book_title,
        b.subject AS book_subject,
        b.cover AS book_cover,
        c.id
      FROM book_copies c
      JOIN books b ON b.id = c.book_id
      LEFT JOIN borrowers u ON u.id = c.borrower_user_id
      WHERE c.book_id = $1 AND c.status <> 'Available'
      ORDER BY c.copy_code ASC
    `,
    [bookId],
  );

  const historyPreview = await getBookHistory(bookId);

  return {
    book: serializeBook(row),
    availableCopies: Number(row.available_copies ?? 0),
    borrowedCopies: Number(row.borrowed_copies ?? 0),
    currentBorrowers: currentBorrowersResult.rows.map(serializeLoanHistory),
    historyPreview: historyPreview.slice(0, 5),
  };
}

export async function createBook(payload: Record<string, unknown>) {
  const title = normalizeText(payload.title);
  const writer = normalizeText(payload.writer);
  const subject = normalizeText(payload.subject);
  const className = normalizeText(payload.className);
  const totalCopies = Math.max(parsePositiveInteger(payload.totalCopies, 1), 1);

  if (!title || !writer || !subject || !className) {
    throw new Error('Title, author, subject, class, and total copies are required.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookCode = normalizeText(payload.bookId) || await generateNextBookCode(client);

    const existingBook = await client.query<{ id: number }>(
      'SELECT id FROM books WHERE book_id = $1 LIMIT 1',
      [bookCode],
    );

    if (existingBook.rowCount) {
      throw new Error('A book with that library ID already exists.');
    }

    const coverUrl = normalizeText(payload.cover) || '/logo.png';
    const detailCoverUrl = normalizeText(payload.detailCover) || coverUrl;

    const insertResult = await client.query<{ id: number }>(
      `
        INSERT INTO books (
          title,
          subtitle,
          writer,
          book_id,
          subject,
          class_name,
          publish_date,
          cover,
          detail_cover,
          summary,
          dewey_decimal,
          publisher,
          language,
          pages,
          isbn13,
          total_copies
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16
        )
        RETURNING id
      `,
      [
        title,
        normalizeText(payload.subtitle),
        writer,
        bookCode,
        subject,
        className,
        parseHumanDate(normalizeText(payload.publishDate)),
        coverUrl,
        detailCoverUrl,
        normalizeText(payload.summary),
        normalizeText(payload.deweyDecimal),
        normalizeText(payload.publisher),
        normalizeText(payload.language),
        parsePositiveInteger(payload.pages, 0),
        normalizeText(payload.isbn13),
        totalCopies,
      ],
    );

    const createdBookId = insertResult.rows[0]?.id;

    if (!createdBookId) {
      throw new Error('Unable to create the new book.');
    }

    for (let index = 0; index < totalCopies; index += 1) {
      await client.query(
        `
          INSERT INTO book_copies (book_id, copy_code, status, fine_rwf)
          VALUES ($1, $2, 'Available', 0)
        `,
        [createdBookId, `${bookCode}-${copyCodeSuffix(index)}`],
      );
    }

    await client.query('COMMIT');
    return getBookById(createdBookId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateBookById(bookId: number, payload: Record<string, unknown>) {
  const currentBook = await pool.query<BookRow>('SELECT * FROM books WHERE id = $1', [bookId]);
  const existingBook = currentBook.rows[0];

  if (!existingBook) {
    return { book: null, error: 'Book not found.' };
  }

  const requestedTotalCopies = Math.max(parsePositiveInteger(payload.totalCopies, existingBook.total_copies), 1);
  const activeCopies = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM book_copies WHERE book_id = $1 AND status <> 'Available'`,
    [bookId],
  );

  if (requestedTotalCopies < Number(activeCopies.rows[0]?.count ?? 0)) {
    return { book: null, error: 'Cannot reduce total copies below the number of active borrowed copies.' };
  }

  await pool.query(
    `
      UPDATE books
      SET
        title = $2,
        subtitle = $3,
        writer = $4,
        subject = $5,
        class_name = $6,
        publish_date = $7,
        cover = $8,
        detail_cover = $9,
        summary = $10,
        dewey_decimal = $11,
        publisher = $12,
        language = $13,
        pages = $14,
        isbn13 = $15,
        total_copies = $16,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      bookId,
      normalizeText(payload.title) || existingBook.title,
      normalizeText(payload.subtitle) || existingBook.subtitle,
      normalizeText(payload.writer) || existingBook.writer,
      normalizeText(payload.subject) || existingBook.subject,
      normalizeText(payload.className) || existingBook.class_name,
      parseHumanDate(normalizeText(payload.publishDate)) ?? existingBook.publish_date,
      normalizeText(payload.cover) || existingBook.cover,
      normalizeText(payload.detailCover) || existingBook.detail_cover,
      normalizeText(payload.summary) || existingBook.summary,
      normalizeText(payload.deweyDecimal) || existingBook.dewey_decimal,
      normalizeText(payload.publisher) || existingBook.publisher,
      normalizeText(payload.language) || existingBook.language,
      parsePositiveInteger(payload.pages, existingBook.pages),
      normalizeText(payload.isbn13) || existingBook.isbn13,
      requestedTotalCopies,
    ],
  );

  await reconcileBookCopies(bookId, existingBook.book_id, requestedTotalCopies);
  return { book: await getBookById(bookId), error: null };
}

async function reconcileBookCopies(bookId: number, bookCode: string, requestedTotalCopies: number) {
  const copyResult = await pool.query<{ id: number; copy_code: string; status: string }>(
    'SELECT id, copy_code, status FROM book_copies WHERE book_id = $1 ORDER BY copy_code ASC',
    [bookId],
  );

  const currentCopies = copyResult.rows;

  if (requestedTotalCopies === currentCopies.length) {
    return;
  }

  if (requestedTotalCopies > currentCopies.length) {
    for (let index = currentCopies.length; index < requestedTotalCopies; index += 1) {
      await pool.query(
        `
          INSERT INTO book_copies (book_id, copy_code, status, fine_rwf)
          VALUES ($1, $2, 'Available', 0)
        `,
        [bookId, `${bookCode}-${copyCodeSuffix(index)}`],
      );
    }

    return;
  }

  const removableCopies = currentCopies
    .filter((copy) => copy.status === 'Available')
    .sort((left, right) => right.copy_code.localeCompare(left.copy_code));

  const copiesToRemove = currentCopies.length - requestedTotalCopies;

  if (removableCopies.length < copiesToRemove) {
    throw new Error('Not enough available copies to reduce the total copy count safely.');
  }

  for (const copy of removableCopies.slice(0, copiesToRemove)) {
    await pool.query('DELETE FROM book_copies WHERE id = $1', [copy.id]);
  }
}

export async function deleteBookById(bookId: number) {
  const historyRows = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM loan_history WHERE book_id = $1',
    [bookId],
  );

  if (Number(historyRows.rows[0]?.count ?? 0) > 0) {
    return { deleted: false, reason: 'This book already has circulation history and cannot be deleted safely.' };
  }

  const result = await pool.query('DELETE FROM books WHERE id = $1', [bookId]);
  return { deleted: result.rowCount > 0, reason: result.rowCount ? null : 'Book not found.' };
}

export async function getBookHistory(bookId: number) {
  const result = await pool.query<LoanHistoryRow>(
    `
      SELECT
        h.id,
        h.copy_code,
        h.loan_date,
        h.due_date,
        h.returned_date,
        h.status,
        h.fine_rwf,
        u.id AS borrower_id,
        u.full_name AS borrower_name,
        u.roll AS borrower_roll,
        u.student_id AS borrower_student_id,
        u.class_name AS borrower_class_name,
        b.id AS book_id,
        b.title AS book_title,
        b.subject AS book_subject,
        b.cover AS book_cover
      FROM loan_history h
      JOIN books b ON b.id = h.book_id
      LEFT JOIN borrowers u ON u.id = h.borrower_user_id
      WHERE h.book_id = $1
      ORDER BY h.loan_date DESC, h.id DESC
    `,
    [bookId],
  );

  return result.rows.map(serializeLoanHistory);
}

export async function getBorrowings() {
  await refreshOverdueStatuses();

  const result = await pool.query<BorrowingRow>(
    `
      SELECT
        c.id AS copy_row_id,
        c.copy_code,
        c.status,
        c.loan_date,
        c.due_date,
        c.fine_rwf,
        b.id AS book_db_id,
        b.title AS book_title,
        b.subtitle AS book_subtitle,
        b.writer AS book_writer,
        b.book_id AS book_code,
        b.subject AS book_subject,
        b.class_name AS book_class_name,
        b.publish_date AS book_publish_date,
        b.cover AS book_cover,
        b.detail_cover AS book_detail_cover,
        b.summary AS book_summary,
        b.dewey_decimal AS book_dewey_decimal,
        b.publisher AS book_publisher,
        b.language AS book_language,
        b.pages AS book_pages,
        b.isbn13 AS book_isbn13,
        b.total_copies AS book_total_copies,
        u.id AS borrower_id,
        u.full_name AS borrower_name,
        u.class_name AS borrower_class_name
      FROM book_copies c
      JOIN books b ON b.id = c.book_id
      LEFT JOIN borrowers u ON u.id = c.borrower_user_id
      ORDER BY b.id ASC, c.copy_code ASC
    `,
  );

  return result.rows.map(serializeBorrowing);
}

export async function createBorrowing(payload: {
  copyIds: string[];
  borrowerUserId: number;
  loanDate?: string | null;
  dueDate?: string | null;
}) {
  if (!payload.copyIds.length) {
    throw new Error('Select at least one copy to borrow.');
  }

  const loanDate = parseHumanDate(payload.loanDate ?? formatDisplayDate(new Date()) ?? '') ?? new Date().toISOString().slice(0, 10);
  const dueDate = parseHumanDate(payload.dueDate ?? '') ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const borrowerResult = await client.query<{ id: number }>(
      'SELECT id FROM borrowers WHERE id = $1 LIMIT 1',
      [payload.borrowerUserId],
    );

    if (!borrowerResult.rowCount) {
      throw new Error('Borrower not found.');
    }

    for (const copyId of payload.copyIds) {
      const copyRow = await client.query<{ book_id: number; status: string }>(
        'SELECT book_id, status FROM book_copies WHERE copy_code = $1 LIMIT 1',
        [copyId],
      );

      const currentCopy = copyRow.rows[0];

      if (!currentCopy) {
        throw new Error(`Copy ${copyId} does not exist.`);
      }

      if (currentCopy.status !== 'Available') {
        throw new Error(`Copy ${copyId} is not currently available.`);
      }

      await client.query(
        `
          UPDATE book_copies
          SET
            status = 'Borrowed',
            borrower_user_id = $2,
            loan_date = $3,
            due_date = $4,
            fine_rwf = 0,
            updated_at = NOW()
          WHERE copy_code = $1
        `,
        [copyId, payload.borrowerUserId, loanDate, dueDate],
      );

      await client.query(
        `
          INSERT INTO loan_history (
            book_id,
            copy_code,
            borrower_user_id,
            loan_date,
            due_date,
            status,
            fine_rwf
          ) VALUES ($1, $2, $3, $4, $5, 'Borrowed', 0)
          ON CONFLICT (copy_code, borrower_user_id, loan_date) DO NOTHING
        `,
        [currentCopy.book_id, copyId, payload.borrowerUserId, loanDate, dueDate],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return getBorrowings();
}

export async function returnBorrowing(copyId: string) {
  const currentBorrowing = await pool.query<{ borrower_user_id: number | null; loan_date: string | null; status: string }>(
    'SELECT borrower_user_id, loan_date, status FROM book_copies WHERE copy_code = $1',
    [copyId],
  );

  const row = currentBorrowing.rows[0];

  if (!row) {
    throw new Error('Borrowing copy not found.');
  }

  if (row.status === 'Available') {
    throw new Error('That copy has already been returned.');
  }

  await pool.query(
    `
      UPDATE book_copies
      SET
        status = 'Available',
        borrower_user_id = NULL,
        loan_date = NULL,
        due_date = NULL,
        fine_rwf = 0,
        updated_at = NOW()
      WHERE copy_code = $1
    `,
    [copyId],
  );

  if (row.borrower_user_id && row.loan_date) {
    await pool.query(
      `
        UPDATE loan_history
        SET
          status = 'Returned',
          returned_date = CURRENT_DATE
        WHERE copy_code = $1 AND borrower_user_id = $2 AND loan_date = $3
      `,
      [copyId, row.borrower_user_id, row.loan_date],
    );
  }

  return getBorrowings();
}

export async function deleteBorrowing(copyId: string) {
  const copyResult = await pool.query<{ borrower_user_id: number | null; loan_date: string | null }>(
    'SELECT borrower_user_id, loan_date FROM book_copies WHERE copy_code = $1',
    [copyId],
  );

  const currentCopy = copyResult.rows[0];

  if (!currentCopy) {
    return { deleted: false, reason: 'Borrowing copy not found.' };
  }

  await pool.query(
    `
      UPDATE book_copies
      SET
        status = 'Available',
        borrower_user_id = NULL,
        loan_date = NULL,
        due_date = NULL,
        fine_rwf = 0,
        updated_at = NOW()
      WHERE copy_code = $1
    `,
    [copyId],
  );

  if (currentCopy.borrower_user_id && currentCopy.loan_date) {
    await pool.query(
      `
        DELETE FROM loan_history
        WHERE copy_code = $1 AND borrower_user_id = $2 AND loan_date = $3
      `,
      [copyId, currentCopy.borrower_user_id, currentCopy.loan_date],
    );
  }

  return { deleted: true, reason: null };
}

export async function getUserProfile(userId: number) {
  await refreshOverdueStatuses();

  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  const currentBorrowingsResult = await pool.query<BorrowingRow>(
    `
      SELECT
        c.id AS copy_row_id,
        c.copy_code,
        c.status,
        c.loan_date,
        c.due_date,
        c.fine_rwf,
        b.id AS book_db_id,
        b.title AS book_title,
        b.subtitle AS book_subtitle,
        b.writer AS book_writer,
        b.book_id AS book_code,
        b.subject AS book_subject,
        b.class_name AS book_class_name,
        b.publish_date AS book_publish_date,
        b.cover AS book_cover,
        b.detail_cover AS book_detail_cover,
        b.summary AS book_summary,
        b.dewey_decimal AS book_dewey_decimal,
        b.publisher AS book_publisher,
        b.language AS book_language,
        b.pages AS book_pages,
        b.isbn13 AS book_isbn13,
        b.total_copies AS book_total_copies,
        u.id AS borrower_id,
        u.full_name AS borrower_name,
        u.class_name AS borrower_class_name
      FROM book_copies c
      JOIN books b ON b.id = c.book_id
      LEFT JOIN borrowers u ON u.id = c.borrower_user_id
      WHERE c.borrower_user_id = $1 AND c.status <> 'Available'
      ORDER BY c.loan_date DESC NULLS LAST
    `,
    [userId],
  );

  const fineResult = await pool.query<FineRow>(
    'SELECT * FROM fine_records WHERE user_id = $1 ORDER BY date_accrued DESC, id DESC',
    [userId],
  );

  const historyResult = await pool.query<LoanHistoryRow>(
    `
      SELECT
        h.id,
        h.copy_code,
        h.loan_date,
        h.due_date,
        h.returned_date,
        h.status,
        h.fine_rwf,
        u.id AS borrower_id,
        u.full_name AS borrower_name,
        u.roll AS borrower_roll,
        u.student_id AS borrower_student_id,
        u.class_name AS borrower_class_name,
        b.id AS book_id,
        b.title AS book_title,
        b.subject AS book_subject,
        b.cover AS book_cover
      FROM loan_history h
      JOIN books b ON b.id = h.book_id
      LEFT JOIN borrowers u ON u.id = h.borrower_user_id
      WHERE h.borrower_user_id = $1
      ORDER BY h.loan_date DESC, h.id DESC
    `,
    [userId],
  );

  return {
    user,
    currentBorrowings: currentBorrowingsResult.rows.map(serializeBorrowing),
    fineHistory: fineResult.rows.map(serializeFine),
    borrowHistory: historyResult.rows.map(serializeLoanHistory),
  };
}

export function getStaffProfile() {
  return {
    name: config.librarianName,
    role: config.librarianRole,
  };
}
