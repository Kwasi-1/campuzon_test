import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Building,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthPage } from "@/components/auth-page";
import {
  CustomInputTextField,
  SearchableSelectField,
} from "@/components/shared/text-field";
import { useAuthStore } from "@/stores";
import { mockInstitutions } from "@/lib/mockData";
import { extractError } from "@/lib/api";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^[+]?[\d\s-()]+$/, "Please enter a valid phone number"),
    institutionID: z.string().min(1, "Please select your institution"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      const selectedInstitution = mockInstitutions.find(
        (i) => i.id === data.institutionID,
      );
      const institutionName =
        selectedInstitution?.name || "Unknown Institution";

      const registerResult = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        institutionID: data.institutionID,
        institutionName: institutionName,
      });

      if (registerResult.verificationRequired && registerResult.userId) {
        navigate("/verify-account", {
          replace: true,
          state: {
            userId: registerResult.userId,
            email: registerResult.email || data.email,
            phoneNumber: registerResult.phoneNumber || data.phoneNumber,
            redirect: "/",
          },
        });
        return;
      }

      navigate("/");
    } catch (err: unknown) {
      setError(extractError(err));
    }
  };

  return (
    <AuthPage
      heading="Create Account"
      subheading="Join Campuzon and start buying or selling"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="grid grid-cols-2 gap-4">
          <CustomInputTextField
            label="First Name"
            placeholder="John"
            startContent={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            labelPlacement="outside"
            inputProps={register("firstName")}
          />
          <CustomInputTextField
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            labelPlacement="outside"
            inputProps={register("lastName")}
          />
        </div>

        <CustomInputTextField
          label="University Email"
          type="email"
          placeholder="you@university.edu"
          startContent={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          labelPlacement="outside"
          inputProps={register("email")}
        />

        <CustomInputTextField
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          startContent={<Phone className="h-4 w-4" />}
          error={errors.phoneNumber?.message}
          labelPlacement="outside"
          inputProps={register("phoneNumber")}
        />

        <Controller
          name="institutionID"
          control={control}
          render={({ field }) => (
            <SearchableSelectField
              label="Institution"
              placeholder="Select your institution"
              labelPlacement="outside"
              value={field.value}
              onValueChange={field.onChange}
              options={mockInstitutions.map((institution) => ({
                value: institution.id,
                label: `${institution.name} (${institution.shortName})`,
                description: institution.shortName,
              }))}
              error={errors.institutionID?.message}
              selectProps={{
                startContent: <Building className="h-4 w-4" />,
              }}
            />
          )}
        />

        <CustomInputTextField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          startContent={<Lock className="h-4 w-4" />}
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          labelPlacement="outside"
          inputProps={register("password")}
        />

        <CustomInputTextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          startContent={<Lock className="h-4 w-4" />}
          endContent={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          error={errors.confirmPassword?.message}
          labelPlacement="outside"
          inputProps={register("confirmPassword")}
        />

        <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            id="terms"
            className="rounded border-border mt-1"
            required
          />
          <label htmlFor="terms" className="text-muted-foreground">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthPage>
  );
}
