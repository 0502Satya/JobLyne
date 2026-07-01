"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export function usePreferenceSettings(
  initialTwoFactor: boolean,
  initialEmailPromo: boolean,
  initialSmsAlerts: boolean,
  initialPushAlerts: boolean,
  initialPublicProfile: boolean,
  initialRecruitersOnly: boolean
) {
  const [twoFactor, setTwoFactor] = useState(initialTwoFactor);
  const [emailPromo, setEmailPromo] = useState(initialEmailPromo);
  const [smsAlerts, setSmsAlerts] = useState(initialSmsAlerts);
  const [pushAlerts, setPushAlerts] = useState(initialPushAlerts);
  const [publicProfile, setPublicProfile] = useState(initialPublicProfile);
  const [recruitersOnly, setRecruitersOnly] = useState(initialRecruitersOnly);

  const handleToggle2FA = useCallback((checked: boolean) => {
    const original = twoFactor;
    setTwoFactor(checked);
    toast.success(checked ? "2FA enabled successfully." : "2FA disabled successfully.");
  }, [twoFactor]);

  const handleToggleEmailPromo = useCallback((checked: boolean) => {
    setEmailPromo(checked);
    toast.success(`Email alerts ${checked ? 'enabled' : 'disabled'}.`);
  }, []);

  const handleToggleSmsAlerts = useCallback((checked: boolean) => {
    setSmsAlerts(checked);
    toast.success(`SMS alerts ${checked ? 'enabled' : 'disabled'}.`);
  }, []);

  const handleTogglePushAlerts = useCallback((checked: boolean) => {
    setPushAlerts(checked);
    toast.success(`Push alerts ${checked ? 'enabled' : 'disabled'}.`);
  }, []);

  const handleTogglePublicProfile = useCallback((checked: boolean) => {
    setPublicProfile(checked);
    toast.success(`Public visibility ${checked ? 'enabled' : 'disabled'}.`);
  }, []);

  const handleToggleRecruitersOnly = useCallback((checked: boolean) => {
    setRecruitersOnly(checked);
    toast.success(`Recruiter-only access ${checked ? 'enabled' : 'disabled'}.`);
  }, []);

  return {
    twoFactor,
    emailPromo,
    smsAlerts,
    pushAlerts,
    publicProfile,
    recruitersOnly,
    handleToggle2FA,
    handleToggleEmailPromo,
    handleToggleSmsAlerts,
    handleTogglePushAlerts,
    handleTogglePublicProfile,
    handleToggleRecruitersOnly
  };
}
