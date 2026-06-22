"use client";

import React from "react";
import PortalAuthLayout from "@/features/auth/components/PortalAuthLayout";
import SigninForm from "@/features/auth/components/SigninForm";

/**
 * High-fidelity Specialized Sign In for Companies.
 */
export default function CompanySigninPage() {
  return (
    <PortalAuthLayout
      title="Portal Sign In"
      subtitle="Access your company workspace"
      registerUrl="/auth/signup"
    >
      <SigninForm role="Company" />
    </PortalAuthLayout>
  );
}
