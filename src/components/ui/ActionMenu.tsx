"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface ActionMenuDivider {
  type: "divider";
}

export type ActionMenuEntry = ActionMenuItem | ActionMenuDivider;

function isDivider(entry: ActionMenuEntry): entry is ActionMenuDivider {
  return "type" in entry && entry.type === "divider";
}

interface ActionMenuProps {
  items: ActionMenuEntry[];
  className?: string;
}

export function ActionMenu({ items, className }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 4,
      left: rect.right,
    });
  }, []);

  // Position dropdown when opened
  useEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  // Adjust if dropdown overflows viewport
  useEffect(() => {
    if (!open || !coords || !dropdownRef.current) return;
    const dropdown = dropdownRef.current;
    const rect = dropdown.getBoundingClientRect();

    let adjustedTop = coords.top;
    let adjustedLeft = coords.left;

    // If overflowing bottom, show above trigger
    if (rect.bottom > window.innerHeight - 8) {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      if (triggerRect) {
        adjustedTop = triggerRect.top - rect.height - 4;
      }
    }

    // Left is the right edge of the trigger; dropdown anchors from its right edge
    // so we don't need to adjust left, but ensure it doesn't go off-screen left
    if (adjustedLeft - rect.width < 8) {
      adjustedLeft = rect.width + 8;
    }

    if (adjustedTop !== coords.top || adjustedLeft !== coords.left) {
      setCoords({ top: adjustedTop, left: adjustedLeft });
    }
  }, [open, coords]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={
          className ??
          "p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150"
        }
      >
        <MoreHorizontal size={16} strokeWidth={1.5} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: "translateX(-100%)",
            }}
            className="z-9999 min-w-[180px] bg-white border border-slate-200 rounded-lg shadow-lg py-1"
          >
            {items.map((entry, i) => {
              if (isDivider(entry)) {
                return (
                  <div
                    key={`divider-${i}`}
                    className="my-1 border-t border-slate-100"
                  />
                );
              }

              return (
                <button
                  key={entry.label}
                  disabled={entry.disabled}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(false);
                    entry.onClick();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                    entry.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {entry.icon && (
                    <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">
                      {entry.icon}
                    </span>
                  )}
                  {entry.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
