import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/Modal";
import { useAuthPromptStore } from "@/stores/authPromptStore";
import {
  buildLoginRedirectPath,
  parseRedirectTarget,
} from "@/lib/deepLinkHandler";

export function AuthRequiredModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, targetPath, message, closeAuthPrompt } = useAuthPromptStore();

  const handleSignIn = () => {
    const fallbackPath = `${location.pathname}${location.search}${location.hash}`;
    const redirectPath = parseRedirectTarget(targetPath, fallbackPath || "/");
    closeAuthPrompt();
    navigate(buildLoginRedirectPath(redirectPath));
  };

  return (
    <Modal isOpen={isOpen} onClose={closeAuthPrompt} title="Sign In Required">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={closeAuthPrompt}>
            Continue as Guest
          </Button>
          <Button onClick={handleSignIn}>Sign In</Button>
        </div>
      </div>
    </Modal>
  );
}
