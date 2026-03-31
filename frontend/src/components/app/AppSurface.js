import { X } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const surfaceVariants = cva('', {
  variants: {
    variant: {
      glass: 'app-surface',
      soft: 'app-surface-soft',
      solid: 'app-surface-solid',
      interactive: 'app-surface-interactive',
      list: 'app-list-row',
    },
  },
  defaultVariants: {
    variant: 'glass',
  },
});

export function AppSurface({ className, variant, children, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(surfaceVariants({ variant }), className)}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function IconBadge({ icon: Icon, className, tone = 'soft', ...props }) {
  const prefersReducedMotion = useReducedMotion();
  const toneClass =
    tone === 'soft'
      ? 'bg-[var(--app-soft)] text-[var(--app-primary-strong)]'
      : tone === 'white'
        ? 'bg-white text-[var(--app-primary)]'
        : 'bg-[var(--app-primary)] text-[var(--app-primary-foreground)]';

  return (
    <motion.div
      className={cn('flex h-12 w-12 items-center justify-center rounded-[1.25rem]', toneClass, className)}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      {...props}
    >
      {Icon ? <Icon size={22} weight="bold" /> : null}
    </motion.div>
  );
}

export function MemberBadge({ children, active = false, className, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={cn('app-chip', active && 'app-chip-active', className)}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.span>
  );
}

export function StatCard({ label, value, description, icon: Icon, indicatorClassName, className, valueClassName }) {
  return (
    <AppSurface variant="solid" className={cn('rounded-[1.75rem] p-5', className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)]">
        {Icon ? <Icon size={18} weight="bold" /> : <span className={cn('h-2.5 w-2.5 rounded-full bg-[var(--app-primary)]', indicatorClassName)} />}
        {label}
      </div>
      <p className={cn('text-3xl font-extrabold tracking-[-0.04em] text-[var(--app-primary)]', valueClassName)}>{value}</p>
      {description ? <p className="mt-2 text-sm text-[var(--app-muted)]">{description}</p> : null}
    </AppSurface>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('py-12 text-center', className)}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {Icon ? <Icon size={64} weight="bold" className="mx-auto mb-4 text-[var(--app-muted-subtle)]" /> : null}
      {title ? <p className="mb-2 text-[var(--app-muted)]">{title}</p> : null}
      {description ? <p className="mb-4 text-sm text-[var(--app-muted-subtle)]">{description}</p> : null}
      {action}
    </motion.div>
  );
}

export function Callout({ children, className }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('rounded-[1.5rem] bg-[var(--app-soft)] p-4', className)}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function AppModal({ open, children, className, ...props }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="app-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          {...props}
        >
          <motion.div
            className={cn('app-surface w-full max-w-md p-6 md:p-8', className)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ModalHeader({ title, description, onClose, className }) {
  return (
    <div className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-xl font-extrabold tracking-[-0.04em] text-[var(--app-foreground)] md:text-2xl">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[var(--app-muted)]">{description}</p> : null}
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} className="text-[var(--app-muted)] transition-colors hover:text-[var(--app-foreground)]">
          <X size={24} weight="bold" />
        </button>
      ) : null}
    </div>
  );
}
