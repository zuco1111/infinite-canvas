import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { handleInternalLinkClick, useClientHref, useClientRouter } from './client-router-state';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export default function Link({ href, onClick, children, ...props }: LinkProps) {
  const router = useClientRouter();
  const clientHref = useClientHref(href);

  return (
    <a
      href={clientHref}
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
