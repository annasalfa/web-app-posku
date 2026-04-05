'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/lib/utils/cn';

const toggleGroupVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-standard)] text-sm font-medium transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm',
  {
    variants: {
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3',
        lg: 'h-12 px-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupVariants>
>({
  size: 'default',
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleGroupVariants>
>(({className, size, children, ...props}, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex w-full flex-wrap items-center gap-2 rounded-[var(--radius-large)] border border-border bg-muted/50 p-1.5',
      className,
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{size}}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleGroupVariants>
>(({className, children, size, ...props}, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleGroupVariants({size: context.size ?? size}), 'flex-1', className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export {ToggleGroup, ToggleGroupItem};
