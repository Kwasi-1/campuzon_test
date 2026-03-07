import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

interface TwoFactorVerificationProps {
  onVerificationComplete: (code: string) => void;
  email?: string;
  resendCooldown?: number;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onVerificationComplete,
  email = "your registered email",
  resendCooldown = 60,
}) => {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const { toast } = useToast();

  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSuccess("Verification submitted...");
      onVerificationComplete(code);
      toast({
        title: "Code submitted",
        description: "Verifying your code...",
      });
      setSuccess("");
      setCode("");
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [code, onVerificationComplete, toast]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Auto-verify when code reaches 6 digits
  useEffect(() => {
    if (code.length === 6 && !isVerifying) {
      // call without capturing stale handle
      (async () => {
        await handleVerifyCode();
      })();
    }
  }, [code, isVerifying, handleVerifyCode]);

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      const pending = authService.getPendingAuth();
      await authService.requestTfaCode(pending?.username || "");

      setCanResend(false);
      setTimeLeft(resendCooldown);
      setCode("");
      setError("");

      toast({
        title: "Code Resent",
        description: `A new verification code has been sent to ${email}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError("");
  };

  return (
    <Alert className="border-0 p-0 md:py-4">
      <Card className="w-full max-w-lg mx-auto md:py-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || code.length !== 6}
              className="w-full max-w-sm mx-auto flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={!canResend}
                className="text-primary hover:text-primary/80"
              >
                {canResend ? (
                  "Resend Code"
                ) : (
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Resend in {timeLeft}s
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* helper text intentionally removed */}
        </CardContent>
      </Card>
    </Alert>
  );
};

export default TwoFactorVerification;
