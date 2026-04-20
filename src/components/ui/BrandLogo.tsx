import { appBrand } from '../../lib/seed';
import { cn } from '../../lib/utils';

export function BrandLogo({
  className,
  imageClassName,
  titleClassName,
  subtitleClassName,
}: {
  className?: string;
  imageClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={appBrand.logoSrc}
        alt={`${appBrand.name} logo`}
        className={cn('h-12 w-auto object-contain', imageClassName)}
      />
      <div>
        <p className={cn('text-xl font-bold tracking-tight text-brand-primary', titleClassName)}>
          {appBrand.name}
        </p>
        {appBrand.subtitle ? (
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-muted', subtitleClassName)}>
            {appBrand.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
