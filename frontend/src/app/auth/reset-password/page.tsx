"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPasswordAction } from "@/features/auth/actions";
import { Input, Button, Text, toast, PasswordStrengthBar } from "@/shared/ui";
import { Network, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required.";
      } else if (value.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
      } else {
        delete newErrors.password;
      }
    } else if (name === "password_confirm") {
      if (value !== password) {
        newErrors.password_confirm = "Passwords do not match.";
      } else {
        delete newErrors.password_confirm;
      }
    }
    setErrors(newErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    if (!token) {
      setError("Reset token is missing or invalid. Please request a new password reset link.");
      setIsPending(false);
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (passwordConfirm !== password) {
      newErrors.password_confirm = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsPending(false);
      return;
    }

    try {
      const res = await resetPasswordAction(token, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        toast.success("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {!success ? (
        <>
          <div className="space-y-2 text-center">
            <h1 className="text-text type-h2">Reset your password</h1>
            <p className="text-sm text-muted">
              Please enter and confirm your new password below.
            </p>
          </div>

          {error && (
            <div className="text-error p-4 text-sm bg-error-bg rounded-xl border-error/20 border flex items-center gap-2">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="New password"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) validateField("password", e.target.value);
                }}
                onBlur={handleBlur}
                icon="lock"
                showVisibilityToggle={true}
                required
                disabled={isPending}
                error={errors.password}
              />

              <PasswordStrengthBar password={password} />
            </div>

            <Input
              label="Confirm new password"
              id="password_confirm"
              name="password_confirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                if (errors.password_confirm) validateField("password_confirm", e.target.value);
              }}
              onBlur={handleBlur}
              icon="lock"
              showVisibilityToggle={true}
              required
              disabled={isPending}
              error={errors.password_confirm}
            />

            <Button
              variant="primary"
              type="submit"
              isLoading={isPending}
              className="w-full"
            >
              Reset password
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
            <CheckCircle size={28} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="text-text type-h2">Password updated</h1>
            <p className="text-sm text-muted">
              Your password has been successfully reset. Redirecting you to the sign-in page...
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-semibold"
            >
              Go to sign in immediately
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="justify-center items-center bg-bg p-6 transition-colors flex min-h-screen flex-col">
      <div className="w-full space-y-8 border-border rounded-2xl shadow-xl max-w-md p-8 bg-surface border">
        {/* Branding */}
        <div className="text-center">
          <Link href="/" className="text-primary group type-h3 inline-flex items-center gap-2 mb-4">
            <Network className="transition-transform group-hover:rotate-12 text-primary" size={30} aria-hidden="true" />
            <span>JobLyne</span>
          </Link>
        </div>

        <Suspense fallback={<div className="text-center text-muted">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="pt-2 text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
