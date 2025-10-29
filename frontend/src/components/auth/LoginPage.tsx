import React from "react";
import { AuthProvider } from "@/lib/auth";
import { LoginView } from "@/components/auth/LoginView";

export const LoginPage: React.FC = () => {
  return (
    <AuthProvider>
      <LoginView />
    </AuthProvider>
  );
};
