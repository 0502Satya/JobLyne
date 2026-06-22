"use client";

import React, { useState, useRef, useEffect, useActionState } from "react";
import { verifyOtpAction } from "../actions";
import { Button } from "@/shared/ui";
import { MailCheck, AlertCircle, Timer } from "lucide-react";

interface OTPVerificationProps {
  email: string;
}

export default function OTPVerification({ email }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [state, action, isPending] = useActionState(verifyOtpAction, null);
  const [timer, setTimer] = useState(600); // 10 minutes

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/dashboard";
    }
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  return (
    <div className="fade-in space-y-8 mx-auto zoom-in rounded-2xl bg-surface border-border text-center animate-in shadow-xl max-w-md duration-300 p-8 border dark:bg-card dark:border-border">
      <div className="space-y-2">
        <div className="justify-center text-primary mx-auto items-center mb-4 rounded-full flex size-16 bg-primary/10">
          <MailCheck size={36} aria-hidden="true" />
        </div>
        <h2 className="type-h2">Verify Your Email</h2>
        <p className="text-muted text-sm">
          We've sent a 6-digit verification code to <br />
          <span className="text-text">{email}</span>
        </p>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp_code" value={otp.join("")} />
        
        <div role="group" aria-labelledby="otp-label" className="gap-2 flex justify-between">
          <p id="otp-label" className="sr-only">6-digit verification code</p>
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1} of 6`}
              className="outline-none type-h3 w-12 border-2 transition-all text-center bg-bg border-border h-14 rounded-xl dark:border-border dark:bg-card focus:ring-0 focus:border-primary"
            />
          ))}
        </div>

        {state?.error && (
          <div className="bg-error-bg border border-error/20 text-error animate-shake p-3 rounded-xl type-caption flex items-center justify-center gap-2">
            <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
            {state.error}
          </div>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={otp.some(v => v === "")}
          isLoading={isPending}
          className="w-full"
        >
          Verify & Complete Registration
        </Button>
      </form>

      <div className="border-t border-border space-y-4 pt-4 dark:border-border">
        <div className="justify-center text-sm items-center gap-2 flex">
          <Timer size={14} className="text-muted" aria-hidden="true" />
          <span className={`${timer < 60 ? "text-red-500" : "text-muted"}`}>
            Expires in {formatTime(timer)}
          </span>
        </div>
        
        <p className="leading-relaxed text-xs text-muted">
          Didn't receive the code? Check your spam folder or <br />
          <button className="text-primary hover:underline">Resend OTP</button>
        </p>
      </div>
    </div>
  );
}
