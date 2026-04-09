'use client';

import type {ReactNode} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {AlertTriangle, Search} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group';
import {cn} from '@/lib/utils/cn';

export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? {opacity: 0} : {opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: reduceMotion ? 0.16 : 0.26, ease: 'easeOut'}}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DataCard({
  className,
  title,
  description,
  children,
}: {
  className?: string;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('border-border/80 shadow-sm', className)}>
      {title || description ? (
        <CardHeader className="pb-4">
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(title || description ? '' : 'p-5 md:p-6')}>
        {children}
      </CardContent>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: 'neutral' | 'info' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'info'
      ? 'border-primary/20 bg-primary/5'
      : tone === 'success'
        ? 'border-success/20 bg-success/5'
        : tone === 'warning'
          ? 'border-warning/20 bg-warning/5'
          : 'border-border bg-card';

  return (
    <Card className={cn('shadow-sm', toneClass)}>
      <CardContent className="space-y-3 p-5 md:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-[1.75rem] font-bold tracking-[-0.04em] text-foreground sm:text-[2rem]">
          {value}
        </p>
        {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-40 flex-col items-center justify-center rounded-[var(--radius-large)] border border-dashed border-border bg-muted/40 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SurfaceNotice({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-large)] border border-warning/35 bg-warning/10 px-4 py-3 text-sm',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function SearchField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="pl-11"
        />
      </div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  ariaLabel,
}: {
  value: T;
  options: Array<{label: string; value: T}>;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      aria-label={ariaLabel}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue as T);
        }
      }}
      className={className}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export function FieldGroup({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function StatusBadge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'cash' | 'transfer' | 'qris';
  children: ReactNode;
  className?: string;
}) {
  const variant =
    tone === 'danger'
      ? 'danger'
      : tone === 'warning'
        ? 'warning'
        : tone === 'success'
          ? 'success'
          : tone === 'info'
            ? 'info'
            : tone === 'cash'
              ? 'cash'
              : tone === 'transfer'
                ? 'transfer'
                : tone === 'qris'
                  ? 'qris'
                  : 'neutral';

  return (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  );
}
