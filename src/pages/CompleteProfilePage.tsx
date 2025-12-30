import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Phone, Building, Loader2, UserCheck } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  Select,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { mockInstitutions } from '@/lib/mockData';

const completeProfileSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number'),
  institutionID: z.string().min(1, 'Please select your institution'),
});

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from state or default to home
  const from = (location.state as { from?: string })?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
  });

  const onSubmit = async (data: CompleteProfileFormData) => {
    setError(null);
    try {
      await updateProfile({
        phoneNumber: data.phoneNumber,
        institutionID: data.institutionID,
      });
      navigate(from);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to update profile. Please try again.');
    }
  };

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
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              {user?.firstName ? `Welcome, ${user.firstName}! ` : ''}
              We need a few more details to get you started.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  {error}
                </Alert>
              )}

              {/* Show user's email if available */}
              {user?.email && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              )}

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.phoneNumber?.message}
                hint="Required for order notifications and seller contact"
                {...register('phoneNumber')}
              />

              <Select
                label="Institution"
                placeholder="Select your institution"
                leftIcon={<Building className="h-4 w-4" />}
                error={errors.institutionID?.message}
                options={mockInstitutions.map((institution) => ({
                  value: institution.id,
                  label: `${institution.name} (${institution.shortName})`,
                }))}
                {...register('institutionID')}
              />

              <p className="text-xs text-muted-foreground">
                Your institution helps us connect you with campus sellers and enables campus-specific features.
              </p>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
