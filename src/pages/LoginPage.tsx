import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, User } from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { useAuth } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(380px,38%)_1fr]">
        <section className="relative z-10 flex items-center justify-center bg-white px-8 py-12 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[360px]">
            <Link to="/" className="inline-flex">
              <BrandLogo
                imageClassName="h-14"
                titleClassName="text-[2rem] font-extrabold uppercase tracking-[0.08em] leading-none text-brand-text"
                subtitleClassName="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-brand-muted"
              />
            </Link>

            <div className="mt-14">
              <h1 className="text-[2rem] font-bold tracking-[-0.03em] text-brand-text">Login to your account</h1>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <p className="rounded-[10px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <label className="relative block">
                  <span className="sr-only">Username or Email</span>
                  <span className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-brand-secondary text-brand-primary/60">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Username or Email"
                    autoComplete="email"
                    className="h-14 w-full rounded-[10px] border border-brand-secondary bg-white pl-14 pr-4 text-[0.95rem] text-brand-text shadow-[0_16px_30px_rgba(82,24,165,0.08)] outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10"
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">Password</span>
                  <span className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-brand-secondary text-brand-primary/60">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="h-14 w-full rounded-[10px] border border-brand-secondary bg-white pl-14 pr-4 text-[0.95rem] text-brand-text shadow-[0_16px_30px_rgba(82,24,165,0.08)] outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10"
                  />
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-brand-text transition hover:text-brand-primary"
                >
                  Forget password?
                </button>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 min-w-[126px] items-center justify-center rounded-[8px] bg-brand-primary px-7 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(82,24,165,0.22)] transition hover:bg-brand-hover"
                  >
                    {isSubmitting ? 'Signing in...' : 'Login'}
                  </button>
                </div>

                <p className="text-xs leading-5 text-brand-muted">
                  Admin account: <code>irasubizasalynelson@gmail.com</code> / <code>nelson 250!</code>
                </p>
              </form>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-brand-secondary/45 lg:flex lg:items-center lg:justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 620 1000"
            preserveAspectRatio="none"
            className="absolute inset-y-0 left-0 h-full w-[44%] min-w-[18rem]"
          >
            <path
              d="M0 0H530C505 120 470 220 408 350C338 500 270 680 214 1000H0V0Z"
              fill="white"
            />
          </svg>
          <div
            aria-hidden="true"
            className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-brand-primary/8 blur-3xl"
          />
          <div className="relative z-10 flex h-full w-full items-center justify-center px-10 py-12 xl:px-16">
            <img
              src="/login.png"
              alt="Students studying on top of books"
              className="w-full max-w-[760px] object-contain"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
