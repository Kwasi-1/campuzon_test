import { Fragment, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  placement?: "center" | "right" | "fullscreen";
  showCloseButton?: boolean;
  outsideClick?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  '2xl': "max-w-2xl",
  full: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "lg",
  placement = "center",
  showCloseButton = true,
  outsideClick = true,
  footer,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className={cn(
              "fixed inset-0 z-50 flex",
              placement === "center" && "items-center justify-center p-4",
              placement === "right" && "items-stretch justify-end p-0",
              placement === "fullscreen" && "items-stretch justify-stretch p-0",
            )}
            onClick={outsideClick ? onClose : undefined}
          >
            <motion.div
              initial={
                placement === "right"
                  ? { opacity: 1, x: 420 }
                  : placement === "fullscreen"
                    ? { opacity: 1, y: 20 }
                    : { opacity: 0, scale: 0.95, y: 20 }
              }
              animate={
                placement === "right"
                  ? { opacity: 1, x: 0 }
                  : placement === "fullscreen"
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                placement === "right"
                  ? { opacity: 1, x: 420 }
                  : placement === "fullscreen"
                    ? { opacity: 1, y: 20 }
                    : { opacity: 0, scale: 0.95, y: 20 }
              }
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "relative bg-background shadow-2xl overflow-hidden flex flex-col",
                placement === "center" && "w-full max-h-[90vh] rounded-md md:rounded-lg",
                placement === "center" && sizeClasses[size],
                placement === "right" &&
                  "h-screen w-full rounded-none border-l border-border",
                placement === "right" && sizeClasses[size],
                placement === "fullscreen" &&
                  "h-screen w-screen max-w-none rounded-none",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between p-6 border-b border-border">
                  <div>
                    {title && (
                      <h2 className="text-xl font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="shrink-0 ml-4"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
