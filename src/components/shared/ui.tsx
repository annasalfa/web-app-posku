'use client';

import {useEffect, useId, useRef} from 'react';
import type {ButtonHTMLAttributes, InputHTMLAttributes, ReactNode} from 'react';
import {X} from 'lucide-react';

import {cn} from '@/lib/utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({className, variant = 'primary', ...props}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-14 cursor-pointer items-center justify-center rounded-[1.5rem] px-5 text-base font-semibold transition duration-200 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/24%)] disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'emerald-cta text-white shadow-[0_12px_32px_rgb(0_109_67/22%)]',
        variant === 'secondary' && 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]',
        variant === 'ghost' && 'bg-transparent text-[var(--color-primary)]',
        className,
      )}
      {...props}
    />
  );
}

export function Input({className, ...props}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-14 w-full rounded-[1.25rem] border border-transparent bg-[var(--color-surface-container-highest)] px-4 text-[var(--color-on-surface)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-b-[var(--color-primary)] focus:ring-2 focus:ring-[rgb(0_109_67/12%)]',
        className,
      )}
      {...props}
    />
  );
}

export function Panel({className, children}: {className?: string; children: ReactNode}) {
  return (
    <section className={cn('paper-panel rounded-[2rem] p-5 md:p-6', className)}>
      {children}
    </section>
  );
}

export function GlassPanel({className, children}: {className?: string; children: ReactNode}) {
  return (
    <section className={cn('glass-panel rounded-[2rem] p-4 md:p-5', className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-5xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-[var(--color-muted)] md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold uppercase tracking-[0.16em]',
        tone === 'neutral' && 'bg-[var(--color-surface-container-high)] text-[var(--color-muted)]',
        tone === 'success' && 'bg-[rgb(13_143_91/10%)] text-[var(--color-success-strong)]',
        tone === 'warning' && 'bg-[rgb(174_107_0/10%)] text-[var(--color-warning-strong)]',
        tone === 'danger' && 'bg-[rgb(186_26_26/10%)] text-[var(--color-error)]',
      )}
    >
      {children}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Panel className="space-y-3 bg-[var(--color-surface-container-lowest)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      <p className="font-display text-3xl font-semibold tracking-[-0.06em] tabular-nums md:text-4xl">{value}</p>
      {detail ? <p className="text-sm text-[var(--color-muted)]">{detail}</p> : null}
    </Panel>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{label: string; value: T}>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2 rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-2"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-12 cursor-pointer rounded-[1.2rem] px-4 text-sm font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]',
            value === option.value
              ? 'bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] shadow-[var(--shadow-soft)]'
              : 'text-[var(--color-muted)]',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Close dialog',
  closeOnBackdropClick = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
  closeOnBackdropClick?: boolean;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      const focusables = getFocusableElements(dialogRef.current);
      (focusables[0] ?? dialogRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(dialogRef.current);

      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[rgb(28_27_27/35%)] p-4 md:items-center md:justify-center"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="paper-panel max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-[2rem] p-5 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            {title}
          </h2>
          <button
            type="button"
            aria-label={closeLabel}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-container-high)]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LabelBlock({
  label,
  value,
  htmlFor,
}: {
  label: string;
  value: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {label}
        </label>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      )}
      <div>{value}</div>
    </div>
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
        'flex min-h-56 items-center justify-center rounded-[1.75rem] bg-[var(--color-surface-container-low)] p-6 text-center',
        className,
      )}
    >
      <div className="max-w-sm space-y-3">
        <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] md:text-3xl">{title}</h3>
        <p className="text-sm text-[var(--color-muted)]">{description}</p>
      </div>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
