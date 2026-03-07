import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ForgotPasswordProps {
  onComplete: () => void;
  onBack: () => void;
}

type Step = 'email' | 'verification' | 'reset';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Reset Code Sent",
        description: `A 6-digit code has been sent to ${email}`,
      });
      
      setStep('verification');
    } catch (err) {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call - accept "123456" as valid
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (verificationCode === '123456') {
        setStep('reset');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      setError('Password does not meet security requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. Please login with your new password.",
      });
      
      onComplete();
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto md:p-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>
              {step === 'email' && 'Enter your email to receive a reset code'}
              {step === 'verification' && 'Enter the 6-digit code sent to your email'}
              {step === 'reset' && 'Create a new secure password'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendResetCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </form>
        )}

        {step === 'verification' && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Code sent to: <span className="font-medium">{email}</span>
              </p>
              <InputOTP
                value={verificationCode}
                onChange={(value) => {
                  setVerificationCode(value);
                  setError('');
                }}
                maxLength={6}
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
              className="w-full max-w-sm mx-auto flex items-center justify-center"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep('email')}
                className="text-sm text-muted-foreground"
              >
                Change email address
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              Demo code: <span className="font-mono font-semibold">123456</span>
            </div>
          </div>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Password Requirements:</p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-1 h-1 rounded-full mr-2 ${passwordValidation.minLength ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center ${passwordValidation.hasUpper ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-1 h-1 rounded-full mr-2 ${passwordValidation.hasUpper ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  One uppercase letter
                </div>
                <div className={`flex items-center ${passwordValidation.hasLower ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-1 h-1 rounded-full mr-2 ${passwordValidation.hasLower ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  One lowercase letter
                </div>
                <div className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-1 h-1 rounded-full mr-2 ${passwordValidation.hasNumber ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  One number
                </div>
                <div className={`flex items-center ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-1 h-1 rounded-full mr-2 ${passwordValidation.hasSpecial ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                  One special character
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;