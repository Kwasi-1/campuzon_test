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
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import type { StoreSignupRequest } from "@/services/storeAuthService";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Store,
} from "lucide-react";
import SEO from "@/components/SEO";
import { StoreSignupData } from "@/types";
import AppLogo from "@/components/shared/AppLogo";
import { toast } from "sonner";

const MultiStepStoreSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StoreSignupData>({
    storeName: "",
    storeDescription: "",
    category: "",
    ownerFirstName: "",
    ownerLastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { signup, isLoading } = useStoreAuth();
  const navigate = useNavigate();

  const updateFormData = (field: keyof StoreSignupData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number) => {
    setError("");

    switch (step) {
      case 1:
        if (!formData.storeName || !formData.category) {
          setError("Please fill in all required fields");
          return false;
        }
        break;
      case 2:
        if (
          !formData.ownerFirstName ||
          !formData.ownerLastName ||
          !formData.email
        ) {
          setError("Please fill in all required fields");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        break;
      case 3:
        if (!formData.phone || !formData.address || !formData.city) {
          setError("Please fill in all required fields");
          return false;
        }
        break;
      case 4:
        if (!formData.password || !formData.confirmPassword) {
          setError("Please fill in all required fields");
          return false;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    try {
      // Transform form data to match backend API structure (/stall/auth/register)
      const signupData: StoreSignupRequest = {
        stall_name: formData.storeName,
        description: formData.storeDescription || "",
        name: `${formData.ownerFirstName} ${formData.ownerLastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.phone, // use same as phone for now
        region: formData.region,
        subregion: formData.city, // map city to subregion
        password: formData.password,
      };

      await signup(signupData);

      toast.success(
        "Store registration submitted! Please wait for approval, then sign in."
      );
      navigate("/store-portal/login");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to create store account. Please try again.";
      console.error("Signup error:", err);
      setError(message);
      toast.error(message);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                type="text"
                placeholder="Enter your store name"
                value={formData.storeName}
                onChange={(e) => updateFormData("storeName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Store Category *</Label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., Grocery, Electronics, Fashion"
                value={formData.category}
                onChange={(e) => updateFormData("category", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Input
                id="storeDescription"
                type="text"
                placeholder="Brief description of your store"
                value={formData.storeDescription}
                onChange={(e) =>
                  updateFormData("storeDescription", e.target.value)
                }
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerFirstName">First Name *</Label>
                <Input
                  id="ownerFirstName"
                  type="text"
                  placeholder="Owner's first name"
                  value={formData.ownerFirstName}
                  onChange={(e) =>
                    updateFormData("ownerFirstName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerLastName">Last Name *</Label>
                <Input
                  id="ownerLastName"
                  type="text"
                  placeholder="Owner's last name"
                  value={formData.ownerLastName}
                  onChange={(e) =>
                    updateFormData("ownerLastName", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Business Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  type="text"
                  placeholder="Region/State"
                  value={formData.region}
                  onChange={(e) => updateFormData("region", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateFormData("confirmPassword", e.target.value)
                  }
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
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    "Store Info",
    "Owner Details",
    "Contact & Location",
    "Account Security",
  ];

  return (
    <>
      <SEO
        title="Open Your Store - Tobra"
        description="Join Tobra as a merchant and start selling to thousands of customers."
        keywords="store signup, merchant registration, sell online, Tobra business"
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <AppLogo className="mb-6" />

        <Card className="w-full max-w-2xl md:p-10 rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Register Your Store
            </CardTitle>
            <CardDescription className="text-center">
              Step {currentStep} of 4: {stepTitles[currentStep - 1]}
            </CardDescription>

            {/* Progress indicator */}
            <div className="flex space-x-2 pt-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-[6px] rounded-full ${
                    step <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={
                currentStep === 4
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      nextStep();
                    }
              }
            >
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded mb-4">
                  {error}
                </div>
              )}

              {renderStep()}

              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}

                <Button
                  type="submit"
                  className={currentStep === 1 ? "w-full" : "ml-auto"}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating store...
                    </>
                  ) : currentStep === 4 ? (
                    "Create Store Account"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have a store account?{" "}
                <Link
                  to="/store-portal/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Just want to shop?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Create customer account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MultiStepStoreSignup;
