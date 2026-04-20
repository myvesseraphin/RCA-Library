import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { OtpInput } from '../components/ui/OtpInput';
import { Spinner } from '../components/ui/Spinner';
import { api, type PasswordResetRequestResponse } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

type ResetStep = 'email' | 'verify' | 'reset';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const announceResetCodeDelivery = (response: PasswordResetRequestResponse, resend = false) => {
    if (response.delivery === 'email') {
      toast.success(resend ? 'A new reset code has been sent to your email.' : 'Your reset code has been sent to your email.');
      return;
    }

    if (response.debugCode) {
      toast.info(`Email is not configured yet. Use this code: ${response.debugCode}`, 'Development mode');
      return;
    }

    toast.info('Email is not configured yet. Check the server logs for the reset code.', 'Development mode');
  };

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await api.requestPasswordReset({ email });
      setStep('verify');
      announceResetCodeDelivery(response);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to start the reset flow.', 'Request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await api.verifyPasswordResetCode({ email, code });
      setResetToken(response.resetToken);
      setStep('reset');
      toast.success('Code verified. Choose your new password.');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to verify that code.', 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('The two passwords do not match.', 'Password mismatch');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.resetPassword({ resetToken, password });
      toast.success('Password changed successfully. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Unable to reset the password.', 'Reset failed');
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
                title="library"
                titleClassName="text-[1.85rem] font-black lowercase tracking-[0.02em] leading-none text-brand-text"
                subtitleClassName="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-brand-muted"
              />
            </Link>

            <div className="mt-14">
              <div className="mb-7">
                <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.03em] text-brand-text">
                  {step === 'email' ? 'Forgot your password?' : step === 'verify' ? 'Enter the 6-digit code' : 'Reset password'}
                </h1>
              </div>

              {step === 'email' ? (
                <form className="space-y-5" onSubmit={handleRequestCode} autoComplete="off">
                  <label className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-brand-secondary text-brand-primary/60">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email address"
                      autoComplete="off"
                      className="h-14 w-full rounded-[10px] border border-brand-secondary bg-white pl-14 pr-4 text-[0.95rem] text-brand-text shadow-[0_16px_30px_rgba(82,24,165,0.08)] outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-[8px] bg-brand-primary px-7 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(82,24,165,0.22)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isSubmitting ? <Spinner className="h-4 w-4 border-2 border-white/30 border-t-white" /> : null}
                    <span>{isSubmitting ? 'Sending...' : 'Continue'}</span>
                  </button>
                </form>
              ) : null}

              {step === 'verify' ? (
                <form className="space-y-6" onSubmit={handleVerifyCode} autoComplete="off">
                  <OtpInput value={code} onChange={setCode} />

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setCode('');
                        setStep('email');
                      }}
                      className="font-medium text-brand-text transition hover:text-brand-primary"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setIsSubmitting(true);
                          const response = await api.requestPasswordReset({ email });
                          announceResetCodeDelivery(response, true);
                        } catch (reason) {
                          toast.error(reason instanceof Error ? reason.message : 'Unable to resend the code.');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="font-medium text-brand-primary transition hover:text-brand-hover"
                    >
                      Resend code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || code.length !== 6}
                    className="inline-flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-[8px] bg-brand-primary px-7 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(82,24,165,0.22)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isSubmitting ? <Spinner className="h-4 w-4 border-2 border-white/30 border-t-white" /> : null}
                    <span>{isSubmitting ? 'Checking...' : 'Verify code'}</span>
                  </button>
                </form>
              ) : null}

              {step === 'reset' ? (
                <form className="space-y-5" onSubmit={handleResetPassword} autoComplete="off">
                  <label className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-brand-secondary text-brand-primary/60">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="New password"
                      autoComplete="off"
                      className="h-14 w-full rounded-[10px] border border-brand-secondary bg-white pl-14 pr-4 text-[0.95rem] text-brand-text shadow-[0_16px_30px_rgba(82,24,165,0.08)] outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </label>

                  <label className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-brand-secondary text-brand-primary/60">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="off"
                      className="h-14 w-full rounded-[10px] border border-brand-secondary bg-white pl-14 pr-4 text-[0.95rem] text-brand-text shadow-[0_16px_30px_rgba(82,24,165,0.08)] outline-none transition placeholder:text-brand-muted/70 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-[8px] bg-brand-primary px-7 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(82,24,165,0.22)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isSubmitting ? <Spinner className="h-4 w-4 border-2 border-white/30 border-t-white" /> : null}
                    <span>{isSubmitting ? 'Updating...' : 'Reset password'}</span>
                  </button>
                </form>
              ) : null}

              <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-text transition hover:text-brand-primary">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
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
