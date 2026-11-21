import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "motion/react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useNotifications } from "@/notifications";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { fadeScaleVariants } from "@/motion/variants";
import { springs, durations, easings } from "@/motion/tokens";
import { cn } from "@/lib/utils";

export const NotificationPopover: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-testid="notification-bell-trigger"
          aria-label={`View notifications (${unreadCount} unread)`}
          className="relative p-2 text-ink-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green cursor-pointer"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />

          {/* Unread badge with AnimatedNumber and spring pop on count update */}
          {unreadCount > 0 && (
            <motion.span
              key={`badge-${unreadCount}`}
              data-testid="notification-badge"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: 1 }}
              transition={springs.snappy}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-campus-green text-surface text-[10px] font-semibold flex items-center justify-center border-2 border-surface"
            >
              <AnimatedNumber value={unreadCount} />
            </motion.span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          asChild
          sideOffset={8}
          align="end"
          className="z-50 outline-none"
        >
          <motion.div
            data-testid="notification-popover-content"
            variants={fadeScaleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-80 sm:w-96 bg-surface border border-line rounded-[12px] shadow-elevated overflow-hidden text-ink"
          >
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-line flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[14px] text-ink">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium bg-green-tint text-campus-green px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  data-testid="mark-all-read-btn"
                  onClick={markAllAsRead}
                  className="text-[12px] text-campus-green hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="divide-y divide-line max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-ink-muted">
                  No notifications currently logged.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    data-testid={`notification-item-${notif.id}`}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "p-3.5 px-4 flex items-start gap-3 transition-colors cursor-pointer",
                      notif.read ? "bg-surface opacity-75 hover:opacity-100" : "bg-paper/40 hover:bg-paper/80"
                    )}
                  >
                    {/* Unread indicator: scales out when marked as read */}
                    <div className="w-2.5 h-2.5 pt-1 flex items-center justify-center shrink-0">
                      <AnimatePresence mode="popLayout">
                        {!notif.read && (
                          <motion.span
                            key={`unread-dot-${notif.id}`}
                            data-testid={`unread-dot-${notif.id}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: durations.uiExit, ease: easings.out }}
                            className="w-2 h-2 rounded-full bg-campus-green shrink-0"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="text-[13px] font-medium text-ink leading-snug">
                        {notif.title}
                      </div>
                      <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-ink-muted/80 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{notif.timestamp}</span>
                        {notif.refCode && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-ink font-semibold">
                              {notif.refCode}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 px-4 bg-paper/60 border-t border-line text-[11px] text-ink-muted text-center">
              Alerts are cross-referenced with Central Intake records.
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
