import type React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AuthDivider } from "@/components/ui/auth-divider";
import { FloatingPaths } from "@/components/floating-paths";
import campuzonLogo from "@/assets/campuzon_logo_small.png";
import campuzonLogoWhite from "@/assets/campuzon_logo.png";

interface AuthPageProps {
  /** Override the default email-continue form with a custom form (e.g. email + password). */
  children?: React.ReactNode;
  /** Heading text. Defaults to "Sign In or Join Now!" */
  heading?: string;
  /** Sub-heading text. */
  subheading?: string;
  /** Whether to show the "Continue with Google" button. Defaults to true. */
  showGoogleButton?: boolean;
  /** Called when the user submits the email-continue form. */
  onEmailContinue?: (email: string) => void;
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);

export function AuthPage({
  children,
  heading = "Sign In or Join Now!",
  subheading = "Login or create your Campuzon account.",
  showGoogleButton = false,
  onEmailContinue,
}: AuthPageProps) {
  const handleEmailFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onEmailContinue) return;
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    onEmailContinue(email);
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left sidebar — visible only on large screens */}
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <img
          src={campuzonLogoWhite}
          alt="Campuzon"
          className="relative z-10 mr-auto h-9 object-contain"
        />

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Campuzon has made it incredibly easy to find what I need
              and get it delivered right on campus.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">
              ~ A Happy Student
            </footer>
          </blockquote>
        </div>

        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="relative flex min-h-screen flex-col justify-center px-8">
        {/* Top Shades */}
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,color-mix(in_srgb,var(--foreground)_6%,transparent)_0,color-mix(in_srgb,#8c8c8c_2%,transparent)_50%,color-mix(in_srgb,var(--foreground)_1%,transparent)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_srgb,var(--foreground)_4%,transparent)_0,color-mix(in_srgb,var(--foreground)_1%,transparent)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,color-mix(in_srgb,var(--foreground)_4%,transparent)_0,color-mix(in_srgb,var(--foreground)_1%,transparent)_80%,transparent_100%)]" />
        </div>

        <Button asChild className="absolute top-7 left-5" variant="ghost">
          <Link to="/">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Home
          </Link>
        </Button>

        <div className="mx-auto space-y-4 sm:w-sm overflow-y-auto scrollbar-hide py-20 md:px-2">
          {/* Logo visible on mobile (hidden on lg where sidebar shows) */}
          <img
            src={campuzonLogo}
            alt="Campuzon"
            className="h-9 object-contain lg:hidden"
          />

          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">{heading}</h1>
            <p className="text-base text-muted-foreground">{subheading}</p>
          </div>

          {showGoogleButton && (
            <div className="space-y-4">
              {/* Social Auth Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  type="button"
                  onClick={() => {
                    window.location.href = "/api/v1/auth/google";
                  }}
                >
                  <GoogleIcon
                    className="mr-2 h-4 w-4"
                    data-icon="inline-start"
                  />
                  Continue with Google
                </Button>
              </div>

              <AuthDivider>OR</AuthDivider>
            </div>
          )}

          {/* Custom children (e.g. email+password form) or default email-only form */}
          {children ?? (
            <form className="space-y-2" onSubmit={handleEmailFormSubmit}>
              <p className="text-start text-muted-foreground text-xs">
                Enter your email address to sign in or create an account
              </p>
              <InputGroup>
                <InputGroupInput
                  name="email"
                  placeholder="your.email@example.com"
                  type="email"
                  required
                />
                <InputGroupAddon align="inline-start">
                  <AtSign />
                </InputGroupAddon>
              </InputGroup>

              <Button className="w-full" type="submit">
                Continue With Email
              </Button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
