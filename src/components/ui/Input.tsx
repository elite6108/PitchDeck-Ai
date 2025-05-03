import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    
    const inputClass = `rounded-md border px-3 py-2 text-sm outline-none transition-colors 
      ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'} 
      ${widthClass} ${className}`;
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input ref={ref} className={inputClass} {...props} />
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;