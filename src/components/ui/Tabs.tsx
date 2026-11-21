import React from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "@/motion/tokens";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}) => {
  const activeTab = value || defaultValue || tabs[0]?.id;

  return (
    <RadixTabs.Root
      defaultValue={defaultValue || tabs[0]?.id}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full flex flex-col", className)}
    >
      <RadixTabs.List className="flex items-center gap-1 border-b border-line pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <RadixTabs.Trigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative px-4 py-2.5 text-[14px] font-medium transition-colors outline-none cursor-pointer select-none rounded-[6px] mb-[-1px]",
                "focus-visible:ring-2 focus-visible:ring-campus-green",
                isActive
                  ? "text-campus-green font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-paper"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 text-[12px] rounded-full",
                      isActive
                        ? "bg-green-tint text-campus-green"
                        : "bg-paper text-ink-muted"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  transition={springs.snappy}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-campus-green"
                />
              )}
            </RadixTabs.Trigger>
          );
        })}
      </RadixTabs.List>

      {tabs.map((tab) => (
        <RadixTabs.Content
          key={tab.id}
          value={tab.id}
          className="pt-4 outline-none focus-visible:ring-2 focus-visible:ring-campus-green rounded-[6px]"
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};
