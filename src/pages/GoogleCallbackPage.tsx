import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useAuthStore } from '@/stores';

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL params (sent by backend after Google OAuth)
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam);
        return;
      }

      if (!accessToken || !refreshToken) {
        setError('Authentication failed. Missing tokens.');
        return;
      }

      try {
        // Login with the tokens and check if profile is complete
        const isComplete = await loginWithGoogle(accessToken, refreshToken);

        if (isComplete) {
          // Profile is complete, go to home
          navigate('/', { replace: true });
        } else {
          // Profile incomplete, need phone and institution
          navigate('/complete-profile', { 
            replace: true,
            state: { from: '/' }
          });
        }
      } catch (err) {
        setError('Failed to complete authentication. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, loginWithGoogle, navigate]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
