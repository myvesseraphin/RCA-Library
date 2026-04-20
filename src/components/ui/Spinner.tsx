import { cn } from '../../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-brand-primary/20 border-t-brand-primary',
        className,
      )}
    />
  );
}
