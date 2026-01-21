import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

export function PromoBanner({
  title,
  subtitle,
  ctaText,
  ctaLink = "/products",
  variant = "primary",
  className,
}: PromoBannerProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-gradient-to-r from-yellow-400 to-orange-400 text-foreground",
  };

  return (
    <div
      className={cn(
        "relative w-full py-6 px-8 rounded-xl overflow-hidden",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
          {subtitle && (
            <span className="hidden md:inline text-sm opacity-90">
              {subtitle}
            </span>
          )}
        </div>
        {ctaText && (
          <Link
            to={ctaLink}
            className="flex items-center gap-1 text-sm font-semibold hover:underline group"
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
