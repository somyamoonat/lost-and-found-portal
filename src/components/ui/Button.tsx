import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pressable } from "@/motion/Pressable";

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  variant?: "primary" | "secondary" | "quiet" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-[6px] select-none transition-colors border outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green focus-visible:ring-offset-2";

    const variantStyles = {
      primary:
        "bg-campus-green text-surface border-transparent hover:bg-[#16493C] active:bg-[#123A30] shadow-subtle",
      secondary:
        "bg-surface text-ink border-line hover:bg-paper active:bg-[#ECEFEA] shadow-subtle",
      quiet:
        "bg-transparent text-ink border-transparent hover:bg-green-tint hover:text-campus-green active:bg-[#D5E5DE]",
      destructive:
        "bg-brick text-surface border-transparent hover:bg-[#973F27] active:bg-[#7D3420] shadow-subtle",
    };

    const sizeStyles = {
      sm: "text-[13px] h-8 px-3 gap-1.5",
      md: "text-[14px] h-10 px-4 gap-2",
      lg: "text-[16px] h-12 px-5 gap-2.5",
    };

    return (
      <Pressable
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.5} />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";
