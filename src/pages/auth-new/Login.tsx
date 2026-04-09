import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthPage } from "@/components/auth-page";
import { CustomInputTextField } from "@/components/shared/text-field";
import { useAuthStore } from "@/stores";
import { extractError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const goToVerification = (
    userId?: string,
    email?: string,
    phoneNumber?: string,
  ) => {
    if (!userId) {
      setError(
        "Your account is not verified yet. Please check your email or contact support.",
      );
      return;
    }

    navigate("/verify-account", {
      state: {
        userId,
        email,
        phoneNumber,
        redirect,
      },
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const tfaResult = await login(data.email, data.password);

      // Check if 2FA is required
      if (tfaResult?.requires2FA) {
        // Redirect to 2FA verification page with temp token
        navigate("/verify-2fa", {
          state: {
            tempToken: tfaResult.tempToken,
            method: tfaResult.method,
            redirect,
          },
        });
        return;
      }

      // No 2FA, proceed to destination
      navigate(redirect);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.error;
        const message = apiError?.message;

        if (message === "ACCOUNT_NOT_VERIFIED") {
          goToVerification(
            apiError?.data?.userId,
            apiError?.data?.email,
            apiError?.data?.phoneNumber,
          );
          return;
        }
      }

      setError(extractError(err));
    }
  };

  return (
    <AuthPage
      heading="Welcome Back"
      subheading="Sign in to your Campuzon account"
      showGoogleButton={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="destructive">{error}</Alert>}

        <CustomInputTextField
          label="Email"
          type="email"
          placeholder="you@university.edu"
          startContent={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          labelPlacement="outside"
          inputProps={register("email")}
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-border" />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>

      <p className="mt-8 text-muted-foreground text-sm">
        By clicking continue, you agree to our{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          to="/terms"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          to="/privacy"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </AuthPage>
  );
};

export default Login;
