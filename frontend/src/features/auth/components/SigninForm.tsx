"use client";

import React, { useState } from "react";
import { loginAction } from "@/features/auth/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input, Button, Checkbox, toast } from "@/shared/ui";
import { AlertCircle } from "lucide-react";

export default function SigninForm({ role = "Candidate" }: { role?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Please enter a valid email address.";
      } else {
        delete newErrors.email;
      }
    } else if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required.";
      } else {
        delete newErrors.password;
      }
    }
    setErrors(newErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";

    // Local check before submission
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsPending(false);
      return;
    }

    try {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        const role = res.role;
        if (role === 'COMPANY') router.push('/company');
        else if (role === 'RECRUITER') router.push('/recruiter/dashboard');
        else router.push('/dashboard');
        return;
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Render Server Errors */}
      {error && (
        <div className="text-error p-4 text-sm bg-error-bg mb-4 rounded-xl border-error/20 border flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      
      {/* Input for Email Address */}
      <Input
        label="Email Address"
        id="email"
        name="email"
        placeholder="name@example.com"
        type="email"
        icon="mail"
        required
        disabled={isPending}
        error={errors.email}
        onBlur={handleBlur}
      />

      {/* Input for Password with Show/Hide visibility */}
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label className="text-text type-ui block font-medium" htmlFor="password">
            Password
          </label>
          <button 
            type="button"
            onClick={() => toast.info("Password recovery is coming soon. Please contact system support.")}
            className="type-ui text-primary transition-colors hover:text-primary/80 font-medium cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        <Input
          id="password"
          name="password"
          placeholder="••••••••"
          type="password"
          icon="lock"
          showVisibilityToggle={true}
          required
          disabled={isPending}
          error={errors.password}
          onBlur={handleBlur}
        />
      </div>

      {/* Checkbox to stay logged in */}
      <Checkbox 
        id="remember" 
        name="remember"
        disabled={isPending}
        label="Remember me for 30 days"
      />

      {/* Sign In Button */}
      <Button 
        variant="primary"
        type="submit"
        isLoading={isPending}
        className="w-full mt-4"
      >
        Sign In as {role}
      </Button>
    </form>
  );
}
