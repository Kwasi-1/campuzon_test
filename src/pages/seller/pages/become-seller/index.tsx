import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  ArrowRight,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  Shield,
  TrendingUp,
  Users,
  Package,
  MessageCircle,
  Zap,
  Star,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CustomInputTextField,
  CustomTextareaField,
} from "@/components/shared/text-field";
import { useAuthStore } from "@/stores";
import { sellerOnboardingService } from "@/services";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Reach More Customers",
    description: "Access thousands of students and staff at your campus",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Our escrow system protects both buyers and sellers",
  },
  {
    icon: MessageCircle,
    title: "Built-in Chat",
    description: "Communicate with customers directly through the app",
  },
  {
    icon: Package,
    title: "Easy Order Management",
    description: "Track orders, manage inventory, and handle deliveries",
  },
  {
    icon: Zap,
    title: "Quick Setup",
    description: "Start selling in minutes with our simple onboarding",
  },
  {
    icon: Users,
    title: "Campus Community",
    description: "Be part of a trusted network of campus sellers",
  },
];

export function BecomeSellerPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchProfile } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phoneNumber: user?.phoneNumber || "",
    additionalNumber: "",
    email: user?.email || "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    } else if (formData.storeName.length < 3) {
      newErrors.storeName = "Store name must be at least 3 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (
      formData.description.trim() &&
      formData.description.trim().length < 20
    ) {
      newErrors.description =
        "Description must be at least 20 characters when provided";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setSubmitError("");
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await sellerOnboardingService.createStore({
        storeName: formData.storeName.trim(),
        description: formData.description.trim() || undefined,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        additionalNumber: formData.additionalNumber.trim() || undefined,
      });

      await fetchProfile();
      toast.success(
        "Store created successfully. It will be reviewed by the team.",
      );
      navigate("/seller/dashboard");
    } catch (error) {
      const message = extractError(error);

      if (message === "You already have a store") {
        await fetchProfile();
        toast.success(
          "Your store already exists. Redirecting to your dashboard.",
        );
        navigate("/seller/dashboard");
        return;
      }

      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, show benefits and prompt to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#ffffff_45%,#f8fafc_100%)]">
        <div className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-[28px] border border-emerald-100/70 bg-white/90 p-7 md:p-10 shadow-[0_16px_50px_rgba(16,185,129,0.08)]"
          >
            <Badge className="mb-4 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">
              Seller Onboarding
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Start Selling on Campuzon
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mb-7">
              Create your seller account in two quick steps and start reaching
              verified campus buyers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login?redirect=/become-seller">
                <Button
                  size="lg"
                  className="rounded-full px-7 bg-[#1C1C1E] hover:bg-black text-white gap-2"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/stores">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7"
                >
                  Browse Stores
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="h-full rounded-3xl border-slate-200/80 shadow-sm">
                  <CardContent className="p-5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                      <benefit.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If already a seller, redirect
  if (user?.isOwner) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#ffffff_48%,#f8fafc_100%)] py-8 md:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <Badge className="mb-3 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            Seller Setup
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
            Become a Seller
          </h1>
          <p className="mt-1 text-sm md:text-base text-slate-600">
            Clean, quick onboarding. Fill the form and we will review your
            store.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
          <aside className="xl:w-80 shrink-0 xl:sticky xl:top-24 h-fit space-y-4">
            <Card className="rounded-3xl border-slate-200/80 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-slate-900 mb-4">
                  Setup Progress
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step >= 1
                          ? "bg-[#1C1C1E] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {step > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Store Basics
                      </p>
                      <p className="text-xs text-slate-500">
                        Name and campus context
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 h-5 w-px bg-slate-200" />
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step >= 2
                          ? "bg-[#1C1C1E] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Contact Details
                      </p>
                      <p className="text-xs text-slate-500">
                        Phone, email and terms
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 shadow-sm">
              <CardContent className="p-5 text-sm">
                <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Campus Details
                </div>
                <p className="text-slate-600">
                  Institution:{" "}
                  {user?.institutionName ||
                    user?.institution?.name ||
                    "Saved on your account"}
                </p>
                <p className="text-slate-600 mt-1">
                  Hall: {user?.hall?.name || user?.hallID || "Not specified"}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Store creation currently uses your profile campus details
                  automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  Why Sellers Choose Campuzon
                </p>
                <div className="space-y-2.5">
                  {BENEFITS.slice(0, 3).map((benefit) => (
                    <div
                      key={benefit.title}
                      className="flex items-start gap-2.5"
                    >
                      <benefit.icon className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 min-w-0">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <Card className="rounded-[28px] border-slate-200/80 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <CardContent className="p-5 md:p-8">
                  {step === 1 ? (
                    <>
                      <div className="mb-7">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-50 mb-3">
                          <Store className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                          Create Your Store
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 mt-1">
                          Start with your store name and continue to contact
                          details.
                        </p>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-800 mb-1.5">
                            Store Name <span className="text-red-500">*</span>
                          </label>
                          <CustomInputTextField
                            value={formData.storeName}
                            // label="Store Namer"
                            onChange={(e) =>
                              handleChange("storeName", e.target.value)
                            }
                            placeholder="e.g., TechHub GH"
                            className={errors.storeName ? "border-red-500" : ""}
                          />
                          {errors.storeName && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.storeName}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleNext}
                          className="w-full sm:w-auto rounded-full px-6 bg-[#1C1C1E] hover:bg-black text-white gap-2"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-7">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-50 mb-3">
                          <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                          Almost Done
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 mt-1">
                          Add contact details so buyers can reach you quickly.
                        </p>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-800 mb-1.5">
                            Store Description
                          </label>
                          <CustomTextareaField
                            value={formData.description}
                            onChange={(e) =>
                              handleChange("description", e.target.value)
                            }
                            placeholder="Tell customers what you offer..."
                            rows={4}
                            error={errors.description}
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Optional. If you add one, use at least 20
                            characters.
                          </p>
                          {errors.description && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.description}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-800 mb-1.5">
                            <Phone className="h-4 w-4 inline mr-1" />
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <CustomInputTextField
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              handleChange("phoneNumber", e.target.value)
                            }
                            placeholder="+233 XX XXX XXXX"
                            className={
                              errors.phoneNumber ? "border-red-500" : ""
                            }
                          />
                          {errors.phoneNumber && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.phoneNumber}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-800 mb-1.5">
                            Additional Phone Number
                          </label>
                          <CustomInputTextField
                            type="tel"
                            value={formData.additionalNumber}
                            onChange={(e) =>
                              handleChange("additionalNumber", e.target.value)
                            }
                            placeholder="Optional backup contact"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-800 mb-1.5">
                            <Mail className="h-4 w-4 inline mr-1" />
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <CustomInputTextField
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleChange("email", e.target.value)
                            }
                            placeholder="your@email.com"
                            className={errors.email ? "border-red-500" : ""}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {submitError && (
                          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {submitError}
                          </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id="terms"
                              checked={formData.agreeToTerms}
                              onChange={(e) =>
                                handleChange("agreeToTerms", e.target.checked)
                              }
                              className="mt-1"
                            />
                            <label htmlFor="terms" className="text-sm">
                              I agree to the{" "}
                              <Link
                                to="/terms"
                                className="text-primary hover:underline"
                              >
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link
                                to="/seller-agreement"
                                className="text-primary hover:underline"
                              >
                                Seller Agreement
                              </Link>
                            </label>
                          </div>
                        </div>
                        {errors.agreeToTerms && (
                          <p className="text-sm text-red-500">
                            {errors.agreeToTerms}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                          <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="sm:flex-1 rounded-full"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="sm:flex-1 rounded-full bg-[#1C1C1E] hover:bg-black text-white gap-2"
                          >
                            {isSubmitting ? (
                              "Creating Store..."
                            ) : (
                              <>
                                Create Store
                                <Store className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Need help? Contact{" "}
          <a
            href="mailto:support@campuzon.com"
            className="text-primary hover:underline"
          >
            support@campuzon.com
          </a>
        </p>
      </div>
    </div>
  );
}
