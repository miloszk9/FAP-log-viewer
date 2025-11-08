import React, { useCallback, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const educationalPoints = [
  {
    title: "Email-based access",
    description: "Send CSV log files from your FAP mobile app via.",
  },
  {
    title: "All-in-one dashboard",
    description: "Monitor regeneration cycles, engine stats, and FAP pressure thresholds in one place.",
  },
  {
    title: "Get analysis summary.",
    description: "Get a summary of your engine and FAP filter health across your log history.",
  },
];

export const RegisterView: React.FC = () => {
  const { isAuthenticated, isHydrating, clearSession } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (isAuthenticated && typeof window !== "undefined") {
      window.location.replace("/history");
      return;
    }

    clearSession();
  }, [clearSession, isAuthenticated, isHydrating]);

  const handleSuccess = useCallback(() => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = "/?registered=1";
    }, 1200);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.18),_transparent_55%)]" />
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <main className="flex flex-1 items-center justify-center bg-background px-6 py-16 sm:px-12">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-3">
              <CardTitle>Create your account</CardTitle>
              <CardDescription>Register to start uploading logs and receive detailed FAP analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AuthForm mode="register" onSuccess={handleSuccess} />
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a className="font-semibold text-primary hover:underline" href="/" data-testid="sign-in-link">
                  Sign in
                </a>
              </p>
              {isRedirecting ? (
                <p className="text-center text-sm text-emerald-600" role="status">
                  Account created. Redirecting to sign in…
                </p>
              ) : null}
              {!isRedirecting && isHydrating ? (
                <p className="text-center text-sm text-muted-foreground" role="status">
                  Preparing registration…
                </p>
              ) : null}
            </CardContent>
          </Card>
        </main>

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
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Create your account</h2>
            </header>

            <div className="space-y-5">
              {educationalPoints.map((point) => (
                <article key={point.title} className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground/80">
            <p>© {new Date().getFullYear()} FAP Log Viewer. All rights reserved.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
