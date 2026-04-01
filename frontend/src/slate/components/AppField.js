import * as React from 'react';
import { cn } from '@/lib/utils';

export function Field({ label, htmlFor, className, children }) {
  return (
    <div className={className}>
      {label ? <label htmlFor={htmlFor} className="app-field-label">{label}</label> : null}
      {children}
    </div>
  );
}

export const AppInput = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('app-input', className)} {...props} />
));
AppInput.displayName = 'AppInput';

export const AppSelect = React.forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('app-input', className)} {...props}>
    {children}
  </select>
));
AppSelect.displayName = 'AppSelect';

export const AppTextarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('app-input', className)} {...props} />
));
AppTextarea.displayName = 'AppTextarea';
