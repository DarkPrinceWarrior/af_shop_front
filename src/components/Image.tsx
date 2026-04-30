import { useState } from 'react';
import { resolveMediaUrl } from '@/api/client';

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
    <div className={className ?? 'product-image'}>
      {!showPlaceholder && (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
        />
      )}
      {showPlaceholder && (
        <div className="product-image-placeholder" aria-label={fallbackLabel}>
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}
