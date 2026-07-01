import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { handleInternalLinkClick, useClientRouter } from './client-router';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export default function Link({ href, onClick, children, ...props }: LinkProps) {
  const router = useClientRouter();

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        handleInternalLinkClick(event, href, router.navigate);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
