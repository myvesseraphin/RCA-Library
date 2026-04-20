import { ImagePlus } from 'lucide-react';
import { cn } from '../../lib/utils';

function hasBookCover(src?: string | null) {
  return Boolean(src && src.trim() && src !== '/logo.png');
}

export function BookCoverArtwork({
  src,
  alt,
  className,
  compact = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  compact?: boolean;
}) {
  if (hasBookCover(src)) {
    return (
      <img
        src={src ?? undefined}
        alt={alt}
        className={cn('h-full w-full object-cover', className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={cn(
      'flex h-full w-full items-center justify-center rounded-[inherit] bg-gradient-to-br from-brand-secondary via-white to-brand-secondary/70 text-brand-primary',
      className,
    )}>
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
          <ImagePlus className={cn(compact ? 'h-4 w-4' : 'h-7 w-7')} />
        </div>
        {!compact ? (
          <p className="text-xs font-medium text-brand-muted">Upload cover image</p>
        ) : null}
      </div>
    </div>
  );
}
