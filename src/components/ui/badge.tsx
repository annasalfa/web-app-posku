import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
  {
    variants: {
      variant: {
        neutral: 'border-transparent bg-muted text-muted-foreground',
        success: 'border-transparent bg-success/12 text-success',
        warning: 'border-transparent bg-warning/14 text-warning',
        danger: 'border-transparent bg-destructive/12 text-destructive',
        info: 'border-transparent bg-info/12 text-info',
        outline: 'border-border bg-transparent text-foreground',
        cash: 'border-transparent bg-success/14 text-success',
        transfer: 'border-transparent bg-primary/14 text-primary',
        qris: 'border-transparent bg-qris/14 text-qris',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({variant}), className)} {...props} />
  );
}

export {Badge, badgeVariants};
