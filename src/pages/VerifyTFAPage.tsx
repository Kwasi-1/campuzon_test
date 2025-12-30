import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2, ArrowLeft, Smartphone, Mail } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import api from '@/lib/api';
import type { TwoFactorMethod } from '@/types';

interface VerifyTFAPageState {
  tempToken: string;
  method: TwoFactorMethod;
  redirect?: string;
}

export function VerifyTFAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify2FA } = useAuthStore();
  
  const state = location.state as VerifyTFAPageState | null;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no state
  useEffect(() => {
    if (!state?.tempToken) {
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCode.every((digit) => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    if (!state) return;
    
    setError(null);
    setIsLoading(true);

    try {
      await verify2FA(state.tempToken, verificationCode);
      navigate(state.redirect || '/', { replace: true });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!state || resendCooldown > 0) return;
    
    setIsResending(true);
    setError(null);

    try {
      await api.post('/auth/resend-2fa', {
        tempToken: state.tempToken,
      });
      setResendCooldown(60);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!state) {
    return null;
  }

  const isOTP = state.method === 'otp';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              {isOTP ? (
                <>
                  <Mail className="inline h-4 w-4 mr-1" />
                  Enter the 6-digit code sent to your email/phone
                </>
              ) : (
                <>
                  <Smartphone className="inline h-4 w-4 mr-1" />
                  Enter the code from your authenticator app
                </>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            {/* Code Input */}
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={isLoading || code.some((d) => !d)}
              onClick={() => handleVerify(code.join(''))}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>

            {/* Resend Code (OTP only) */}
            {isOTP && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isResending || resendCooldown > 0}
                  onClick={handleResendCode}
                >
                  {isResending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Code'}
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
