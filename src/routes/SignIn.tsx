import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Lock, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { auth, useAuth, getCollegeDomain } from "@/auth";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/motion/Toast";
import { durations } from "@/motion/tokens";
import { cn } from "@/lib/utils";

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { user, isAuthenticated, signOut } = useAuth();

  const redirectPath = searchParams.get("redirect") || "/my-reports";
  const collegeDomain = getCollegeDomain();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      errs.email = "University email is required.";
    } else if (!trimmed.endsWith(`@${collegeDomain}`)) {
      errs.email = `Please use your university email ending with @${collegeDomain}.`;
    }

    if (!password) {
      errs.password = "University password is required.";
    } else if (password.length < 4) {
      errs.password = "Password must be at least 4 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await auth.signIn(email, password);
      if (!res.success) {
        setErrors((prev) => ({ ...prev, email: res.error || "Authentication failed." }));
        setIsSubmitting(false);
        return;
      }

      showToast({
        title: "Authenticated with campus SSO",
        description: `Signed in as ${res.user?.name || res.user?.email}.`,
      });

      // Page transition to destination
      navigate(redirectPath);
    } catch {
      setErrors((prev) => ({ ...prev, email: "An unexpected network error occurred." }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Page Breadcrumb / Status */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>{collegeConfig.institution.shortName} Lost & Found</span>
          <span>/</span>
          <span className="text-campus-green font-medium">Identity access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-1.5">
            <h1 className="type-h1 text-ink">Sign in to campus portal</h1>
            <p className="type-body text-ink-muted">
              Enter your official university credentials to access claimant records and property reports.
            </p>
          </div>

          {isAuthenticated && user ? (
            /* Already signed in state */
            <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-green-tint text-campus-green font-semibold flex items-center justify-center shrink-0 border border-campus-green/20">
                  {user.name.charAt(0) || "U"}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-ink text-[15px]">{user.name}</div>
                  <div className="text-[13px] text-ink-muted">{user.email}</div>
                  <div className="text-[12px] text-campus-green font-medium pt-1">
                    Student ID: {user.studentId} · {user.department}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-line">
                <Button
                  variant="primary"
                  onClick={() => navigate(redirectPath)}
                  rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Continue to reports
                </Button>
                <Button variant="secondary" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            /* Sign in form */
            <form
              onSubmit={handleSignIn}
              data-testid="signin-form"
              className="bg-surface border border-line rounded-[12px] p-6 sm:p-7 shadow-subtle space-y-5"
            >
              {/* University Email */}
              <div className="space-y-1.5">
                <label className="block text-[14px] font-medium text-ink select-none">
                  University email address <span className="text-brick">*</span>
                </label>
                <input
                  type="email"
                  data-testid="signin-email-input"
                  placeholder={`e.g. student@${collegeDomain}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150",
                    errors.email
                      ? "border-brick ring-1 ring-brick"
                      : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                  )}
                />
                <div className="flex items-center justify-between text-[12px] text-ink-muted pt-0.5">
                  <span>Must end with @{collegeDomain}</span>
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      data-testid="signin-email-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: durations.uiExit }}
                      className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* University Password */}
              <div className="space-y-1.5">
                <label className="block text-[14px] font-medium text-ink select-none">
                  University password <span className="text-brick">*</span>
                </label>
                <input
                  type="password"
                  data-testid="signin-password-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150",
                    errors.password
                      ? "border-brick ring-1 ring-brick"
                      : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                  )}
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.div
                      data-testid="signin-password-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: durations.uiExit }}
                      className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.password}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  data-testid="signin-submit-btn"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  isLoading={isSubmitting}
                  leftIcon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Sign in
                </Button>
              </div>

              {/* Security Note */}
              <div className="pt-3 border-t border-line text-center">
                <p className="text-[12px] text-ink-muted flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                  <span>Protected by {collegeConfig.institution.shortName} Identity Services</span>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Plain bordered panel listing what signing in lets you do (NO illustration) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-surface border border-line rounded-[12px] p-6 sm:p-7 shadow-subtle space-y-5">
            <h2 className="text-[17px] font-semibold text-ink leading-snug">
              What signing in lets you do
            </h2>

            <ul className="space-y-3.5 text-[14px] text-ink-muted">
              {[
                "Track status and custody history of reports you have filed",
                "Submit and verify ownership claims for surrendered property",
                "Receive instant alerts when matching articles are handed in",
                "Access official custody passes for Central Library Desk collection",
                "Withdraw or update claims when items are safely recovered",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-campus-green shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="leading-snug text-ink/90">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-line text-[12px] text-ink-muted leading-relaxed space-y-1">
              <div className="font-medium text-ink">Intake desk verification policy</div>
              <p>
                Pickups at Central Library Commons Room 104 require matching physical student or faculty photo ID along with your reference pass.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
