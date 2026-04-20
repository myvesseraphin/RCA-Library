import type {
  SeedBook,
  SeedBorrowing,
  SeedFineRecord,
  SeedUser,
} from './seed';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AUTH_TOKEN_STORAGE_KEY = 'library.auth.token';
const AUTH_UNAUTHORIZED_EVENT = 'library:auth-unauthorized';

type DashboardStat = {
  label: string;
  value: string;
  trend: string | null;
  bg: string;
  text: string;
};

type TrendPoint = {
  name: string;
  value: number;
};

type CategoryPoint = {
  name: string;
  value: number;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type UserMutationPayload = {
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  dob: string;
  religion: string;
  classLevel: string;
  section: string;
  roll: string;
  admissionDate: string;
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  secondaryEmail: string;
  address: string;
  streetAddress: string;
  houseName: string;
  houseNumber: string;
};

export type BookMutationPayload = {
  title: string;
  subtitle: string;
  subject: string;
  writer: string;
  bookId: string;
  deweyDecimal: string;
  publishDate: string;
  publisher: string;
  language: string;
  pages: number;
  isbn13: string;
  totalCopies: number;
  className: string;
  cover: string;
  detailCover: string;
  summary: string;
};

export type DashboardBorrower = {
  id: number;
  name: string;
  studentId: string;
  percent: string;
  className: string;
  selected: boolean;
};

export type DashboardData = {
  staffProfile: {
    name: string;
    role: string;
  };
  welcomeName: string;
  stats: DashboardStat[];
  attendanceTrend: TrendPoint[];
  topBorrowedCategories: CategoryPoint[];
  recentBorrowers: DashboardBorrower[];
  quickActions: Array<{
    id: string;
    label: string;
    path: string;
  }>;
};

export type BorrowingRecord = SeedBorrowing & {
  copyId: string;
  book: SeedBook;
  borrowerLabel: string;
};

export type UserProfileData = {
  user: SeedUser;
  currentBorrowings: BorrowingRecord[];
  fineHistory: SeedFineRecord[];
  borrowHistory: Array<{
    id: number;
    copyId: string;
    borrower: string;
    borrowerClassName?: string | null;
    roll: string;
    studentId: string;
    loanDate: string | null;
    dueDate: string | null;
    returnedDate: string | null;
    status: 'Borrowed' | 'Returned';
    fineRwf: number;
    bookId: number;
    bookTitle: string;
    subject: string;
    bookCover: string;
  }>;
};

export type BookDetailsData = {
  book: SeedBook;
  availableCopies: number;
  borrowedCopies: number;
  currentBorrowers: UserProfileData['borrowHistory'];
  historyPreview: UserProfileData['borrowHistory'];
};

export type BookCoverUploadResponse = {
  path: string;
  publicUrl: string;
};

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

function dispatchUnauthorizedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }
}

export function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function storeAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearStoredAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function subscribeToUnauthorized(handler: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });
}

async function request<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? undefined);
  const token = getStoredAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Request failed.' }));

    if (response.status === 401) {
      clearStoredAuthToken();
      dispatchUnauthorizedEvent();
      throw new UnauthorizedError(errorBody.message || 'Authentication required.');
    }

    throw new Error(errorBody.message || 'Request failed.');
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request<null>('/auth/logout', {
      method: 'POST',
    });
  },
  getCurrentUser() {
    return request<AuthUser>('/auth/me');
  },
  async uploadBookCover(file: File) {
    const dataUrl = await readFileAsDataUrl(file);

    return request<BookCoverUploadResponse>('/uploads/book-cover', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        dataUrl,
      }),
    });
  },
  getDashboard() {
    return request<DashboardData>('/dashboard');
  },
  getUsers() {
    return request<SeedUser[]>('/users');
  },
  createUser(payload: UserMutationPayload) {
    return request<SeedUser>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getUser(id: number | string) {
    return request<SeedUser>(`/users/${id}`);
  },
  updateUser(id: number | string, payload: UserMutationPayload) {
    return request<SeedUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteUser(id: number | string) {
    return request<null>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
  getUserProfile(id: number | string) {
    return request<UserProfileData>(`/users/${id}/profile`);
  },
  getBooks() {
    return request<SeedBook[]>('/books');
  },
  createBook(payload: BookMutationPayload) {
    return request<BookDetailsData>('/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getBook(id: number | string) {
    return request<BookDetailsData>(`/books/${id}`);
  },
  updateBook(id: number | string, payload: BookMutationPayload) {
    return request<BookDetailsData>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteBook(id: number | string) {
    return request<null>(`/books/${id}`, {
      method: 'DELETE',
    });
  },
  getBookHistory(id: number | string) {
    return request<UserProfileData['borrowHistory']>(`/books/${id}/history`);
  },
  getBorrowings() {
    return request<BorrowingRecord[]>('/borrowings');
  },
  createBorrowing(payload: {
    copyIds: string[];
    borrowerUserId: number;
    loanDate?: string | null;
    dueDate?: string | null;
  }) {
    return request<BorrowingRecord[]>('/borrowings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  returnBorrowing(copyId: string) {
    return request<BorrowingRecord[]>(`/borrowings/${copyId}/return`, {
      method: 'POST',
    });
  },
  deleteBorrowing(copyId: string) {
    return request<null>(`/borrowings/${copyId}`, {
      method: 'DELETE',
    });
  },
};
