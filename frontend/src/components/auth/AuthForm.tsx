import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/apiClient";
import type { AuthTokenResponseDto, LoginUserDto } from "@/types";

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
      const endpoint = `/api/v1/auth/${mode === "login" ? "login" : "register"}`;

      if (mode === "login") {
        return await apiRequest<AuthTokenResponseDto>(endpoint, {
          method: "POST",
          body: payload,
        });
      } else {
        // For registration, we make the request but don't return the response body
        await apiRequest(endpoint, {
          method: "POST",
          body: payload,
        });
        return undefined;
      }

      return undefined;
    },
    [mode]
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
          data-testid="auth-email-input"
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
          data-testid="auth-password-input"
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
          data-testid="auth-error"
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {generalError}
        </div>
      ) : null}

      <Button className="w-full" type="submit" disabled={isSubmitting} data-testid="auth-submit-button">
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
