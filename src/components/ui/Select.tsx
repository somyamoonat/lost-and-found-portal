import React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onValueChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
}) => {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="block text-[14px] font-medium text-ink leading-tight select-none">
          {label}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <RadixSelect.Trigger
          className={cn(
            "w-full h-10 px-3 py-2 inline-flex items-center justify-between text-[14px] bg-surface text-ink rounded-[6px] border border-line shadow-subtle outline-none transition-colors",
            "focus-visible:border-campus-green focus-visible:ring-2 focus-visible:ring-campus-green focus-visible:ring-offset-2",
            disabled && "bg-[#ECEFEA] text-ink-muted/60 cursor-not-allowed opacity-75 shadow-none"
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon asChild>
            <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 min-w-[8rem] overflow-hidden bg-surface text-ink rounded-[6px] border border-line shadow-elevated"
          >
            <RadixSelect.Viewport className="p-1 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-[4px] py-2 pl-8 pr-3 text-[14px] outline-none transition-colors",
                    "hover:bg-paper focus:bg-green-tint focus:text-campus-green data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-campus-green">
                    <RadixSelect.ItemIndicator>
                      <Check className="h-4 w-4" strokeWidth={1.5} />
                    </RadixSelect.ItemIndicator>
                  </span>
                  <div className="flex flex-col">
                    <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                    {opt.description && (
                      <span className="text-[12px] text-ink-muted">{opt.description}</span>
                    )}
                  </div>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
};
