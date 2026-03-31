import { ArrowLeft } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AppShell({ children, className }) {
  return <div className={cn('app-shell mobile-safe-padding', className)}>{children}</div>;
}

export function PageContent({ children, className }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('app-section px-4 py-5 sm:px-6 lg:px-8 md:py-8', className)}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function PageHero({ eyebrow, title, description, actions, className }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between', className)}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.04,
          },
        },
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {eyebrow ? <p className="app-eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="app-page-title">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--app-muted)] md:text-base">{description}</p> : null}
      </motion.div>
      {actions ? (
        <motion.div
          className="flex flex-wrap items-center gap-3"
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {actions}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export function PageBackButton({ children, className, icon: Icon = ArrowLeft, ...props }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={cn('mb-5 flex items-center gap-2 text-sm font-bold text-[var(--app-muted)]', className)}
      whileHover={prefersReducedMotion ? undefined : { x: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      {...props}
    >
      <Icon size={20} weight="bold" />
      {children}
    </motion.button>
  );
}
