import * as React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/slate/ui/select';
import { cn } from '@/lib/utils';

/**
 * AppSelect - A premium dropdown component for Slate.
 * 
 * @param {string} label - Optional label displayed inside the trigger
 * @param {string} value - Current selected value
 * @param {function} onValueChange - Callback when value changes
 * @param {Array} options - Array of { label, value, icon } objects
 * @param {React.ComponentType} icon - Optional leading icon for the trigger
 * @param {string} placeholder - Placeholder text when no value is selected
 */
export const AppSelect = React.forwardRef(({ 
  label, 
  value, 
  onValueChange, 
  options = [], 
  icon: Icon, 
  placeholder = 'Select...', 
  className,
  triggerClassName,
  contentClassName,
  ...props 
}, ref) => {
  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onValueChange} {...props}>
        <SelectTrigger 
          ref={ref}
          className={cn(
            "app-surface-interactive flex min-h-[4.25rem] w-full items-center gap-4 border-none px-4 py-3 text-left shadow-none ring-0 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] focus:ring-0 focus:ring-offset-0",
            triggerClassName
          )}
        >
          <div className="flex items-center gap-3 w-full overflow-hidden">
            {Icon && (
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)] shadow-sm">
                <Icon size={20} weight="bold" />
              </div>
            )}
            <div className="flex flex-col flex-1 min-w-0 pr-1">
              {label && (
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-0.5 opacity-80">
                  {label}
                </span>
              )}
              <div className="truncate text-base font-extrabold tracking-tight text-[var(--app-foreground)]">
                <SelectValue placeholder={placeholder} />
              </div>
            </div>
          </div>
        </SelectTrigger>
        
        <SelectContent 
          className={cn(
            "rounded-[1.75rem] border-[var(--app-border-soft)] bg-white/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl md:min-w-[200px]", 
            contentClassName
          )}
        >
          <SelectGroup className="space-y-1">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="rounded-xl px-4 py-3 text-sm font-bold text-[var(--app-foreground)] transition-all duration-200 focus:bg-[var(--app-soft)] focus:text-[var(--app-primary-strong)] data-[state=checked]:bg-[var(--app-soft-strong)] data-[state=checked]:text-[var(--app-primary-strong)]"
              >
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <option.icon size={18} weight="bold" className="opacity-70" />
                  )}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
});

AppSelect.displayName = 'AppSelect';
