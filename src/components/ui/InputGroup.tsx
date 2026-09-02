import React from 'react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  as?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, as = 'input', options, className = '', ...props }) => {
  const fieldClasses = "w-full p-2.5 border border-border rounded-md bg-surface text-primary text-[15px] focus:outline-none focus:border-primary focus:ring-3 focus:ring-black/5 transition-all";

  return (
    <div className={`mb-3.5 ${className}`}>
      <label className="block text-[13px] font-medium text-secondary mb-1.5">{label}</label>
      
      {as === 'input' && <input className={fieldClasses} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />}
      
      {as === 'textarea' && (
        <textarea className={`${fieldClasses} min-h-[72px] resize-y`} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      )}
      
      {as === 'select' && (
        <select className={fieldClasses} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
};