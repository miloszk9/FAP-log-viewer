import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthTokenResponseDto } from "@/types";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const marketingPoints = [
  "Upload CSV log files from your FAP mobile app.",
  "Get detailed metrics and analysis of your engine and FAP filter health.",
  "Compare regeneration cycles and engine health trends across your vehicle history.",
];

const getRedirectTarget = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("redirect");
};

export const LoginView: React.FC = () => {
  const { completeLogin, isAuthenticated, isHydrating } = useAuth();
  const [showRegistrationToast, setShowRegistrationToast] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
      setShowRegistrationToast(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrating || !isAuthenticated) {
      return;
    }

    const redirectTarget = getRedirectTarget();
    const destination = redirectTarget && redirectTarget !== "/login" ? redirectTarget : "/history";

    window.location.replace(destination);
  }, [isAuthenticated, isHydrating]);

  const handleSuccess = useCallback(
    (token?: AuthTokenResponseDto) => {
      if (token) {
        completeLogin(token);
      }

      const redirectTarget = getRedirectTarget();
      const destination = redirectTarget && redirectTarget !== "/login" ? redirectTarget : "/history";

      window.location.replace(destination);
    },
    [completeLogin]
  );

  const registrationToast = useMemo(() => {
    if (!showRegistrationToast) {
      return null;
    }

    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600"
      >
        Account created successfully. Sign in with your new credentials.
      </div>
    );
  }, [showRegistrationToast]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="flex flex-1 flex-col justify-between bg-sidebar px-8 py-10 text-sidebar-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
              <span className="text-2xl font-bold">F</span>
            </div>
            <div>
              <p className="text-lg font-semibold">FAP Log Viewer</p>
            </div>
          </div>

          <div className="space-y-8">
            <header className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h1>
              <p className="max-w-sm text-base text-muted-foreground">
                Sign in to continue analysing your engine and FAP filter health.
              </p>
            </header>

            <ul className="space-y-4 text-muted-foreground">
              {marketingPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <footer className="text-sm text-muted-foreground/80">
            © {new Date().getFullYear()} FAP Log Viewer. All rights reserved.
          </footer>
        </aside>

        <main className="flex flex-1 items-center justify-center bg-background px-6 py-16 sm:px-12">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Enter your email and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {registrationToast}

              <AuthForm mode="login" onSuccess={handleSuccess} />

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a className="font-semibold text-primary hover:underline" href="/register">
                  Create one now
                </a>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
