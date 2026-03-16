import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  Copy,
  Loader2,
  Mail,
  Shield,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuthStore } from "@/stores";
import { extractData, extractError } from "@/lib/api";

const USE_MOCK_2FA = true;

const mockTOTPSetup = {
  secret: "JBSWY3DPEHPK3PXP",
  qrCode:
    "data:image/png;base64,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",
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

type TOTPSetupData = {
  secret: string;
  qrCode: string;
  backupCodes: string[];
};

type SecuritySettingsSectionProps = {
  includePushActivation?: boolean;
  title?: string;
  description?: string;
};

export function SecuritySettingsSection({
  includePushActivation = false,
  title = "Security",
  description = "Password, 2FA, and notification permissions",
}: SecuritySettingsSectionProps) {
  const { user, updateProfile, fetchProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totpSetup, setTotpSetup] = useState<TOTPSetupData | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [pushPermission, setPushPermission] = useState<
    NotificationPermission | "unsupported"
  >(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );

  const currentMethod = user?.twoFactorMethod || "none";
  const isEnabled = user?.twoFactorEnabled || false;

  const handleEnablePush = async () => {
    if (!("Notification" in window)) {
      setPushPermission("unsupported");
      setError("Push notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    setPushPermission(permission);

    if (permission === "granted") {
      setSuccess("Push notifications are enabled for this browser.");
      setError(null);
      return;
    }

    setError("Push notification permission was not granted.");
  };

  const handleEnableOTP = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: "otp" });
      setSuccess("OTP verification enabled.");
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import("@/lib/api")).default;
      await api.post("/auth/2fa/enable-otp");
      await fetchProfile();
      setSuccess("OTP verification enabled.");
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTOTP = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (USE_MOCK_2FA) {
      setTotpSetup(mockTOTPSetup);
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import("@/lib/api")).default;
      const response = await api.post("/auth/2fa/setup-totp");
      const data = extractData<TOTPSetupData>(response);
      setTotpSetup(data);
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: "totp" });
      setSuccess("Authenticator app enabled.");
      setShowBackupCodes(true);
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import("@/lib/api")).default;
      await api.post("/auth/2fa/verify-totp", { code: verifyCode });
      await fetchProfile();
      setSuccess("Authenticator app enabled.");
      setShowBackupCodes(true);
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (
      !confirm(
        "Are you sure you want to disable two-factor authentication? This will reduce account security.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: false, twoFactorMethod: "none" });
      setTotpSetup(null);
      setVerifyCode("");
      setShowBackupCodes(false);
      setSuccess("Two-factor authentication disabled.");
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import("@/lib/api")).default;
      await api.post("/auth/2fa/disable");
      await fetchProfile();
      setTotpSetup(null);
      setVerifyCode("");
      setShowBackupCodes(false);
      setSuccess("Two-factor authentication disabled.");
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (!totpSetup?.secret) return;
    navigator.clipboard.writeText(totpSetup.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyBackupCodes = () => {
    if (!totpSetup?.backupCodes) return;
    navigator.clipboard.writeText(totpSetup.backupCodes.join("\n"));
    setSuccess("Backup codes copied.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <Alert variant="destructive">{error}</Alert>}
        {success && <Alert>{success}</Alert>}

        {includePushActivation && (
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium">
                  <Bell className="h-4 w-4" />
                  Push Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  {pushPermission === "unsupported"
                    ? "Not supported"
                    : pushPermission}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleEnablePush}
                disabled={pushPermission === "granted"}
              >
                {pushPermission === "granted" ? "Activated" : "Activate"}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                {isEnabled
                  ? `Enabled via ${currentMethod === "otp" ? "SMS/Email OTP" : "Authenticator App"}`
                  : "Not enabled"}
              </p>
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-full ${isEnabled ? "bg-green-500" : "bg-gray-300"}`}
            />
          </div>

          {user?.isOwner && !isEnabled && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <span>Recommended for store owners.</span>
            </Alert>
          )}

          {!isEnabled && !totpSetup && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4" />
                  SMS/Email OTP
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Simple verification code at sign in.
                </p>
                <Button
                  onClick={handleEnableOTP}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enable OTP
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <Smartphone className="h-4 w-4" />
                  Authenticator App
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Google Authenticator, Authy, and similar apps.
                </p>
                <Button
                  onClick={handleSetupTOTP}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Setup TOTP
                </Button>
              </div>
            </div>
          )}

          {totpSetup && !showBackupCodes && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-4">
                <img
                  src={totpSetup.qrCode}
                  alt="QR code for authenticator"
                  className="h-40 w-40 rounded-md"
                />
                <p className="text-center text-xs text-muted-foreground">
                  Scan this QR code with your authenticator app.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Manual setup key
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded border border-border bg-muted px-2 py-1 text-xs break-all">
                    {totpSetup.secret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                  >
                    {copiedSecret ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Enter 6-digit code
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) =>
                      setVerifyCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-center font-mono tracking-widest"
                  />
                  <Button
                    onClick={handleVerifyTOTP}
                    disabled={isLoading || verifyCode.length !== 6}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setTotpSetup(null)}
              >
                Cancel Setup
              </Button>
            </div>
          )}

          {showBackupCodes && totpSetup?.backupCodes && (
            <div className="mt-4 space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <span>Save these backup codes before continuing.</span>
              </Alert>

              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-3">
                {totpSetup.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="rounded bg-muted px-2 py-1 text-center font-mono text-xs"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={copyBackupCodes}
                  className="sm:flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Codes
                </Button>
                <Button
                  className="sm:flex-1"
                  onClick={() => {
                    setShowBackupCodes(false);
                    setTotpSetup(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {isEnabled && !totpSetup && (
            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDisable2FA}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable 2FA
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
