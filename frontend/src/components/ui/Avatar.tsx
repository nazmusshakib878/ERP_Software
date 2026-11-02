import { type HTMLAttributes } from "react";
import { cn, initials } from "../../lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "gray" | "blue" | "indigo" | "teal" | "amber" | "rose";
  presence?: "online" | "offline" | "away";
}

const sizeMap = {
  xs: "h-6 w-6 text-[8px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const bg: Record<string, string> = {
  gray: "bg-slate-200 dark:bg-slate-700",
  blue: "bg-blue-100 dark:bg-blue-950/40",
  indigo: "bg-indigo-100 dark:bg-indigo-950/40",
  teal: "bg-teal-100 dark:bg-teal-950/40",
  amber: "bg-amber-100 dark:bg-amber-950/40",
  rose: "bg-rose-100 dark:bg-rose-950/40",
};
const fg: Record<string, string> = {
  gray: "text-slate-600 dark:text-slate-300",
  blue: "text-blue-700 dark:text-blue-300",
  indigo: "text-indigo-700 dark:text-indigo-300",
  teal: "text-teal-700 dark:text-teal-300",
  amber: "text-amber-800 dark:text-amber-300",
  rose: "text-rose-700 dark:text-rose-300",
};
const presenceDot = {
  online: "ring-(--color-success) ring ring-offset-2 ring-offset-(--color-canvas)",
  away: "ring-amber-500 ring ring-offset-2 ring-offset-(--color-canvas)",
  offline: "ring-(--color-text-tertiary) ring ring-offset-2 ring-offset-(--color-canvas)",
};

export function Avatar({
  src,
  name,
  size = "md",
  variant = "gray",
  presence,
  className,
  ...props
}: AvatarProps) {
  const initialsText = name ? initials(name) : "";
  return (
    <div
      className={cn(
        "inline-flex-center relative inline-flex items-center justify-center rounded-(--radius-full) font-medium",
        sizeMap[size],
        !src && bg[variant] && fg[variant],
        presence && presenceDot[presence],
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-(--radius-full) object-cover"
        />
      ) : (
        initialsText
      )}
    </div>
  );
}
