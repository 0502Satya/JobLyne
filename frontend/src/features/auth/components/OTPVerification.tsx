"use client";

import React, { useState, useRef, useEffect, useActionState } from "react";
import { verifyOtpAction } from "../actions";

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
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 space-y-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="space-y-2">
        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <span className="material-symbols-outlined text-4xl">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight">Verify Your Email</h2>
        <p className="text-slate-500 text-sm">
          We've sent a 6-digit verification code to <br />
          <span className="font-bold text-slate-900 dark:text-white">{email}</span>
        </p>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp_code" value={otp.join("")} />
        
        <div className="flex justify-between gap-2">
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
              className="w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary focus:ring-0 transition-all outline-none"
            />
          ))}
        </div>

        {state?.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg animate-shake">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || otp.some(v => v === "")}
          className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Verify & Complete Registration"
          )}
        </button>
      </form>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="material-symbols-outlined text-sm text-slate-400">timer</span>
          <span className={`${timer < 60 ? "text-red-500 font-bold" : "text-slate-500"}`}>
            Expires in {formatTime(timer)}
          </span>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          Didn't receive the code? Check your spam folder or <br />
          <button className="text-primary font-bold hover:underline">Resend OTP</button>
        </p>
      </div>
    </div>
  );
}
