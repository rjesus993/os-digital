import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyle = "w-full py-3 px-4 rounded-md text-[15px] font-semibold transition-all duration-150 flex justify-center items-center gap-2 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-black",
    secondary: "bg-surface text-primary border border-border hover:bg-gray-100",
    success: "bg-success text-white hover:bg-green-700",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};