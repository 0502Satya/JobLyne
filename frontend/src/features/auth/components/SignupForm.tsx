"use client";

import React, { useActionState, useState } from "react";
import { signupAction } from "@/features/auth/actions";
import { Input, Button } from "@/shared/ui";
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

  // Password strength calculation helper
  const getPasswordStrength = (val: string) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Empty", "Very Weak", "Weak", "Medium", "Strong"];
  const strengthColors = [
    "bg-border/20",
    "bg-error",
    "bg-orange-500",
    "bg-warning",
    "bg-success"
  ];

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
        label="First Name"
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
        label="Last Name"
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
        
        {password && (
          <div className="space-y-1.5 mt-2 px-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Password Strength:</span>
              <span className={`font-semibold ${
                strength === 1 ? "text-error" :
                strength === 2 ? "text-orange-500" :
                strength === 3 ? "text-warning" :
                strength === 4 ? "text-success" : "text-muted"
              }`}>
                {strengthLabels[strength]}
              </span>
            </div>
            <div className="flex gap-1 h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
              {[1, 2, 3, 4].map((bar) => (
                <div 
                  key={bar} 
                  className={`flex-1 h-full transition-all duration-300 ${
                    strength >= bar ? strengthColors[strength] : "bg-bg dark:bg-card"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted leading-tight">
              Must be at least 8 characters. Mix letters, numbers, and symbols.
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <Input
        label="Confirm Password"
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
        Create {role} Account
      </Button>
    </form>
  );
}
