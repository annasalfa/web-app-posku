import {cn} from '@/lib/utils/cn';

import * as React from 'react';

function Card({className, ...props}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-card)] border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 p-5 md:p-6', className)}
      {...props}
    />
  );
}

function CardTitle({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-[clamp(1.125rem,2vw,1.5rem)] font-bold tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({className, ...props}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm leading-6 text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({className, ...props}: React.ComponentProps<'div'>) {
  return <div className={cn('p-5 pt-0 md:p-6 md:pt-0', className)} {...props} />;
}

function CardFooter({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-3 p-5 pt-0 md:p-6 md:pt-0', className)}
      {...props}
    />
  );
}

export {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle};
