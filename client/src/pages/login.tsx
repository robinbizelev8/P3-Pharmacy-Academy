import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/generated_images/P3_Pharmacy_Academy_Logo_e0d57123.png";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  if (user) {
    const redirectUrl = getRoleBasedRedirect(user.role);
    window.location.href = redirectUrl;
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link href="/">
          <a className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </a>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <img 
              src={logoImage} 
              alt="P³ Pharmacy Academy" 
              className="mx-auto h-16 w-auto"
            />
            <div className="mt-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Singapore Pre-registration Training Program
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              {mode === 'login' ? (
                <LoginForm
                  onSuccess={() => {
                    // Handled by the form itself
                  }}
                  onSwitchToSignup={() => setMode('signup')}
                />
              ) : (
                <SignupForm
                  onSuccess={() => {
                    // Show success message or switch to login
                    setTimeout(() => setMode('login'), 2000);
                  }}
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms">
                <a className="text-blue-600 hover:text-blue-500">Terms of Service</a>
              </Link>{" "}
              and{" "}
              <Link href="/privacy">
                <a className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
        </svg>
      </div>
    </div>
  );
}

// Helper function to determine redirect URL based on user role
function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'supervisor':
      return '/supervisor/dashboard';
    case 'student':
    default:
      return '/dashboard';
  }
}