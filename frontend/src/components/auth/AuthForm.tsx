import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthTokenResponseDto, LoginUserDto, RegisterUserDto } from "@/types";

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:3000");

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess?: (token?: AuthTokenResponseDto) => void;
}

type FieldErrors = Partial<Record<keyof LoginUserDto, string>>;

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const [values, setValues] = useState<LoginUserDto>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endpoint = useMemo(() => `${API_BASE_URL}/api/v1/auth/${mode === "login" ? "login" : "register"}`, [mode]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError(null);
  }, []);

  const runValidation = useCallback(
    (payload: LoginUserDto): FieldErrors => {
      const validationErrors: FieldErrors = {};

      if (!payload.email?.trim()) {
        validationErrors.email = "Email is required.";
      } else if (!/^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/.test(payload.email)) {
        validationErrors.email = "Enter a valid email address.";
      }

      if (!payload.password?.trim()) {
        validationErrors.password = "Password is required.";
      } else if (mode === "register" && payload.password.trim().length < 8) {
        validationErrors.password = "Password must be at least 8 characters.";
      }

      return validationErrors;
    },
    [mode]
  );

  const submitToApi = useCallback(
    async (payload: LoginUserDto): Promise<AuthTokenResponseDto | undefined> => {
      const requestBody: RegisterUserDto = payload;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
        const errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          (mode === "login" ? "Unable to sign in with those credentials." : "Unable to complete registration.");
        throw new Error(errorMessage);
      }

      if (mode === "login") {
        const tokenResponse = (await response.json()) as AuthTokenResponseDto;
        return tokenResponse;
      }

      return undefined;
    },
    [endpoint, mode]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedPayload: LoginUserDto = {
        email: values.email.trim(),
        password: values.password,
      };

      const validationErrors = runValidation(trimmedPayload);

      if (validationErrors.email || validationErrors.password) {
        setErrors(validationErrors);
        setGeneralError(null);
        return;
      }

      setIsSubmitting(true);
      setGeneralError(null);

      try {
        const token = await submitToApi(trimmedPayload);
        onSuccess?.(token);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error occurred.";
        setGeneralError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSuccess, runValidation, submitToApi, values.email, values.password]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          required
        />
        {errors.email ? (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={values.password}
          onChange={handleChange}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          required
        />
        {errors.password ? (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password}
          </p>
        ) : null}
        {mode === "register" ? (
          <p className="text-xs text-muted-foreground">Must contain at least 8 characters.</p>
        ) : null}
      </div>

      {generalError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {generalError}
        </div>
      ) : null}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === "login"
            ? "Signing in..."
            : "Creating account..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
};
