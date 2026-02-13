"use client";

import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1e3a5f] hover:bg-[#16304f] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150",
  secondary:
    "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150",
  ghost:
    "text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
  danger:
    "bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
