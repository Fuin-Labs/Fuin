"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono uppercase tracking-[0.14em] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--crimson)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink-black)] text-[var(--paper)] hover:bg-[var(--crimson)] hover:text-[var(--paper)]",
        outline:
          "border border-[var(--ink-black)] text-[var(--ink-black)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]",
        ghost:
          "text-[var(--ink-mute)] hover:text-[var(--crimson)]",
        crimson:
          "bg-[var(--crimson)] text-[var(--paper)] hover:bg-[var(--ink-black)]",
      },
      size: {
        sm: "h-8 px-3 text-[0.7rem]",
        md: "h-10 px-4 text-[0.78rem]",
        lg: "h-12 px-6 text-[0.85rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
