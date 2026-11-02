import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { statusFromName } from "../../lib/utils";
import type { Status } from "../../lib/tokens";

export type BadgeVariant = Status;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: "subtle" | "solid";
}

const tintBg: Record<BadgeVariant, string> = {
  default: "bg-(--color-surface-2)",
  primary: "bg-(--color-primary-bg)",
  success: "bg-(--color-success-bg)",
  warning: "bg-(--color-warning-bg)",
  danger: "bg-(--color-danger-bg)",
  info: "bg-(--color-info-bg)",
};
const tintFg: Record<BadgeVariant, string> = {
  default: "text-(--color-text-secondary)",
  primary: "text-(--color-primary-fg)",
  success: "text-(--color-success-fg)",
  warning: "text-(--color-warning-fg)",
  danger: "text-(--color-danger-fg)",
  info: "text-(--color-info-fg)",
};

export function Badge({
  className,
  variant = "default",
  tone = "subtle",
  children,
  ...props
}: BadgeProps) {
  const isSolid = tone === "solid";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-(--radius-full) px-2.5 py-0.5 text-xs font-medium",
        isSolid
          ? `bg-(--color-${variant === "default" ? "text" : variant}) text-white`
          : `${tintBg[variant]} ${tintFg[variant]}`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  ...props
}: { status: string } & BadgeProps) {
  const variant: BadgeVariant = statusFromName(status);
  return (
    <Badge variant={variant} {...props}>
      {status}
    </Badge>
  );
}
