import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { User, LogOut } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { springs, durations, easings } from "@/motion/tokens";
import { slideSheetRightVariants, backdropFadeVariants } from "@/motion/variants";
import { NotificationPopover } from "@/components/ui/NotificationPopover";
import { useAuth } from "@/auth";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  label: string;
  href: string;
}

const navLinks: NavLinkItem[] = [
  { label: "Browse", href: "/browse" },
  { label: "Report an item", href: "/report" },
  { label: "My reports", href: "/my-reports" },
];

/**
 * Navbar component:
 * - Wordmark: College short name in semibold + Lost & Found in regular weight (separated by thin line, no logo icon)
 * - Links with layoutId sliding underline
 * - Right: primary report button, notification bell, avatar / sign in
 * - Sticky with scroll-linked height easing (76px -> 60px) and 1px line border fade-in after 24px scroll
 * - Strictly NO blur and NO shadow
 * - Mobile menu button with morphing lines to X, full-height right sheet, staggered links, body scroll lock, Escape key close
 */
export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  // Scroll-linked sticky animations
  const { scrollY } = useScroll();
  const navHeight = useTransform(scrollY, [0, 24], [76, 60]);
  const borderOpacity = useTransform(scrollY, [0, 24], [0, 1]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (href: string) => {
    if (href === "/browse") {
      return location.pathname === "/" || location.pathname === "/browse" || location.pathname.startsWith("/items");
    }
    return location.pathname === href;
  };

  return (
    <>
      <motion.header
        style={{ height: navHeight }}
        className="sticky top-0 z-40 w-full bg-surface select-none"
      >
        {/* 1px bottom border that fades in after 24px scroll */}
        <motion.div
          style={{ opacity: borderOpacity }}
          className="absolute inset-x-0 bottom-0 h-[1px] bg-line pointer-events-none"
        />

        <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Wordmark */}
          <Link
            to="/browse"
            className="flex items-center text-ink hover:text-campus-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green rounded-[4px] p-0.5"
            aria-label={`${collegeConfig.institution.shortName} Lost & Found home`}
          >
            <span className="font-semibold text-[17px] tracking-tight">
              {collegeConfig.institution.shortName}
            </span>
            <span className="w-[1px] h-4 bg-line mx-2.5 shrink-0" aria-hidden="true" />
            <span className="font-normal text-[17px] tracking-tight text-ink">
              Lost & Found
            </span>
          </Link>

          {/* Desktop Navigation Links (with sliding layoutId underline) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative px-3.5 py-2 text-[14px] font-medium transition-colors rounded-[6px] outline-none",
                    "focus-visible:ring-2 focus-visible:ring-campus-green",
                    active ? "text-campus-green font-semibold" : "text-ink-muted hover:text-ink hover:bg-paper"
                  )}
                >
                  <span>{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-active-underline"
                      transition={springs.snappy}
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-campus-green"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Report Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/report")}
              className="hidden sm:inline-flex"
            >
              Report an item
            </Button>

            {/* Notification Bell Popover */}
            <NotificationPopover />

            {/* User Avatar / Sign In */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-1.5 pl-1">
                <Link
                  to="/my-reports"
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors border border-transparent hover:border-line",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green",
                    location.pathname === "/my-reports" && "text-campus-green font-semibold"
                  )}
                  title={`Signed in as ${user.email}`}
                >
                  <div className="w-6 h-6 rounded-full bg-green-tint text-campus-green font-semibold text-[11px] flex items-center justify-center border border-campus-green/30">
                    {user.name.charAt(0) || "U"}
                  </div>
                  <span className="truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  aria-label="Sign out"
                  title="Sign out of campus portal"
                  className="p-1.5 text-ink-muted hover:text-brick hover:bg-paper rounded-[6px] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link
                to="/sign-in"
                className={cn(
                  "hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium text-ink-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors border border-transparent hover:border-line",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green",
                  location.pathname === "/sign-in" && "text-campus-green font-semibold"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-paper border border-line flex items-center justify-center text-ink">
                  <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
                <span>Sign in</span>
              </Link>
            )}

            {/* Mobile Menu Morphing Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-[6px] text-ink hover:bg-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green flex flex-col justify-center items-center w-9 h-9"
            >
              <div className="w-4 h-3.5 relative flex flex-col justify-between">
                {/* Top line */}
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={springs.snappy}
                  className="w-full h-[1.5px] bg-ink block origin-center"
                />
                {/* Middle line */}
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: durations.microExit }}
                  className="w-full h-[1.5px] bg-ink block"
                />
                {/* Bottom line */}
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={springs.snappy}
                  className="w-full h-[1.5px] bg-ink block origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Flat neutral backdrop - strictly NO blur */}
            <motion.div
              variants={backdropFadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#1A2220]/45"
            />

            {/* Slide-in Sheet from Right */}
            <motion.div
              variants={slideSheetRightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed top-0 bottom-0 right-0 w-[280px] max-w-[85vw] bg-surface border-l border-line p-6 shadow-elevated flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <span className="font-semibold text-[15px] text-ink">
                    {collegeConfig.institution.shortName} Lost & Found
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation"
                    className="p-1 rounded-[6px] text-ink-muted hover:text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <span className="w-4 h-[1.5px] bg-ink absolute rotate-45" />
                      <span className="w-4 h-[1.5px] bg-ink absolute -rotate-45" />
                    </div>
                  </button>
                </div>

                {/* Staggered Links */}
                <motion.nav
                  initial="initial"
                  animate="animate"
                  variants={{
                    animate: {
                      transition: {
                        staggerChildren: 0.04,
                      },
                    },
                  }}
                  className="flex flex-col space-y-1"
                >
                  {navLinks.map((link) => {
                    const active = isActiveLink(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        variants={{
                          initial: { opacity: 0, x: 12 },
                          animate: { opacity: 1, x: 0, transition: { duration: durations.ui, ease: easings.out } },
                        }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-[6px] text-[15px] font-medium transition-colors",
                            active
                              ? "bg-green-tint text-campus-green font-semibold"
                              : "text-ink hover:bg-paper"
                          )}
                        >
                          <span>{link.label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-campus-green" />}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    variants={{
                      initial: { opacity: 0, x: 12 },
                      animate: { opacity: 1, x: 0, transition: { duration: durations.ui, ease: easings.out } },
                    }}
                    className="pt-2"
                  >
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-[6px] text-[15px] font-medium text-ink hover:bg-paper transition-colors",
                        location.pathname === "/sign-in" && "bg-green-tint text-campus-green font-semibold"
                      )}
                    >
                      <User className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
                      <span>Sign in to portal</span>
                    </Link>
                  </motion.div>
                </motion.nav>
              </div>

              {/* Mobile Drawer Bottom Action */}
              <div className="pt-4 border-t border-line space-y-3">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/report");
                  }}
                >
                  Report an item
                </Button>
                <p className="text-[12px] text-ink-muted text-center">
                  Desk hours: {collegeConfig.deskHours.schedule[0]?.hours}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
