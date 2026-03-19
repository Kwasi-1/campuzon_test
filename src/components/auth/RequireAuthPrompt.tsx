import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";

export function RequireAuthPrompt() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const promptShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !promptShownRef.current) {
      promptShownRef.current = true;
      openAuthPrompt(
        `${location.pathname}${location.search}${location.hash}`,
        "Sign in to access this feature.",
      );
    }

    if (isAuthenticated) {
      promptShownRef.current = false;
    }
  }, [
    isAuthenticated,
    location.pathname,
    location.search,
    location.hash,
    openAuthPrompt,
  ]);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Sign In Required
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          This page is available after you sign in. You can keep browsing public
          pages as a guest.
        </p>
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() =>
              openAuthPrompt(
                `${location.pathname}${location.search}${location.hash}`,
                "Sign in to access this feature.",
              )
            }
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
