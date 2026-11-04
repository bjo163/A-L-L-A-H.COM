import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel = 'Close',
  className,
}: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = description ? `${titleId}-description` : undefined;

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleDismiss = () => onOpenChange(false);
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      onOpenChange(false);
    };

    dialog.addEventListener('close', handleDismiss);
    dialog.addEventListener('click', handleBackdropClick);
    return () => {
      dialog.removeEventListener('close', handleDismiss);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [onOpenChange]);

  return (
    <dialog
      ref={dialogRef}
      className={cn('mw-dialog', className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="mw-dialog__panel">
        <header className="mw-dialog__header">
          <h2 className="mw-dialog__title" id={titleId}>
            {title}
          </h2>
          {description && (
            <p className="mw-dialog__description" id={descriptionId}>
              {description}
            </p>
          )}
        </header>
        {children && <div className="mw-dialog__body">{children}</div>}
        <footer className="mw-dialog__footer">
          {footer ?? (
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {closeLabel}
            </Button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
