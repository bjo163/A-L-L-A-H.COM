import * as React from 'react';
import { cn } from '../lib/utils';

export type TableScrollProps = React.HTMLAttributes<HTMLDivElement>;

export const TableScroll = React.forwardRef<HTMLDivElement, TableScrollProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mw-table-scroll', className)} data-slot="table-scroll" {...props} />
  )
);
TableScroll.displayName = 'TableScroll';

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn('mw-table', className)} data-slot="table" {...props} />
  )
);
Table.displayName = 'Table';

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mw-table__caption', className)} data-slot="table-caption" {...props} />
  )
);
TableCaption.displayName = 'TableCaption';

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('mw-table__head', className)} data-slot="table-header" {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('mw-table__body', className)} data-slot="table-body" {...props} />
  )
);
TableBody.displayName = 'TableBody';

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('mw-table__row', className)} data-slot="table-row" {...props} />
  )
);
TableRow.displayName = 'TableRow';

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, scope = 'col', ...props }, ref) => (
    <th ref={ref} scope={scope} className={cn('mw-table__th', className)} data-slot="table-head" {...props} />
  )
);
TableHead.displayName = 'TableHead';

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('mw-table__td', className)} data-slot="table-cell" {...props} />
  )
);
TableCell.displayName = 'TableCell';
