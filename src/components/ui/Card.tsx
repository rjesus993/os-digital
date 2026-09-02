import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-surface-raised border border-border rounded-lg p-4 mb-3 shadow">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-[20px] font-semibold text-primary mb-1.5">{title}</h2>}
          {subtitle && <p className="text-[14px] text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};