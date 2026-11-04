'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { sfx } from '../sfx';
import { buttonVariants, type ButtonProps } from './button';

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

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'>,
    Pick<ButtonProps, 'variant' | 'size' | 'enableSfx'> {
  href: string;
  external?: boolean;
}

/**
 * A link that carries the button variant contract. Apps need this because
 * `Button asChild` around a link component would otherwise stack `mw-link`
 * chrome onto `mw-button` chrome.
 */
export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant, size, enableSfx = true, external, target, rel, children, onClick, ...props }, ref) => {
    const isExternal = external ?? (typeof target === 'string' && target !== '_self');
    const relValue = rel ?? (isExternal ? 'noopener noreferrer' : undefined);

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (enableSfx) {
        if (variant === 'destructive') sfx.revoke();
        else sfx.click();
      }
      onClick?.(event);
    };

    return (
      <a
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        target={isExternal ? '_blank' : target}
        rel={relValue}
        onClick={handleClick}
        {...props}
      >
        {children}
        {isExternal && (
          <span className="mw-sr-only">Opens in a new tab.</span>
        )}
      </a>
    );
  }
);
LinkButton.displayName = 'LinkButton';
