import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Mail,
  Check,
  Loader2,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  Breadcrumb,
} from '@/components/ui';
import { useAuthStore } from '@/stores';

// ========== MOCK MODE FOR TESTING ==========
const USE_MOCK_2FA = true; // Set to false when backend is ready

// Mock TOTP setup data
const mockTOTPSetup = {
  secret: 'JBSWY3DPEHPK3PXP',
  qrCode: 'data:image/png;base64,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',
  backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678', 'STU901', 'VWX234'],
};
// ============================================

interface TOTPSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function TwoFactorSettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // TOTP setup state
  const [totpSetup, setTotpSetup] = useState<TOTPSetupData | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const currentMethod = user?.twoFactorMethod || 'none';
  const isEnabled = user?.twoFactorEnabled || false;

  const handleEnableOTP = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: 'otp' });
      setSuccess('OTP verification enabled! You will receive a code via SMS/email when logging in.');
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/auth/2fa/enable-otp');
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: 'otp' });
      setSuccess('OTP verification enabled! You will receive a code via SMS/email when logging in.');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to enable OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTOTP = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (USE_MOCK_2FA) {
      setTotpSetup(mockTOTPSetup);
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import('@/lib/api')).default;
      const { extractData } = await import('@/lib/api');
      const response = await api.post('/auth/2fa/setup-totp');
      const data = extractData<TOTPSetupData>(response);
      setTotpSetup(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to setup authenticator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (USE_MOCK_2FA) {
      // Any 6-digit code works in mock mode
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: 'totp' });
      setSuccess('Authenticator app enabled successfully!');
      setShowBackupCodes(true);
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/auth/2fa/verify-totp', { code: verifyCode });
      await updateProfile({ twoFactorEnabled: true, twoFactorMethod: 'totp' });
      setSuccess('Authenticator app enabled successfully!');
      setShowBackupCodes(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (USE_MOCK_2FA) {
      await updateProfile({ twoFactorEnabled: false, twoFactorMethod: 'none' });
      setTotpSetup(null);
      setVerifyCode('');
      setSuccess('Two-factor authentication disabled');
      setIsLoading(false);
      return;
    }

    try {
      const api = (await import('@/lib/api')).default;
      await api.post('/auth/2fa/disable');
      await updateProfile({ twoFactorEnabled: false, twoFactorMethod: 'none' });
      setTotpSetup(null);
      setVerifyCode('');
      setSuccess('Two-factor authentication disabled');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (totpSetup?.secret) {
      navigator.clipboard.writeText(totpSetup.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const copyBackupCodes = () => {
    if (totpSetup?.backupCodes) {
      navigator.clipboard.writeText(totpSetup.backupCodes.join('\n'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Breadcrumb
        items={[
          { label: 'Settings', href: '/settings' },
          { label: 'Two-Factor Authentication' },
        ]}
        className="mb-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}
            {success && (
              <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700 dark:text-green-400">{success}</span>
              </Alert>
            )}

            {/* Current Status */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isEnabled
                      ? `Enabled via ${currentMethod === 'otp' ? 'SMS/Email OTP' : 'Authenticator App'}`
                      : 'Not enabled'}
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>

            {/* Store Owner Recommendation */}
            {user?.isOwner && !isEnabled && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <span>
                  <strong>Recommended for store owners:</strong> Enable 2FA to protect your store and customer data.
                </span>
              </Alert>
            )}

            {/* 2FA Options */}
            {!isEnabled && !totpSetup && (
              <div className="space-y-4">
                <h3 className="font-medium">Choose a method:</h3>
                
                {/* OTP Option */}
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">SMS/Email OTP</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Receive a one-time code via SMS or email each time you log in. Simple and convenient.
                      </p>
                      <Button
                        onClick={handleEnableOTP}
                        disabled={isLoading}
                        size="sm"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Enable OTP
                      </Button>
                    </div>
                  </div>
                </div>

                {/* TOTP Option */}
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use Google Authenticator, Authy, or similar apps. More secure and works offline.
                      </p>
                      <Button
                        onClick={handleSetupTOTP}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Setup Authenticator
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOTP Setup Flow */}
            {totpSetup && !showBackupCodes && (
              <div className="space-y-6">
                <h3 className="font-medium">Setup Authenticator App</h3>
                
                {/* QR Code */}
                <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg border">
                  <div className="p-2 bg-white rounded-lg">
                    <img
                      src={totpSetup.qrCode}
                      alt="QR Code for authenticator"
                      className="h-48 w-48"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code with your authenticator app
                  </p>
                </div>

                {/* Manual Entry */}
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background rounded text-sm font-mono break-all">
                      {totpSetup.secret}
                    </code>
                    <Button variant="outline" size="icon" onClick={copySecret}>
                      {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Verify Code */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Enter the 6-digit code from your app:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="flex-1 h-12 px-4 text-center text-xl font-mono tracking-widest rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleVerifyTOTP}
                      disabled={isLoading || verifyCode.length !== 6}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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

            {/* Backup Codes */}
            {showBackupCodes && totpSetup?.backupCodes && (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    <strong>Save these backup codes!</strong> You can use them if you lose access to your authenticator app.
                  </span>
                </Alert>

                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-4">
                    {totpSetup.backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-background rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyBackupCodes} className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All Codes
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setShowBackupCodes(false);
                    setTotpSetup(null);
                  }}
                >
                  Done
                </Button>
              </div>
            )}

            {/* Disable 2FA */}
            {isEnabled && !totpSetup && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleDisable2FA}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Disable Two-Factor Authentication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
