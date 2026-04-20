import { Router, type NextFunction, type Request, type Response } from 'express';
import {
  type AuthenticatedRequest,
  loginStaff,
  requestPasswordReset,
  requireAuth,
  resetPassword,
  verifyPasswordResetCode,
} from './auth.ts';
import {
  createBorrowing,
  createBook,
  createUser,
  deleteBookById,
  deleteBorrowing,
  deleteUserById,
  getAllBooks,
  getAllUsers,
  getBookById,
  getBookHistory,
  getBorrowings,
  getDashboardData,
  payFineRecord,
  renewBorrowing,
  getUserById,
  getUserProfile,
  returnBorrowing,
  updateBookById,
  updateUserById,
} from './library-store.ts';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notification-store.ts';
import { uploadBookCoverToSupabase } from './supabase-storage.ts';

type AsyncRouteHandler = (request: Request, response: Response, next: NextFunction) => Promise<void>;

function asyncHandler(handler: AsyncRouteHandler) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

export const apiRouter = Router();

apiRouter.get('/health', asyncHandler(async (_request, response) => {
  response.json({
    status: 'ok',
    service: 'library-api',
  });
}));

apiRouter.post('/auth/login', asyncHandler(async (request, response) => {
  const session = await loginStaff(String(request.body?.email ?? ''), String(request.body?.password ?? ''));

  if (!session) {
    response.status(401).json({ message: 'Invalid email or password.' });
    return;
  }

  response.json(session);
}));

apiRouter.post('/auth/password-reset/request', asyncHandler(async (request, response) => {
  response.json(await requestPasswordReset(String(request.body?.email ?? '')));
}));

apiRouter.post('/auth/password-reset/verify', asyncHandler(async (request, response) => {
  response.json(await verifyPasswordResetCode(
    String(request.body?.email ?? ''),
    String(request.body?.code ?? ''),
  ));
}));

apiRouter.post('/auth/password-reset/complete', asyncHandler(async (request, response) => {
  response.json(await resetPassword(
    String(request.body?.resetToken ?? ''),
    String(request.body?.password ?? ''),
  ));
}));

apiRouter.use(requireAuth);

apiRouter.get('/auth/me', asyncHandler(async (request, response) => {
  response.json((request as AuthenticatedRequest).authUser);
}));

apiRouter.post('/auth/logout', asyncHandler(async (_request, response) => {
  response.status(204).send();
}));

apiRouter.get('/staff', asyncHandler(async (request, response) => {
  response.json((request as AuthenticatedRequest).authUser);
}));

apiRouter.post('/uploads/book-cover', asyncHandler(async (request, response) => {
  response.status(201).json(await uploadBookCoverToSupabase({
    fileName: String(request.body?.fileName ?? ''),
    dataUrl: String(request.body?.dataUrl ?? ''),
  }));
}));

apiRouter.get('/dashboard', asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser;
  response.json(await getDashboardData({
    name: authUser.name,
    role: authUser.role,
  }));
}));

apiRouter.get('/notifications', asyncHandler(async (_request, response) => {
  response.json(await getNotifications());
}));

apiRouter.post('/notifications/read-all', asyncHandler(async (_request, response) => {
  await markAllNotificationsAsRead();
  response.status(204).send();
}));

apiRouter.post('/notifications/:id/read', asyncHandler(async (request, response) => {
  const notification = await markNotificationAsRead(Number(request.params.id));

  if (!notification) {
    response.status(404).json({ message: 'Notification not found.' });
    return;
  }

  response.json(notification);
}));

apiRouter.get('/users', asyncHandler(async (_request, response) => {
  response.json(await getAllUsers());
}));

apiRouter.post('/users', asyncHandler(async (request, response) => {
  response.status(201).json(await createUser(request.body ?? {}));
}));

apiRouter.get('/users/:id', asyncHandler(async (request, response) => {
  const user = await getUserById(Number(request.params.id));

  if (!user) {
    response.status(404).json({ message: 'User not found.' });
    return;
  }

  response.json(user);
}));

apiRouter.get('/users/:id/profile', asyncHandler(async (request, response) => {
  const profile = await getUserProfile(Number(request.params.id));

  if (!profile) {
    response.status(404).json({ message: 'User profile not found.' });
    return;
  }

  response.json(profile);
}));

apiRouter.put('/users/:id', asyncHandler(async (request, response) => {
  const user = await updateUserById(Number(request.params.id), request.body ?? {});

  if (!user) {
    response.status(404).json({ message: 'User not found.' });
    return;
  }

  response.json(user);
}));

apiRouter.delete('/users/:id', asyncHandler(async (request, response) => {
  const result = await deleteUserById(Number(request.params.id));

  if (!result.deleted) {
    response.status(409).json({ message: result.reason });
    return;
  }

  response.status(204).send();
}));

apiRouter.get('/books', asyncHandler(async (_request, response) => {
  response.json(await getAllBooks());
}));

apiRouter.post('/books', asyncHandler(async (request, response) => {
  response.status(201).json(await createBook(request.body ?? {}));
}));

apiRouter.get('/books/:id', asyncHandler(async (request, response) => {
  const book = await getBookById(Number(request.params.id));

  if (!book) {
    response.status(404).json({ message: 'Book not found.' });
    return;
  }

  response.json(book);
}));

apiRouter.get('/books/:id/history', asyncHandler(async (request, response) => {
  response.json(await getBookHistory(Number(request.params.id)));
}));

apiRouter.put('/books/:id', asyncHandler(async (request, response) => {
  const result = await updateBookById(Number(request.params.id), request.body ?? {});

  if (result.error) {
    response.status(409).json({ message: result.error });
    return;
  }

  response.json(result.book);
}));

apiRouter.delete('/books/:id', asyncHandler(async (request, response) => {
  const result = await deleteBookById(Number(request.params.id));

  if (!result.deleted) {
    response.status(409).json({ message: result.reason });
    return;
  }

  response.status(204).send();
}));

apiRouter.get('/borrowings', asyncHandler(async (_request, response) => {
  response.json(await getBorrowings());
}));

apiRouter.post('/borrowings', asyncHandler(async (request, response) => {
  response.status(201).json(await createBorrowing(request.body));
}));

apiRouter.post('/borrowings/:copyId/return', asyncHandler(async (request, response) => {
  response.json(await returnBorrowing(request.params.copyId));
}));

apiRouter.post('/borrowings/:copyId/renew', asyncHandler(async (request, response) => {
  response.json(await renewBorrowing(request.params.copyId));
}));

apiRouter.delete('/borrowings/:copyId', asyncHandler(async (request, response) => {
  const result = await deleteBorrowing(request.params.copyId);

  if (!result.deleted) {
    response.status(404).json({ message: result.reason });
    return;
  }

  response.status(204).send();
}));

apiRouter.post('/users/:id/fines/:fineId/pay', asyncHandler(async (request, response) => {
  response.json(await payFineRecord(Number(request.params.id), request.params.fineId));
}));
