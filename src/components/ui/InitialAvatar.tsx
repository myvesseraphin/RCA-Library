import { cn } from '../../lib/utils';

const sharedAvatarStyle = 'bg-brand-primary/15 text-brand-primary border border-brand-primary/10';

export function InitialAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const letter = name.trim().charAt(0).toUpperCase() || 'L';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold uppercase',
        sharedAvatarStyle,
        className,
      )}
    >
      {letter}
    </div>
  );
}
