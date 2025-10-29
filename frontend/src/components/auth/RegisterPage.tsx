import React from "react";
import { AuthProvider } from "@/lib/auth";
import { RegisterView } from "@/components/auth/RegisterView";

export const RegisterPage: React.FC = () => {
  return (
    <AuthProvider>
      <RegisterView />
    </AuthProvider>
  );
};
