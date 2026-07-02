'use client';

import type { CSSProperties } from 'react';

import { publicAssetPath } from '@/lib/public-assets';
import { cn } from '@/lib/utils';

const ZUCO_URL = 'https://api.zuco.ai/';

type ZucoLinkProps = {
  className?: string;
  style?: CSSProperties;
};

export function ZucoLink({ className, style }: ZucoLinkProps) {
  return (
    <a
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full transition hover:opacity-80',
        className,
      )}
      style={style}
      href={ZUCO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Zuco"
      title="Zuco"
    >
      <img
        src={publicAssetPath('/zuco-brand.png')}
        alt=""
        className="size-full rounded-full object-cover"
        draggable={false}
      />
    </a>
  );
}
