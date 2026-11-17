import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-brand-text dark:text-brand-text-dark placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue ${
              leftIcon ? 'pl-10' : ''
            } ${
              error
                ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/20'
                : 'border-brand-border dark:border-brand-border-dark focus:border-brand-blue'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-brand-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
