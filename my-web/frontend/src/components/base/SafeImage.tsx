/**
 * SafeImage Component
 * Base component that wraps next/image to prevent runtime crashes caused by loading images from non-whitelisted domains.
 * Automatically falls back to standard <img> tag if the domain is not whitelisted, and to a vector placeholder on error.
 *
 * Related: next.config.ts, src/app/globals.css
 * Pattern: Wrapper component with validation and fallback
 */

'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const WHITELISTED_DOMAINS = [
  'localhost',
  'res.cloudinary.com',
  'picsum.photos',
  'images.unsplash.com',
  'cdn.tgdd.vn',
  'cdnv2.tgdd.vn',
];

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

function checkIsExternal(srcStr: string): boolean {
  const normalizedSrc = normalizeSrc(srcStr);
  if (normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://')) {
    try {
      const url = new URL(normalizedSrc);
      const domain = url.hostname;
      return !WHITELISTED_DOMAINS.some(
        (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
      );
    } catch {
      return true;
    }
  }
  return false;
}

function normalizeSrc(src: string): string {
  return src.startsWith('//') ? `https:${src}` : src;
}

function isWhitelistedExternal(src: string): boolean {
  return Boolean(src) && !checkIsExternal(src) && /^https?:\/\//.test(normalizeSrc(src));
}

export default function SafeImage({
  src,
  alt,
  referrerPolicy,
  fallbackSrc = '/placeholder-phone.svg',
  ...props
}: SafeImageProps) {
  const srcStr = typeof src === 'string' ? normalizeSrc(src.trim()) : '';
  const initialUseHtmlImg = checkIsExternal(srcStr);
  const useUnoptimizedImage = isWhitelistedExternal(srcStr);

  const [hasError, setHasError] = useState<boolean>(false);
  const [overrideSrc, setOverrideSrc] = useState<string | null>(null);
  const [useHtmlImg, setUseHtmlImg] = useState<boolean>(initialUseHtmlImg);

  const currentSrc = overrideSrc ?? (srcStr || fallbackSrc);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setOverrideSrc(fallbackSrc);
      setUseHtmlImg(true);
    }
  };

  if (useHtmlImg || !currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={alt || 'Phone image'}
        onError={handleError}
        referrerPolicy={referrerPolicy ?? 'no-referrer'}
        style={{
          objectFit: (props.style?.objectFit as React.CSSProperties['objectFit']) || 'cover',
          width: props.fill ? '100%' : props.width,
          height: props.fill ? '100%' : props.height,
        }}
        className={props.className}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt || 'Phone image'}
      onError={handleError}
      referrerPolicy={referrerPolicy ?? 'no-referrer'}
      unoptimized={useUnoptimizedImage}
      {...props}
    />
  );
}
