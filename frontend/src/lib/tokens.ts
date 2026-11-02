export type Theme = "light" | "dark";

export const radii = {
  sm: "5px",
  md: "7px",
  lg: "10px",
  xl: "14px",
  full: "9999px",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xl2: "32px",
  xl3: "48px",
} as const;

export const fontSize = {
  xs: "10px",
  "2xs": "11px",
  sm: "12px",
  base: "13px",
  md: "14px",
  lg: "16px",
  xl: "18px",
  "2xl": "20px",
  "3xl": "24px",
  "4xl": "28px",
  "5xl": "30px",
  "6xl": "40px",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const colors = {
  canvas: "var(--color-canvas)",
  surface: "var(--color-surface)",
  surface2: "var(--color-surface-2)",
  text: "var(--color-text)",
  textSecondary: "var(--color-text-secondary)",
  textTertiary: "var(--color-text-tertiary)",
  border: "var(--color-border)",
  borderStrong: "var(--color-border-strong)",
  inputBg: "var(--color-input-bg)",
  sidebar: "var(--color-sidebar)",
  sidebarNav: "var(--color-sidebar-nav)",
  primary: "var(--color-primary-500)",
  primaryHover: "var(--color-primary-600)",
  primaryEmphasis: "var(--color-primary-700)",
  success: "var(--color-emerald-500)",
  warning: "var(--color-amber-500)",
  danger: "var(--color-red-500)",
  info: "var(--color-blue-500)",
  teal: "var(--color-teal-500)",
  navy: "var(--color-navy-900)",
} as const;

export type Status = "default" | "primary" | "success" | "warning" | "danger" | "info";

export const STATUS_COLORS: Record<Status, string> = {
  default: colors.textSecondary,
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
};
