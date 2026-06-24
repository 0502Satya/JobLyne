"use client";

import React, { useState } from "react";
import { updateCandidateProfileAction } from "@/features/auth/actions";
import { Input } from "@/shared/ui";
import { CheckCircle, AlertCircle, Save, Loader2 } from "lucide-react";

interface ProfileFormProps {
  initialData: any;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === "full_name") {
      if (!value.trim()) newErrors.full_name = "Full name is required.";
      else delete newErrors.full_name;
    } else if (name === "phone") {
      if (!value.trim()) newErrors.phone = "Phone number is required.";
      else delete newErrors.phone;
    } else if (name === "location") {
      if (!value.trim()) newErrors.location = "Location is required.";
      else delete newErrors.location;
    } else if (name === "expected_salary") {
      if (value && isNaN(Number(value))) newErrors.expected_salary = "Salary must be a number.";
      else delete newErrors.expected_salary;
    }
    setErrors(newErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("full_name") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const location = (formData.get("location") as string) || "";
    const salary = formData.get("expected_salary") as string;

    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.full_name = "Full name is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (salary && isNaN(Number(salary))) newErrors.expected_salary = "Salary must be a number.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const data: any = {
      full_name: fullName,
      headline: formData.get("headline"),
      summary: formData.get("summary"),
      phone: phone,
      location: location,
      currency: formData.get("currency"),
    };

    if (salary) {
      data.expected_salary = parseFloat(salary);
    }

    const result = await updateCandidateProfileAction(data);

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile." });
    }
    setLoading(false);
  };

  return (
    <div className="fade-in space-y-8 slide-in-from-bottom-4 animate-in duration-700">
      
      {/* Status Message */}
      {message && (
        <div className={`rounded-xl transition-all type-ui p-4 border relative ${
          message.type === "success" 
            ? "border-success/20 bg-success-bg text-success" 
            : "border-error/20 bg-error-bg text-error"
        }`}>
          <div className="gap-2 flex items-center pr-8">
            {message.type === "success" ? (
              <CheckCircle size={18} className="shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle size={18} className="shrink-0" aria-hidden="true" />
            )}
            <span>{message.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setMessage(null)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer select-none h-8 w-8 flex items-center justify-center rounded-full hover:bg-bg/20"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Identity Section */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <Input 
            label="Full name"
            name="full_name"
            id="full_name"
            defaultValue={initialData?.full_name}
            placeholder="Alice Smith"
            error={errors.full_name}
            onBlur={handleBlur}
            required
            disabled={loading}
          />

          <Input 
            label="Phone number"
            name="phone"
            id="phone"
            defaultValue={initialData?.phone}
            placeholder="+1 (555) 000-0000"
            error={errors.phone}
            onBlur={handleBlur}
            required
            disabled={loading}
          />

          <Input 
            label="Location"
            name="location"
            id="location"
            defaultValue={initialData?.location}
            placeholder="San Francisco, CA"
            error={errors.location}
            onBlur={handleBlur}
            required
            disabled={loading}
          />

          <div className="space-y-1.5 text-left">
            <label className="text-text type-ui block font-medium" htmlFor="expected_salary">
              Expected Salary
            </label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Input 
                  name="expected_salary"
                  id="expected_salary"
                  defaultValue={initialData?.expected_salary}
                  type="number"
                  placeholder="120000"
                  error={errors.expected_salary}
                  onBlur={handleBlur}
                  disabled={loading}
                  className="w-full"
                />
              </div>
              <select 
                name="currency"
                id="currency"
                defaultValue={initialData?.currency || "USD"}
                disabled={loading}
                className="outline-none py-3 rounded-xl w-28 transition-all border-input-border bg-input-bg type-ui px-4 border dark:bg-card focus:ring-2 focus:border-primary focus:ring-primary h-[48px]"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="space-y-6">
          <Input 
            label="Professional headline"
            name="headline"
            id="headline"
            defaultValue={initialData?.headline}
            placeholder="Senior Full Stack Engineer | React & Node.js"
            disabled={loading}
          />

          <div className="space-y-1.5 text-left">
            <label className="text-text type-ui block font-medium" htmlFor="summary">
              Professional Summary
            </label>
            <textarea 
              name="summary"
              id="summary"
              defaultValue={initialData?.summary}
              rows={5}
              disabled={loading}
              className="w-full rounded-xl outline-none text-text py-3 px-4 resize-none transition-all border-input-border bg-input-bg leading-relaxed border dark:bg-card focus:ring-2 focus:border-primary focus:ring-primary"
              placeholder="Describe your professional background and key achievements..."
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="relative w-full px-12 justify-center py-4 rounded-xl items-center transition-all text-white gap-3 shadow-xl shadow-primary/20 bg-primary flex md:w-auto hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 font-semibold min-h-[44px]"
          >
            <span className="flex items-center gap-3">
              <Save size={18} aria-hidden="true" />
              <span>Save Profile Details</span>
            </span>
            {loading && (
              <span className="absolute right-4 flex items-center">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
