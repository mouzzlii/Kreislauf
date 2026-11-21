import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-forest text-paper hover:brightness-110",
  copper: "bg-copper text-ink hover:brightness-110",
  ghost: "border border-line bg-elev text-fg hover:bg-elev-2",
  quiet: "bg-transparent text-fg hover:bg-elev",
} as const;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-[background-color,filter,transform] duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export const fieldClass =
  "h-11 w-full rounded-lg border border-line bg-elev px-3 text-base text-fg outline-none placeholder:text-subtle";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm text-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}
