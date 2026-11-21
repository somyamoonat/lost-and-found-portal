import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
}

/**
 * Institutional card container:
 * - 12px radius (rounded-[12px])
 * - 1px line border (border-line)
 * - Pure surface background (#FFFFFF)
 * - Subtle neutral shadow (NO glowing/colored shadows)
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, elevated = false, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-line rounded-[12px] p-5 sm:p-6 text-ink",
          elevated ? "shadow-elevated" : "shadow-subtle",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4 border-b border-line mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={cn("text-[20px] font-semibold text-ink leading-snug", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={cn("text-[14px] text-ink-muted leading-relaxed", className)} {...props}>
    {children}
  </p>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={cn("pt-4 border-t border-line mt-4 flex items-center justify-between", className)} {...props}>
    {children}
  </div>
);
