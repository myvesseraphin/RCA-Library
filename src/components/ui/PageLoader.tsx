import { Spinner } from './Spinner';

export function PageLoader({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div className={fullScreen ? 'flex min-h-screen items-center justify-center bg-brand-bg' : 'flex min-h-[16rem] items-center justify-center'}>
      <div className="rounded-full bg-white/80 p-5 shadow-sm backdrop-blur">
        <Spinner />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
