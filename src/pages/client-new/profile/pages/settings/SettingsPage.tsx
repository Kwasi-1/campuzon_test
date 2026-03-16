import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Smartphone,
  LogOut,
  ChevronRight,
  User,
  CreditCard,
  MapPin,
  HelpCircle,
  FileText,
  Lock,
  Mail,
  KeyRound,
  Check,
  Loader2,
  Copy,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore, useUIStore } from "@/stores";

// ── 2FA mock flag ────────────────────────────────────────────────────────────
const USE_MOCK_2FA = true;
const mockTOTPSetup = {
  secret: "JBSWY3DPEHPK3PXP",
  qrCode:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAABcpJREFUeF7t3dFy2zAMBND8/0enk8mM7diWuIsF4L7G0gKLQ0lO2n5+fX19/fEfBCDwI4FPgfgdIPA9AYH4dSDwCwGB+HUg8A8B/4L4jSBgQfwOELAgfgcIeBB/AwS8B/E7QMB7EL8DBLwH8TtAwHsQvwMEvAfxO0DAexC/AwS8B/E7QMB7EL8DBLwH8TtAwHsQvwMEvAfxO0DAexC/AwS8B/E7QMB7EL8DBP4m8Ol/6vWfBL4TOAUC8cvw9wTOA/mE4K8hvo8HCHwncB4I/E0ggv+dEMF/JyQQvw/3CZ0H8gnJX0N8Hw8Q+E7oPBD4m0AE/zshgv9OSCC+H4cgcB7IJyR/DfF9PEDgO6HzQOBvAhH874QI/nfCANkfJBDdhyBwHsgnJH8N8X08QOA7ofNA4G8CEfzvhAj+dyMgsPgjJCAw8wlJ8L8TEojvxyEInAfyCclfQ3wfDxD4Tug8EPibQAT/OyGC/90ICCz+CAlEYOYTkuB/JyQQ349DEDgP5BOSv4b4Ph4g8J3QeSDwN4EI/ndCBP+7ERB4J/QJyfWE5K8hvo8HCHwndB4I/E0ggv+dEMH/bgQE3gmdQOBM8hPCbwQE/m6EBP4bQQT/Ow+CfydE8O8+fE8nEPhO6BMI/E0Agn/3hAj+dxYE/44AIfjfCQn8N0IE/4+ECP5/6L/7E8JvBAT+boQE/g9AJHB+SPKdXwL3Ewj8twMS+G8ECf4fgBD8v3dA8O/eEMH/TpDg/wGQBM5PSL7zJXDnuATuJxD4bwck8N8IEvw/ACH4f++A4N+9IYL/nSDB/wMgCZyfkHznS+DOcQncTyDw3w5I4L8RJPh/AELw/94Bwb97QwT/O0GC/wdAEjg/IfnOl8Cd4xK4n0Dgvx2QwH8jSPD/AITg/70Dgn/3hgj+d4IE/w+AJHB+QvKdL4E7xyVwP4HAfzsggf9GkOD/AQjB/3sHBP/uDRH87wQJ/h8ASeD8hOQ7XwJ3jkvgfgKB/3ZAAv+NIMH/AxCC//cOCP7dGyL43wkS/D8AksD5Ccl3vgTuHJfA/QQC/+2ABP4bQYL/ByAE/+8dEPy7N0TwvxMk+H8AJIHzE5LvfAncOS6B+wkE/tsBCfw3ggT/D0AI/t87IPh3b4jgfydI8P8ASALnJyTf+RK4c1wC9xMI/LcDEvhvBAn+H4AQ/L93QPDv3hDB/06Q4P8BkATOT0i+8yVw57gE7icQ+G8HJPDfCBL8PwAh+H/vgODfvSGC/50gwf8DIAmcn5B850vgznEJ3E8g8N8OSOC/EST4fwBC8P/eAcG/e0ME/ztBgv8HQBI4PyH5zpfAneMSuJ9A4L8dkMB/I0jw/wCE4P+9A4J/94YI/neCBP8PgCRwfkLynS+BO8clcD+BwH87IIH/RpDg/wEIwf97BwT/7g0R/O8ECf4fAEng/ITkO18Cd45L4H4Cgf92QAL/jSDB/wMQgv/3Dgj+3Rsi+N8JEvw/AJLA+QnJd74E7hyXwP0EAv/tgAT+G0GC/wdAEjg/IfnOl8Cd4xK4n0Dgvx2QwH8jSPD/AEgC5yck3/kSuHNcAvcTCPy3AxL4bwQJ/h+AEPy/d0Dw794Qwf9OkOD/AZAEzk9IvvMlcOe4BO4nEPhvByTw3wgS/D8AIfh/74Dg370hgv+dIMH/AyAJnJ+QfOdL4M5xCdxPIPDfDkjgvxEk+H8AQvD/3gHBv3tDBP87QYL/B0ASOD8h+c6XwJ3jErifQOC/HZDA/z8S+AL+Df7bJQAAAABJRU5ErkJggg==",
  backupCodes: [
    "ABC123",
    "DEF456",
    "GHI789",
    "JKL012",
    "MNO345",
    "PQR678",
    "STU901",
    "VWX234",
  ],
};

interface TOTPSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ── Toggle component ─────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <label
      className="cursor-pointer"
      aria-label={label ?? (checked ? "Enabled" : "Disabled")}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:ring-offset-2 ${
          checked ? "bg-gray-900" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </label>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1 px-1">
        {title}
      </p>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
        {children}
      </div>
    </motion.div>
  );
}

// ── Generic row ──────────────────────────────────────────────────────────────
function Row({
  icon: Icon,
  label,
  description,
  right,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 md:py-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon
            className="h-4 w-4 md:h-[18px] md:w-[18px] text-gray-500"
            strokeWidth={1.8}
          />
        </span>
        <div className="min-w-0">
          <p className="text-sm md:text-base font-medium text-gray-900 leading-tight">
            {label}
          </p>
          {description && (
            <p className="text-xs md:text-sm text-gray-400 mt-0.5 leading-tight truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{right}</div>
    </div>
  );
}

// ── Chevron right link ───────────────────────────────────────────────────────
function LinkArrow() {
  return (
    <ChevronRight
      className="h-4 w-4 md:h-5 md:w-5 text-gray-300"
      strokeWidth={2}
    />
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const { theme, setTheme } = useUIStore();

  // ── Notification & Privacy toggles ──────────────────────────────────────
  const [notifs, setNotifs] = useState({
    orders: true,
    messages: true,
    promotions: false,
    push: false,
  });
  const [privacy, setPrivacy] = useState({
    showOnline: true,
    showLastSeen: false,
  });

  // ── 2FA state ────────────────────────────────────────────────────────────
  const [show2FA, setShow2FA] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFASuccess, setTwoFASuccess] = useState<string | null>(null);
  const [totpSetup, setTotpSetup] = useState<TOTPSetupData | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const isEnabled = user?.twoFactorEnabled ?? false;
  const currentMethod = user?.twoFactorMethod ?? "none";

  const reset2FAState = () => {
    setTotpSetup(null);
    setVerifyCode("");
    setShowBackupCodes(false);
    setTwoFAError(null);
    setTwoFASuccess(null);
  };

  const handleSetupTOTP = async () => {
    setTwoFALoading(true);
    setTwoFAError(null);
    await new Promise((r) => setTimeout(r, 400));
    if (USE_MOCK_2FA) {
      setTotpSetup(mockTOTPSetup);
    } else {
      try {
        const api = (await import("@/lib/api")).default;
        const { extractData } = await import("@/lib/api");
        const res = await api.post("/user/me/2fa/setup");
        setTotpSetup(extractData<TOTPSetupData>(res));
      } catch (err: unknown) {
        const e = err as { message?: string };
        setTwoFAError(e.message ?? "Failed to start setup");
      }
    }
    setTwoFALoading(false);
  };

  const handleVerifyTOTP = async () => {
    if (verifyCode.length !== 6) {
      setTwoFAError("Enter a valid 6-digit code");
      return;
    }
    setTwoFALoading(true);
    setTwoFAError(null);
    await new Promise((r) => setTimeout(r, 400));
    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: "totp" });
      setTwoFASuccess("Authenticator app enabled.");
      setShowBackupCodes(true);
    } else {
      try {
        const api = (await import("@/lib/api")).default;
        await api.post("/user/me/2fa/confirm", { code: verifyCode });
        await updateProfile({
          twoFactorEnabled: true,
          twoFactorMethod: "totp",
        });
        setTwoFASuccess("Authenticator app enabled.");
        setShowBackupCodes(true);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setTwoFAError(e.message ?? "Invalid code");
      }
    }
    setTwoFALoading(false);
  };

  const handleDisable2FA = async () => {
    if (
      !confirm(
        "Disable two-factor authentication? This will make your account less secure.",
      )
    )
      return;
    setTwoFALoading(true);
    setTwoFAError(null);
    await new Promise((r) => setTimeout(r, 400));
    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: false, twoFactorMethod: "none" });
      setTwoFASuccess("Two-factor authentication disabled.");
      reset2FAState();
    } else {
      try {
        const api = (await import("@/lib/api")).default;
        await api.post("/user/me/2fa/disable");
        await updateProfile({
          twoFactorEnabled: false,
          twoFactorMethod: "none",
        });
        setTwoFASuccess("Two-factor authentication disabled.");
        reset2FAState();
      } catch (err: unknown) {
        const e = err as { message?: string };
        setTwoFAError(e.message ?? "Failed to disable 2FA");
      }
    }
    setTwoFALoading(false);
  };

  const copySecret = () => {
    if (totpSetup?.secret) {
      navigator.clipboard.writeText(totpSetup.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    navigate("/login?redirect=/settings");
    return null;
  }

  return (
    <div className="max-w7xl mx-auto py-8 space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-[2rem] font-semibold text-gray-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-0.5">
          Manage your account & preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[450px_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* ── ACCOUNT ─────────────────────────────────────────────────────── */}
          <Section title="Account" delay={0.05}>
            <Link to="/profile">
              <Row
                icon={User}
                label="Edit Profile"
                description="Name, photo, and personal info"
                right={<LinkArrow />}
              />
            </Link>
            <Link to="/addresses">
              <Row
                icon={MapPin}
                label="Addresses"
                description="Manage delivery addresses"
                right={<LinkArrow />}
              />
            </Link>
            <Link to="/payments">
              <Row
                icon={CreditCard}
                label="Payment Methods"
                description="Saved cards and mobile money"
                right={<LinkArrow />}
              />
            </Link>
          </Section>

          {/* ── SECURITY ─────────────────────────────────────────────────────── */}
          <Section title="Security" delay={0.1}>
            {/* Change password */}
            <Link to="/profile?tab=password">
              <Row
                icon={KeyRound}
                label="Change Password"
                description="Update your account password"
                right={<LinkArrow />}
              />
            </Link>

            {/* 2FA row — tap to expand */}
            <div>
              <button
                className="w-full text-left"
                type="button"
                onClick={() => {
                  setShow2FA((v) => !v);
                  reset2FAState();
                }}
              >
                <div className="flex items-center justify-between px-4 py-3.5 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Shield
                        className="h-4 w-4 text-gray-500"
                        strokeWidth={1.8}
                      />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          Two-Factor Authentication
                        </p>
                        {isEnabled && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-50 text-emerald-600 border-emerald-100 font-medium">
                            ON
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-400 mt-0.5 leading-tight">
                        {isEnabled
                          ? `Active via ${currentMethod === "totp" ? "authenticator app" : "OTP"}`
                          : "Add an extra layer of security"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${show2FA ? "rotate-180" : ""}`}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {/* Inline 2FA panel */}
              <AnimatePresence>
                {show2FA && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-50">
                      {twoFAError && (
                        <Alert variant="destructive" className="py-2 text-sm">
                          {twoFAError}
                        </Alert>
                      )}
                      {twoFASuccess && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">
                          <Check className="h-4 w-4 flex-shrink-0" />
                          {twoFASuccess}
                        </div>
                      )}

                      {/* ── Not yet set up ── */}
                      {!isEnabled && !totpSetup && !showBackupCodes && (
                        <div className="space-y-2">
                          <p className="text-xs md:text-sm text-gray-400">
                            Use an authenticator app (Google Authenticator,
                            Authy, etc.) to generate login codes.
                          </p>
                          <Button
                            size="sm"
                            className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs"
                            onClick={handleSetupTOTP}
                            disabled={twoFALoading}
                          >
                            {twoFALoading && (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            )}
                            Set up authenticator
                          </Button>
                        </div>
                      )}

                      {/* ── QR / verify flow ── */}
                      {totpSetup && !showBackupCodes && (
                        <div className="space-y-3">
                          <div className="flex flex-col items-center gap-3 bg-gray-50 rounded-xl p-4">
                            <img
                              src={totpSetup.qrCode}
                              alt="QR code"
                              className="h-36 w-36 rounded-lg"
                            />
                            <p className="text-xs md:text-sm text-gray-400 text-center">
                              Scan with your authenticator app
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                            <code className="flex-1 text-xs font-mono text-gray-600 break-all">
                              {totpSetup.secret}
                            </code>
                            <button
                              onClick={copySecret}
                              type="button"
                              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                              aria-label="Copy authenticator secret"
                            >
                              {copiedSecret ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div>
                            <label className="text-xs md:text-sm font-medium text-gray-600 block mb-1.5">
                              Enter the 6-digit code from your app
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={verifyCode}
                                onChange={(e) =>
                                  setVerifyCode(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                                placeholder="000000"
                                className="flex-1 h-10 px-3 text-center text-lg font-mono tracking-widest rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                              />
                              <Button
                                size="sm"
                                className="h-10 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs"
                                onClick={handleVerifyTOTP}
                                disabled={
                                  twoFALoading || verifyCode.length !== 6
                                }
                              >
                                {twoFALoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Verify"
                                )}
                              </Button>
                            </div>
                          </div>
                          <button
                            onClick={() => setTotpSetup(null)}
                            type="button"
                            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
                          >
                            Cancel setup
                          </button>
                        </div>
                      )}

                      {/* ── Backup codes ── */}
                      {showBackupCodes && totpSetup?.backupCodes && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5">
                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span>
                              Save these backup codes in a safe place — you will
                              need them if you lose access to your app.
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {totpSetup.backupCodes.map((code, i) => (
                              <div
                                key={i}
                                className="bg-gray-50 rounded-lg py-1.5 text-center font-mono text-xs text-gray-600"
                              >
                                {code}
                              </div>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-xl text-xs border-gray-200"
                            onClick={() => {
                              setShowBackupCodes(false);
                              setTotpSetup(null);
                              setShow2FA(false);
                            }}
                          >
                            Done
                          </Button>
                        </div>
                      )}

                      {/* ── Disable 2FA ── */}
                      {isEnabled && !totpSetup && !showBackupCodes && (
                        <button
                          onClick={handleDisable2FA}
                          disabled={twoFALoading}
                          type="button"
                          className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2 disabled:opacity-50"
                        >
                          {twoFALoading && (
                            <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                          )}
                          Disable two-factor authentication
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* ── LOGOUT ───────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button
              onClick={handleLogout}
              type="button"
              className="hidden w-full lg:flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              Log Out
            </button>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* ── NOTIFICATIONS ────────────────────────────────────────────────── */}
          <Section title="Notifications" delay={0.15}>
            <Row
              icon={Bell}
              label="Order Updates"
              description="Status changes on your orders"
              right={
                <Toggle
                  checked={notifs.orders}
                  onChange={() =>
                    setNotifs((p) => ({ ...p, orders: !p.orders }))
                  }
                />
              }
            />
            <Row
              icon={Mail}
              label="Messages"
              description="New messages from sellers"
              right={
                <Toggle
                  checked={notifs.messages}
                  onChange={() =>
                    setNotifs((p) => ({ ...p, messages: !p.messages }))
                  }
                />
              }
            />
            <Row
              icon={Bell}
              label="Promotions"
              description="Deals, discounts, and offers"
              right={
                <Toggle
                  checked={notifs.promotions}
                  onChange={() =>
                    setNotifs((p) => ({ ...p, promotions: !p.promotions }))
                  }
                />
              }
            />
            {/* Push notifications — placeholder for future browser/FCM activation */}
            <div>
              <Row
                icon={Smartphone}
                label="Push Notifications"
                description={
                  notifs.push
                    ? "Enabled on this device"
                    : "Get alerts even when the app is closed"
                }
                right={
                  <Toggle
                    checked={notifs.push}
                    onChange={() => setNotifs((p) => ({ ...p, push: !p.push }))}
                  />
                }
              />
              <AnimatePresence>
                {notifs.push && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mx-4 mb-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-500">
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      Push notification activation coming soon — we will prompt
                      you to allow browser permissions when ready.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* ── APPEARANCE ───────────────────────────────────────────────────── */}
          <Section title="Appearance" delay={0.2}>
            <Row
              icon={theme === "dark" ? Moon : Sun}
              label="Theme"
              description="Light, dark, or match system"
              right={
                <Select
                  value={theme}
                  onValueChange={(v) =>
                    setTheme(v as "light" | "dark" | "system")
                  }
                >
                  <SelectTrigger className="w-28 h-8 text-xs rounded-xl border-gray-200 focus:ring-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <Row
              icon={Globe}
              label="Language"
              description="Display language"
              right={
                <Select defaultValue="en">
                  <SelectTrigger className="w-28 h-8 text-xs rounded-xl border-gray-200 focus:ring-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </Section>

          {/* ── PRIVACY ──────────────────────────────────────────────────────── */}
          <Section title="Privacy" delay={0.25}>
            <Row
              icon={Lock}
              label="Show Online Status"
              description="Let sellers see when you're active"
              right={
                <Toggle
                  checked={privacy.showOnline}
                  onChange={() =>
                    setPrivacy((p) => ({ ...p, showOnline: !p.showOnline }))
                  }
                />
              }
            />
            <Row
              icon={Lock}
              label="Show Last Seen"
              description="Display your last activity time"
              right={
                <Toggle
                  checked={privacy.showLastSeen}
                  onChange={() =>
                    setPrivacy((p) => ({ ...p, showLastSeen: !p.showLastSeen }))
                  }
                />
              }
            />
          </Section>

          {/* ── SUPPORT ──────────────────────────────────────────────────────── */}
          <Section title="Support" delay={0.3}>
            <Link to="/help">
              <Row
                icon={HelpCircle}
                label="Help Center"
                description="FAQs and support articles"
                right={<LinkArrow />}
              />
            </Link>
            <Link to="/terms">
              <Row
                icon={FileText}
                label="Terms of Service"
                right={<LinkArrow />}
              />
            </Link>
            <Link to="/privacy">
              <Row
                icon={FileText}
                label="Privacy Policy"
                right={<LinkArrow />}
              />
            </Link>
          </Section>
        </div>
      </div>

      {/* ── LOGOUT ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          onClick={handleLogout}
          type="button"
          className="flex w-full lg:hidden items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          Log Out
        </button>
      </motion.div>

      {/* App version */}
      <p className="text-center text-xs text-gray-300 pb-4">
        Campuzon v1.0.0 · © 2025
      </p>
    </div>
  );
}
