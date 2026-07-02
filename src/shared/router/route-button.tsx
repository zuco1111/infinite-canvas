'use client';

import { Button, type ButtonProps } from 'antd';

import { handleInternalLinkClick, useClientHref, useClientRouter } from './client-router-state';

type RouteButtonProps = Omit<ButtonProps, 'href'> & {
  href: string;
};

export function RouteButton({ href, onClick, ...props }: RouteButtonProps) {
  const router = useClientRouter();
  const clientHref = useClientHref(href);

  return (
    <Button
      {...props}
      href={clientHref}
      onClick={(event) => {
        onClick?.(event);
        handleInternalLinkClick(event, href, router.navigate);
      }}
    />
  );
}
