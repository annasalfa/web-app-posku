'use client';

import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import {LoaderCircle} from 'lucide-react';

import {cn} from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
        secondary:
          'border border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-accent hover:text-accent-foreground',
        outline:
          'border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground',
        ghost:
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      },
      size: {
        default: 'h-14 px-5 text-[15px]',
        sm: 'h-11 rounded-[var(--radius-standard)] px-4 text-sm',
        lg: 'h-16 rounded-[var(--radius-large)] px-6 text-base',
        icon: 'size-12 rounded-[var(--radius-standard)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, asChild = false, loading = false, children, disabled, ...props}, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({variant, size, className}))}
        aria-busy={loading || props['aria-busy']}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export {Button, buttonVariants};
