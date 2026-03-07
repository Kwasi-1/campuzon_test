import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Input from "@/components/shared/Input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, User, Store, Shield } from "lucide-react";
import SEO from "@/components/SEO";
import ForgotPassword from "@/components/auth/ForgotPassword";
import AppLogo from "@/components/shared/AppLogo";

const UnifiedLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const needs2FA = await login(email, password);
      // Store email for remember me functionality
      if (rememberMe) localStorage.setItem("rememberedEmail", email);

      if (needs2FA) {
        // 2FA step
        sessionStorage.setItem("pendingAuthEmail", email);
        navigate("/2fa-verify");
      } else {
        // Logged in via session cookie
        navigate("/");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleForgotPasswordComplete = () => {
    setShowForgotPassword(false);
    setError("");
  };

  if (showForgotPassword) {
    return (
      <>
        <SEO
          title="Forgot Password - Tobra"
          description="Reset your password to regain access to your Tobra account."
          keywords="forgot password, password reset, account recovery"
        />

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div className="w-9 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl uppercase font-display font-bold text-gray-900">
              Tobra
            </span>
          </Link>

          <ForgotPassword
            onComplete={handleForgotPasswordComplete}
            onBack={() => setShowForgotPassword(false)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Sign In - Tobra"
        description="Sign in to your Tobra account to access your personalized experience."
        keywords="login, sign in, account access, Tobra"
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* <Link to="/" className="flex items-center space-x-2 mb-8">
          <div className="w-9 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl uppercase font-display font-bold text-gray-900">
            Tobra
          </span>
        </Link> */}
        <div className="mb-8">
          <AppLogo />
        </div>

        <Card className="w-full max-w-2xl md:p-10 rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-between py-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me on this device
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm text-primary hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
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

            {/* Role hints */}
            <div className="hidden mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Quick access:
              </p>
              <div className="flex justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>Customer</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Store className="w-3 h-3" />
                  <span>Store (store@...)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin (admin@...)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-gray-600 hidden">
                Want to sell on Tobra?{" "}
                <Link
                  to="/store-signup"
                  className="text-primary hover:underline font-medium"
                >
                  Open a store
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UnifiedLogin;
