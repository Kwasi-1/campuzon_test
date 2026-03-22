import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Mail,
} from "lucide-react";
import SEO from "@/components/SEO";

// ──────────────────────────────────────────────────────────────
// Step indicator
// ──────────────────────────────────────────────────────────────
const Step = ({
  n,
  active,
  done,
  label,
}: {
  n: number;
  active: boolean;
  done: boolean;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        done
          ? "bg-emerald-500 text-white"
          : active
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {done ? "✓" : n}
    </div>
    <span
      className={`text-[11px] font-medium ${
        active ? "text-primary" : "text-gray-400"
      }`}
    >
      {label}
    </span>
  </div>
);

const StepDivider = ({ done }: { done: boolean }) => (
  <div
    className={`h-[2px] flex-1 mb-5 rounded transition-colors ${
      done ? "bg-emerald-400" : "bg-gray-200"
    }`}
  />
);

// ──────────────────────────────────────────────────────────────
// OTP Input — 6 individual digit boxes
// ──────────────────────────────────────────────────────────────
const OtpInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const digits = Array(6)
    .fill("")
    .map((_, i) => value[i] || "");

  const handleKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        onChange(value.slice(0, idx) + value.slice(idx + 1));
      } else if (idx > 0) {
        const prev = document.getElementById(`otp-${idx - 1}`);
        (prev as HTMLInputElement)?.focus();
        onChange(value.slice(0, idx - 1) + value.slice(idx));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const next = value.slice(0, idx) + char + value.slice(idx + 1);
    onChange(next);
    if (idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      (nextInput as HTMLInputElement)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text.padEnd(6, " ").slice(0, 6).replace(/ /g, ""));
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          title={`OTP digit ${i + 1}`}
          placeholder="·"
          aria-label={`Verification code digit ${i + 1}`}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all
            ${d ? "border-primary bg-primary/5" : "border-gray-200"}
            focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "twoFactor">("credentials");
  const [error, setError] = useState("");

  const { loginStep1, loginStep2, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  // ── Step 1 ─────────────────────────────────
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const outcome = await loginStep1(email.trim().toLowerCase(), password);
      if (outcome === "requires_2fa") {
        setStep("twoFactor");
      } else {
        navigate("/admin-portal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    }
  };

  // ── Step 2 ─────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.replace(/\D/g, "").length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    try {
      await loginStep2(otpCode);
      navigate("/admin-portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
      setOtpCode("");
    }
  };

  return (
    <>
      <SEO
        title="Admin Login — Campuzon"
        description="Secure administrative login for the Campuzon platform."
        keywords="admin login, campuzon admin, administrative access"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">
              Campuzon <span className="text-primary font-light">Admin</span>
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 px-6 mb-6">
            <Step
              n={1}
              active={step === "credentials"}
              done={step === "twoFactor"}
              label="Sign in"
            />
            <StepDivider done={step === "twoFactor"} />
            <Step
              n={2}
              active={step === "twoFactor"}
              done={false}
              label="Verify"
            />
          </div>

          <Card className="border-0 shadow-2xl shadow-black/40 bg-white/95 backdrop-blur">
            {/* ── STEP 1: Credentials ─── */}
            {step === "credentials" && (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">
                    Admin Sign In
                  </CardTitle>
                  <CardDescription>
                    Authorized personnel only. All access is audited.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
                        <Lock className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@campuzon.me"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10"
                          required
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}

            {/* ── STEP 2: 2FA OTP ─── */}
            {step === "twoFactor" && (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">
                    Two-factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Open your authenticator app and enter the 6-digit code for{" "}
                    <strong className="text-gray-700">{email}</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
                        <Lock className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* OTP boxes */}
                    <div className="space-y-3 pt-1">
                      <Label className="text-center block text-sm text-gray-500">
                        Verification Code
                      </Label>
                      <OtpInput value={otpCode} onChange={setOtpCode} />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="w-full h-11 font-semibold"
                        disabled={isLoading || otpCode.replace(/\D/g, "").length < 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying…
                          </>
                        ) : (
                          "Verify & Sign In"
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="text-gray-500 hover:text-gray-700 text-sm"
                        onClick={() => {
                          setStep("credentials");
                          setOtpCode("");
                          setError("");
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to sign in
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
          </Card>

          <p className="text-center text-xs text-slate-500 mt-6">
            Protected area · All sessions are logged and monitored
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
