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
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Store className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Start Selling on Campuzon
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students and businesses selling to the campus
              community. Set up your store in minutes and start earning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login?redirect=/become-seller">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/stores">
                <Button size="lg" variant="outline">
                  Browse Stores
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Trusted by Campus Sellers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Kwame A.",
                  store: "TechHub GH",
                  quote:
                    "I've sold over 200 products through Campuzon. The escrow system gives my customers confidence.",
                  rating: 5,
                },
                {
                  name: "Ama D.",
                  store: "Beauty Corner",
                  quote:
                    "Started as a side hustle, now it's my main income. The platform is so easy to use!",
                  rating: 5,
                },
              ].map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {testimonial.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.store}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
            </div>
            <div
              className={`w-20 h-1 mx-2 ${step >= 2 ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardContent className="p-6">
              {step === 1 ? (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Create Your Store</h1>
                    <p className="text-muted-foreground">
                      Tell us about your business
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
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

                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                      <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                        <MapPin className="h-4 w-4" />
                        Campus details from your profile
                      </div>
                      <p>
                        Institution:{" "}
                        {user?.institutionName ||
                          user?.institution?.name ||
                          "Saved on your account"}
                      </p>
                      <p>
                        Hall:{" "}
                        {user?.hall?.name || user?.hallID || "Not specified"}
                      </p>
                      <p className="mt-2 text-xs">
                        The current backend store-creation route uses your
                        existing profile campus details automatically and does
                        not accept institution or category fields here.
                      </p>
                    </div>

                    <Button onClick={handleNext} className="w-full gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Almost Done!</h1>
                    <p className="text-muted-foreground">
                      Just a few more details
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
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
                        Optional. If you add one, use at least 20 characters.
                      </p>
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
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
                        className={errors.phoneNumber ? "border-red-500" : ""}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
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
                      <label className="block text-sm font-medium mb-1">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <CustomInputTextField
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
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
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-500">
                        {errors.agreeToTerms}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 gap-2"
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

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
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
