"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const ActionButton = () => {
    if (!action) return null;

    if (action.href) {
      return (
        <a
          href={action.href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
        >
          {action.label}
        </a>
      );
    }

    return (
      <button
        onClick={action.onClick}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
      >
        {action.label}
      </button>
    );
  };

  return (
    <div className="py-16 text-center">
      <Icon size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
      <h3 className="text-lg font-medium text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      <ActionButton />
    </div>
  );
}
