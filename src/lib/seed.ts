export const appBrand = {
  name: 'Library',
  subtitle: '',
  logoSrc: '/logo.png',
};

export type SeedUser = {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  classLevel: string;
  section: string;
  className: string;
  roll: string;
  studentId: string;
  admissionDate: string | null;
  primaryPhone: string;
  primaryEmail: string;
  address: string;
  borrowScore: number;
  lifetimeBorrowed: number;
  overdueEvents: number;
  totalFinesPaidRwf: number;
  totalFinesOwedRwf: number;
  selected?: boolean;
};

export type SeedBook = {
  id: number;
  title: string;
  subtitle: string;
  writer: string;
  bookId: string;
  subject: string;
  className: string;
  publishDate: string | null;
  cover: string;
  detailCover: string;
  summary: string;
  deweyDecimal: string;
  publisher: string;
  language: string;
  pages: number;
  isbn13: string;
  totalCopies: number;
  selected?: boolean;
};

export type BorrowingStatus = 'Borrowed' | 'Overdue' | 'Available';

export type SeedBorrowing = {
  id: number;
  bookId: number;
  copyId: string;
  borrowerUserId: number | null;
  loanDate: string | null;
  dueDate: string | null;
  fineRwf: number;
  status: BorrowingStatus;
  selected?: boolean;
};

export type SeedLoanHistory = {
  id: number;
  bookId: number;
  copyId: string;
  borrowerUserId: number;
  loanDate: string;
  dueDate: string;
  status: 'Borrowed' | 'Returned';
  fineRwf?: number;
};

export type SeedFineRecord = {
  id: string;
  userId: number;
  bookId: number;
  type: string;
  dateAccrued: string | null;
  amountRwf: number;
  amountOwedRwf: number;
};

export function formatRwf(amount: number) {
  return `RWF ${amount.toLocaleString()}`;
}

export function formatFine(amount: number) {
  return amount > 0 ? formatRwf(amount) : 'None';
}
