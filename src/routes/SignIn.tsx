import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/motion/Toast";

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [campusId, setCampusId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showToast({
        title: "Authenticated with campus SSO",
        description: `Signed in as student identity ${campusId || "SJU-2026-X"}.`,
      });
      navigate("/my-reports");
    }, 500);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-[6px] bg-campus-green text-surface flex items-center justify-center font-bold text-[18px] mx-auto mb-3">
            {collegeConfig.institution.shortName}
          </div>
          <h1 className="type-h2 text-ink">Campus portal sign in</h1>
          <p className="type-small text-ink-muted">
            Authenticate using your university electronic credentials to file or review property claims.
          </p>
        </div>

        <form
          onSubmit={handleSignIn}
          className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4"
        >
          <Input
            label="Campus identifier or student ID"
            placeholder="e.g. sju8921"
            required
            value={campusId}
            onChange={(e) => setCampusId(e.target.value)}
          />

          <Input
            label="University password"
            type="password"
            placeholder="••••••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              size="lg"
              isLoading={isLoading}
              leftIcon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
            >
              Sign in with campus ID
            </Button>
          </div>

          <div className="pt-3 border-t border-line text-center">
            <p className="text-[12px] text-ink-muted leading-relaxed flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
              <span>Protected by {collegeConfig.institution.name} Identity Services</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
