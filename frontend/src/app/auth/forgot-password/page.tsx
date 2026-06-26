"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/features/auth/actions";
import { Input, Button, Text } from "@/shared/ui";
import { Network, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    if (!email.trim()) {
      setError("Email address is required.");
      setIsPending(false);
      return;
    }

    try {
      const res = await forgotPasswordAction(email);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

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

        {!success ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-text type-h2">Reset password</h1>
              <p className="text-sm text-muted">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="text-error p-4 text-sm bg-error-bg rounded-xl border-error/20 border flex items-center gap-2">
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="mail"
                required
                disabled={isPending}
              />

              <Button
                variant="primary"
                type="submit"
                isLoading={isPending}
                className="w-full"
              >
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle size={28} aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="text-text type-h2">Check your email</h1>
              <p className="text-sm text-muted">
                We have sent a password reset link to <strong className="text-text">{email}</strong>.
              </p>
            </div>
            <div className="rounded-lg bg-surface-2 p-4 text-xs text-muted text-left border border-border">
              <p className="font-semibold text-text mb-1">Didn&apos;t receive the email?</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Check your spam or junk folder.</li>
                <li>Verify that you entered the correct email address.</li>
                <li>Wait a few minutes before requesting another link.</li>
              </ul>
            </div>
          </div>
        )}

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
