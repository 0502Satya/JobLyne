"use client";

import React, { useActionState, useState } from "react";
import { signupAction } from "@/features/auth/actions";
import { Input, Button, PasswordStrengthBar } from "@/shared/ui";
import OTPVerification from "./OTPVerification";
import { AlertCircle } from "lucide-react";

export default function SignupForm({ role = "Candidate" }: { role?: string }) {
  // React 19 hook for Server Actions
  const [state, formAction, isPending] = useActionState(signupAction, null);
  
  // Local validation and UX states
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === "first_name") {
      if (!value.trim()) newErrors.first_name = "First name is required.";
      else delete newErrors.first_name;
    } else if (name === "last_name") {
      if (!value.trim()) newErrors.last_name = "Last name is required.";
      else delete newErrors.last_name;
    } else if (name === "email") {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newErrors: Record<string, string> = {};

    const firstName = (formData.get("first_name") as string) || "";
    const lastName = (formData.get("last_name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const pass = (formData.get("password") as string) || "";
    const passConfirm = (formData.get("password_confirm") as string) || "";

    if (!firstName.trim()) newErrors.first_name = "First name is required.";
    if (!lastName.trim()) newErrors.last_name = "Last name is required.";
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!pass) {
      newErrors.password = "Password is required.";
    } else if (pass.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (passConfirm !== pass) {
      newErrors.password_confirm = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) element.focus();
    }
  };



  if (state?.requiresVerification) {
    return <OTPVerification email={state.email} />;
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
      {/* Hidden input to pass the role to the backend */}
      <input type="hidden" name="role" value={role} />

      {/* Render Server Errors */}
      {state?.error && (
        <div className="text-error p-4 text-sm bg-error-bg mb-4 rounded-xl border-error/20 border flex items-center gap-2">
          <AlertCircle size={18} aria-hidden="true" className="shrink-0" />
          {state.error}
        </div>
      )}

      {/* Single-column inputs: First Name */}
      <Input
        label="First name"
        id="first_name"
        name="first_name"
        placeholder="John"
        type="text"
        required
        disabled={isPending}
        error={errors.first_name}
        onBlur={handleBlur}
      />

      {/* Last Name */}
      <Input
        label="Last name"
        id="last_name"
        name="last_name"
        placeholder="Doe"
        type="text"
        required
        disabled={isPending}
        error={errors.last_name}
        onBlur={handleBlur}
      />

      {/* Email Address */}
      <Input
        label="Email address"
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

      {/* Password with Strength Indicator */}
      <div>
        <Input
          label="Password"
          id="password"
          name="password"
          placeholder="••••••••"
          type="password"
          icon="lock"
          showVisibilityToggle={true}
          required
          disabled={isPending}
          error={errors.password}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) validateField("password", e.target.value);
          }}
          onBlur={handleBlur}
        />
        
        <PasswordStrengthBar password={password} />
      </div>

      {/* Confirm Password */}
      <Input
        label="Confirm password"
        id="password_confirm"
        name="password_confirm"
        placeholder="••••••••"
        type="password"
        icon="lock_reset"
        showVisibilityToggle={true}
        required
        disabled={isPending}
        error={errors.password_confirm}
        onBlur={handleBlur}
      />

      {/* Continue Button */}
      <Button 
        variant="primary"
        type="submit"
        isLoading={isPending}
        className="w-full mt-6"
      >
        Create {role} account
      </Button>
    </form>
  );
}
