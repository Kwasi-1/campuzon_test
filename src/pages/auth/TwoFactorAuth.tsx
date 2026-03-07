import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import TwoFactorVerification from "@/components/auth/TwoFactorVerification";
import { authService } from "@/services/authService";

const TwoFactorAuth = () => {
  const navigate = useNavigate();

  const handleVerificationComplete = async (code?: string) => {
    const pending = authService.getPendingAuth();
    if (!pending) {
      navigate("/login");
      return;
    }
    try {
      if (!code) return; // TwoFactorVerification will pass code through props handler
      await authService.completeTwoFactor(
        pending.username,
        pending.password,
        code
      );
      sessionStorage.removeItem("pendingAuthEmail");
      navigate("/");
    } catch {
      // Stay on page; component shows error
    }
  };

  return (
    <>
      <SEO
        title="Two-Factor Authentication - Tobra"
        description="Enter your verification code to complete the sign-in process."
        keywords="2FA, two-factor authentication, security, verification"
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

        <TwoFactorVerification
          onVerificationComplete={(code) => handleVerificationComplete(code)}
          email={sessionStorage.getItem("pendingAuthEmail") || "your email"}
          resendCooldown={60}
        />

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </>
  );
};

export default TwoFactorAuth;
