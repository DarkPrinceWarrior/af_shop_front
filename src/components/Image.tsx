import { useState } from 'react';
import { resolveMediaUrl } from '@/api/client';
import { cn } from '@/lib/utils';

interface ImageProps {
  path: string | null | undefined;
  alt: string;
  fallbackLabel: string;
  className?: string;
}

export function ProductImage({ path, alt, fallbackLabel, className }: ImageProps) {
  const [errored, setErrored] = useState(false);
  const url = resolveMediaUrl(path ?? null);
  const showPlaceholder = !url || errored;
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-muted aspect-[4/3]',
        className,
      )}
    >
      {!showPlaceholder && (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="block h-full w-full object-cover"
        />
      )}
      {showPlaceholder && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-xs text-muted-foreground',
            'bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_10px,oklch(0.93_0.005_90)_10px,oklch(0.93_0.005_90)_20px)]',
          )}
          aria-label={fallbackLabel}
        >
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}
