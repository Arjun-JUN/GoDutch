import * as React from 'react';
import { cva } from 'class-variance-authority';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const appButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-extrabold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] disabled:cursor-not-allowed disabled:opacity-55',
  {
    variants: {
      variant: {
        primary:
          'rounded-full bg-[linear-gradient(135deg,var(--app-primary)_0%,var(--app-primary-strong)_100%)] px-6 py-3 text-[var(--app-primary-foreground)] shadow-[var(--app-shadow-button)] hover:-translate-y-px hover:brightness-[1.02]',
        secondary:
          'rounded-full bg-[var(--app-soft)] px-6 py-3 text-[var(--app-primary-strong)] hover:-translate-y-px hover:bg-[var(--app-soft-strong)]',
        ghost:
          'rounded-full bg-[rgba(255,255,255,0.7)] px-4 py-2.5 text-[var(--app-muted)] hover:bg-[var(--app-soft)]',
        icon:
          'h-11 w-11 rounded-[1.25rem] bg-[rgba(255,255,255,0.82)] text-[var(--app-primary-strong)] hover:-translate-y-px hover:bg-[var(--app-soft)]',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-sm md:text-base',
        lg: 'px-7 py-3.5 text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const AppButton = React.forwardRef(({ className, variant, size, type = 'button', whileHover, whileTap, transition, ...props }, ref) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(appButtonVariants({ variant, size }), className)}
      whileHover={prefersReducedMotion ? undefined : (whileHover ?? { y: -1 })}
      whileTap={prefersReducedMotion ? undefined : (whileTap ?? { scale: 0.99 })}
      transition={transition ?? { duration: 0.16, ease: 'easeOut' }}
      {...props}
    />
  );
});

AppButton.displayName = 'AppButton';

export { AppButton, appButtonVariants };
