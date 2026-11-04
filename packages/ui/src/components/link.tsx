'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  underline?: boolean;
  current?: boolean;
  asChild?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, external, underline = false, current, asChild = false, target, rel, children, ...props }, ref) => {
    const isExternal = external ?? (typeof target === 'string' && target !== '_self');
    // A new-tab link without noopener lets the target rewrite window.opener.
    const relValue = rel ?? (isExternal ? 'noopener noreferrer' : undefined);
    const ariaCurrent = current ? 'page' : props['aria-current'];
    const linkClass = cn('mw-link', underline && 'mw-link--underline', className);

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<
        Record<string, unknown> & { className?: string }
      >;
      return React.cloneElement(child, {
        ...props,
        ref,
        className: cn('mw-link', underline && 'mw-link--underline', child.props.className, className),
        'aria-current': ariaCurrent,
        rel: relValue,
      });
    }

    return (
      <a
        ref={ref}
        className={linkClass}
        target={target}
        rel={relValue}
        {...props}
        aria-current={ariaCurrent}
      >
        {children}
        {isExternal && (
          <span className="mw-sr-only">Opens in a new tab.</span>
        )}
      </a>
    );
  }
);
Link.displayName = 'Link';
