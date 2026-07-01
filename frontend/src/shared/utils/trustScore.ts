export interface TrustScoreResult {
  score: number;
  badge: "UNVERIFIED" | "VERIFIED" | "VERIFIED_PLUS" | "TRUSTED";
  checks: {
    emailVerified: boolean;
    phoneVerified: boolean;
    websiteVerified: boolean;
    businessSubmitted: boolean;
    businessApproved: boolean;
    linkedinVerified: boolean;
    adminApproved: boolean;
  };
}

export function calculateTrustScore(companyData: any): TrustScoreResult {
  // Safe default initial flags
  const checks = {
    emailVerified: false,
    phoneVerified: false,
    websiteVerified: false,
    businessSubmitted: false,
    businessApproved: false,
    linkedinVerified: false,
    adminApproved: false,
  };

  if (!companyData) {
    return { score: 0, badge: "UNVERIFIED", checks };
  }

  // 1. Corporate Email Verified (20 pts)
  const hasOfficialEmail = !!(companyData.official_email || companyData.email);
  const emailVerified = !!(companyData.email_verified || companyData.emailVerified || companyData.social_links?.email_verified);
  if (hasOfficialEmail && emailVerified) {
    checks.emailVerified = true;
  }

  // 2. Phone Verified (10 pts)
  if (companyData.phone_number && (companyData.phone_verified || companyData.phoneVerified || companyData.social_links?.phone_verified)) {
    checks.phoneVerified = true;
  }

  // 3. Website Verified (20 pts)
  if (companyData.website_verified || companyData.websiteVerified || companyData.dns_verified || companyData.html_verified || companyData.social_links?.dns_verified || companyData.social_links?.html_verified) {
    checks.websiteVerified = true;
  }

  // 4. GST/CIN Submitted (20 pts)
  if (companyData.tax_id || companyData.cin_number || companyData.registration_number) {
    checks.businessSubmitted = true;
  }

  // 5. GST/CIN Admin Approved (10 pts)
  if (checks.businessSubmitted && (companyData.business_verified || companyData.businessVerified || companyData.social_links?.business_verified || companyData.verification_status === "verified")) {
    checks.businessApproved = true;
  }

  // 6. LinkedIn Verified (10 pts)
  if (companyData.linkedin_verified || companyData.linkedinVerified || companyData.social_links?.linkedin_verified || companyData.linkedin_url || companyData.social_links?.linkedin) {
    checks.linkedinVerified = true;
  }

  // 7. Admin Final Approval (10 pts)
  if (companyData.verification_status === "verified" || companyData.admin_approved || companyData.adminApproved || companyData.social_links?.admin_approved) {
    checks.adminApproved = true;
  }

  // Calculate total points
  let score = 0;
  if (checks.emailVerified) score += 20;
  if (checks.phoneVerified) score += 10;
  if (checks.websiteVerified) score += 20;
  if (checks.businessSubmitted) score += 20;
  if (checks.businessApproved) score += 10;
  if (checks.linkedinVerified) score += 10;
  if (checks.adminApproved) score += 10;

  // Resolve Badge Tier
  let badge: TrustScoreResult["badge"] = "UNVERIFIED";
  if (score >= 90 && checks.adminApproved) {
    badge = "TRUSTED";
  } else if (score >= 70) {
    badge = "VERIFIED_PLUS";
  } else if (score >= 40 || companyData.verification_status === "verified" || companyData.verified_badge) {
    badge = "VERIFIED";
  } else {
    badge = "UNVERIFIED";
  }

  return {
    score,
    badge,
    checks,
  };
}

export function getBadgeDetails(badge: TrustScoreResult["badge"]) {
  switch (badge) {
    case "TRUSTED":
      return {
        label: "Trusted Employer",
        color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
        indicator: "🟡"
      };
    case "VERIFIED_PLUS":
      return {
        label: "Verified+ Employer",
        color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/30",
        indicator: "🟣"
      };
    case "VERIFIED":
      return {
        label: "Verified Employer",
        color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30",
        indicator: "🔵"
      };
    default:
      return {
        label: "Unverified Employer",
        color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30",
        indicator: "🔴"
      };
  }
}
