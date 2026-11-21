import React, { useId } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      hint,
      error,
      success,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success && !hasError);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[14px] font-medium text-ink leading-tight select-none"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "w-full h-10 px-3 py-2 text-[14px] bg-surface text-ink placeholder:text-ink-muted/70 rounded-[6px] border border-line shadow-subtle outline-none transition-colors",
              "focus-visible:border-campus-green focus-visible:ring-2 focus-visible:ring-campus-green focus-visible:ring-offset-2",
              hasError &&
                "border-brick text-ink focus-visible:border-brick focus-visible:ring-brick",
              hasSuccess &&
                "border-campus-green text-ink focus-visible:border-campus-green focus-visible:ring-campus-green",
              disabled &&
                "bg-[#ECEFEA] text-ink-muted/60 border-line/60 cursor-not-allowed opacity-75 shadow-none",
              (hasError || hasSuccess) && "pr-9",
              className
            )}
            {...props}
          />

          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-brick">
              <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
            </div>
          )}

          {hasSuccess && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-campus-green">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {error && (
          <p className="text-[13px] text-brick leading-normal flex items-start gap-1">
            <span>{error}</span>
          </p>
        )}

        {success && !error && (
          <p className="text-[13px] text-campus-green leading-normal flex items-start gap-1">
            <span>{success}</span>
          </p>
        )}

        {hint && !error && !success && (
          <p className="text-[13px] text-ink-muted leading-normal">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
