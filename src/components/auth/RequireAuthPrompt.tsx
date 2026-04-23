import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import { useNavigate } from "react-router-dom";
import { getRequiredUserMode } from "@/lib/deepLinkHandler";

export function RequireAuthPrompt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userMode, switchUserMode, canAccessSellerPortal } =
    useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const promptShownRef = useRef(false);
  const requiredMode = getRequiredUserMode(location.pathname);
  const isModeMismatch =
    isAuthenticated && requiredMode === "buyer" && userMode === "seller";

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
    // if (isModeMismatch) {
    //   return (
    //     <div className="container mx-auto px-4 py-10">
    //       <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    //         <h2 className="text-xl font-semibold text-gray-900">
    //           Switch to Buyer Mode
    //         </h2>
    //         <p className="mt-2 text-sm text-gray-600">
    //           You are currently browsing in seller mode. This section belongs to
    //           your buyer portal.
    //         </p>
    //         <div className="mt-5 flex flex-wrap gap-3">
    //           <Button
    //             onClick={() => {
    //               switchUserMode("buyer");
    //               navigate(
    //                 location.pathname + location.search + location.hash,
    //                 {
    //                   replace: true,
    //                 },
    //               );
    //             }}
    //           >
    //             Switch to Buyer
    //           </Button>
    //           {canAccessSellerPortal() && (
    //             <Button
    //               variant="outline"
    //               onClick={() => navigate("/seller/dashboard")}
    //             >
    //               Stay in Seller Portal
    //             </Button>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   );
    // }

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
