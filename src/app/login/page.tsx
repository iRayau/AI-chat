"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Sparkles, Chrome, Loader2, Lock, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-3xl opacity-5" />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                AI Chat
              </h1>
              <p className="text-white/70 text-sm">Smart Assistant</p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-semibold text-white mb-4 leading-tight">
            Your intelligent companion
            <br />
            for every task
          </h2>

          <p className="text-white/80 text-lg mb-12 max-w-md">
            Experience the power of AI-assisted conversations with real-time web
            search capabilities.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Real-time streaming responses",
              },
              {
                icon: Globe,
                title: "Web Search",
                description: "Access current information instantly",
              },
              {
                icon: Lock,
                title: "Secure",
                description: "Your data stays private",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Chat</h1>
              <p className="text-muted-foreground text-sm">Smart Assistant</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to continue to AI Chat
            </p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            size="lg"
            className={cn(
              "w-full h-12 text-base font-medium rounded-xl transition-all duration-200",
              "bg-white text-gray-900 border border-gray-200 shadow-sm",
              "hover:bg-gray-50 hover:shadow-md hover:border-gray-300",
              "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>

          {/* Additional Info */}
          <div className="mt-12 p-4 rounded-xl bg-muted/50 border">
            <h3 className="text-sm font-medium mb-2">Why Google Sign-In?</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Secure authentication without password management</li>
              <li>• Quick and seamless sign-in experience</li>
              <li>• Your Google data is never shared with third parties</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

