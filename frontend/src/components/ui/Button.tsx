import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  active?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border text-(--color-text) font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0";

const variants = {
  primary:
    "bg-(--color-primary) text-white hover:bg-(--color-primary-hover) shadow-md hover:shadow-lg focus-visible:ring-(--color-primary) ring-offset-(--color-canvas)",
  secondary:
    "bg-(--color-surface) text-(--color-text-secondary) border border-(--color-border) hover:bg-(--color-surface-2) focus-visible:ring-(--color-text-tertiary)",
  outline:
    "border border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-surface-2) focus-visible:ring-(--color-text-tertiary)",
  ghost:
    "text-(--color-text-secondary) hover:bg-(--color-surface-2) hover:text-(--color-text) focus-visible:ring-(--color-text-tertiary)",
  destructive:
    "bg-(--color-danger) text-white hover:bg-(--color-red-600) focus-visible:ring-(--color-danger)",
  success:
    "bg-(--color-success) text-white hover:bg-(--color-emerald-600) focus-visible:ring-(--color-success)",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3.5 text-xs",
  lg: "h-10 px-4 text-sm",
  icon: "h-8 w-8 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", icon, active, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        active && "bg-(--color-primary) text-white",
        (variant === "primary" || active) &&
          "ring-offset-2",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
