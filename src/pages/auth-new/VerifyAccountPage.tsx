import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { AuthPage } from "@/components/auth-page";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CustomInputTextField } from "@/components/shared/text-field";
import { useAuthStore } from "@/stores";
import api, { extractData, extractError } from "@/lib/api";
import type { User } from "@/types-new";
import { parseRedirectTarget } from "@/lib/deepLinkHandler";
import toast from "react-hot-toast";

type PendingAddress = {
  name: string;
  gpsLocation: string;
};

type VerifyAccountLocationState = {
  userId: string;
  email?: string;
  phoneNumber?: string;
  redirect?: string;
  pendingAddress?: PendingAddress | null;
};

export function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setTokens } = useAuthStore();

  const state = location.state as VerifyAccountLocationState | null;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!state?.userId) {
      navigate("/login", { replace: true });
    }
  }, [navigate, state?.userId]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!state?.userId) return;

    const normalizedOtp = otp.replace(/\D/g, "");
    if (normalizedOtp.length !== 6) {
      setError("Enter the 6-digit OTP sent to your email or phone.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await api.post("/auth/verify-otp", {
        userId: state.userId,
        otp: normalizedOtp,
      });

      const data = extractData<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>(response);

      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);

      if (
        state.pendingAddress?.name &&
        state.pendingAddress?.gpsLocation &&
        !data.user.hallID
      ) {
        try {
          await api.post("/user/me/addresses", {
            name: state.pendingAddress.name,
            gpsLocation: state.pendingAddress.gpsLocation,
            type: "off_campus_hostel",
          });
          toast.success("Primary address saved successfully.");
        } catch (addressError) {
          toast.error(
            `Account verified, but we couldn't save your primary address: ${extractError(addressError)}`,
          );
        }
      }

      navigate(parseRedirectTarget(state.redirect, "/"), { replace: true });
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!state?.userId || resendCooldown > 0) return;

    setIsResending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.post("/auth/resend-otp", { userId: state.userId });
      setSuccessMessage("A new OTP has been sent.");
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(extractError(err));
    } finally {
      setIsResending(false);
    }
  };

  if (!state?.userId) return null;

  return (
    <AuthPage
      heading="Verify Your Account"
      subheading="Enter the OTP sent to your email and phone to continue"
      showGoogleButton={false}
    >
      <div className="space-y-4">
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {successMessage ? <Alert>{successMessage}</Alert> : null}

        <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Verifying:{" "}
            <span className="font-medium text-foreground">
              {state.email || "your account"}
            </span>
          </p>
        </div>

        <CustomInputTextField
          label="Verification OTP"
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          labelPlacement="outside"
          inputProps={{ inputMode: "numeric", maxLength: 6 }}
        />

        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={isSubmitting || otp.length !== 6}
          onClick={() => void handleVerify()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Account"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isResending || resendCooldown > 0}
          onClick={() => void handleResend()}
        >
          {isResending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {resendCooldown > 0
            ? `Resend OTP in ${resendCooldown}s`
            : "Resend OTP"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}
