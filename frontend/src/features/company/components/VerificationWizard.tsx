"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  Building2, ShieldCheck, HelpCircle, FileText, CheckCircle2, 
  AlertTriangle, UploadCloud, Plus, X, Globe, Phone, Mail, User, Briefcase,
  MapPin, Check, ExternalLink, Calendar, Users, Eye, Sparkles
} from "lucide-react";
import { 
  updateCompanyProfileAction
} from "@/features/auth/actions";
import { 
  uploadCompanyDocAction, 
  submitCompanyVerificationAction
} from "../actions";
import { calculateTrustScore, getBadgeDetails } from "@/shared/utils/trustScore";
import { Button } from "@/shared/ui";

interface VerificationWizardProps {
  initialProfile: any;
}

export default function VerificationWizard({ initialProfile }: VerificationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Verification simulation flags
  const [emailVerified, setEmailVerified] = useState(initialProfile?.social_links?.email_verified || false);
  const [phoneVerified, setPhoneVerified] = useState(initialProfile?.social_links?.phone_verified || false);
  const [dnsVerified, setDnsVerified] = useState(initialProfile?.social_links?.dns_verified || false);
  const [htmlVerified, setHtmlVerified] = useState(initialProfile?.social_links?.html_verified || false);
  const [linkedinVerified, setLinkedinVerified] = useState(initialProfile?.social_links?.linkedin_verified || false);
  const [businessVerified, setBusinessVerified] = useState(initialProfile?.social_links?.business_verified || false);

  // OTP Simulations
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState("");

  // Website verification simulation states
  const [webVerifyOption, setWebVerifyOption] = useState<"dns" | "html">("dns");
  const [verifyingWebsite, setVerifyingWebsite] = useState(false);

  // LinkedIn verification simulation states
  const [verifyingLinkedIn, setVerifyingLinkedIn] = useState(false);

  // Recruiter fields
  const [recruiters, setRecruiters] = useState<any[]>([
    { name: "HR Manager", email: initialProfile?.official_email || "hr@company.com", linkedin: "", verified: true }
  ]);
  const [newRecruiter, setNewRecruiter] = useState({ name: "", email: "", linkedin: "" });

  // Form Fields State
  const [formData, setFormData] = useState({
    // Step 1: Basic Company Registration
    name: initialProfile?.name || "",
    website_url: initialProfile?.website || "",
    official_email: initialProfile?.official_email || initialProfile?.email || "",
    phone_number: initialProfile?.phone_number || "",
    industry: initialProfile?.industry || "IT",
    company_size: initialProfile?.company_size || "11-50",
    headquarters_location: initialProfile?.headquarters_location || initialProfile?.city || "",
    founded_year: initialProfile?.year_established || 2020,

    // Contact Profile
    hr_contact_name: initialProfile?.authorized_contact_name || "",
    hr_designation: initialProfile?.authorized_contact_designation || "",

    // Public Profile metadata
    about_description: initialProfile?.description || "",
    culture: initialProfile?.culture || "",
    benefits: initialProfile?.benefits || "",
    linkedin_url: initialProfile?.social_links?.linkedin || "",
    logo_url: initialProfile?.logo_url || "",
    banner_url: initialProfile?.cover_image_url || "",

    // Step 4: Business registration identifiers
    tax_id: initialProfile?.tax_id || "", // GSTIN / PAN
    cin_number: initialProfile?.cin_number || "", // CIN number
    incorporation_doc_url: initialProfile?.incorporation_doc_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Build temporary object for trust score calculator preview
  const companyDataForScore = {
    ...initialProfile,
    official_email: formData.official_email,
    phone_number: formData.phone_number,
    website: formData.website_url,
    tax_id: formData.tax_id,
    cin_number: formData.cin_number,
    registration_number: formData.cin_number,
    verification_status: initialProfile?.verification_status || "pending",
    social_links: {
      ...initialProfile?.social_links,
      linkedin: formData.linkedin_url,
      email_verified: emailVerified,
      phone_verified: phoneVerified,
      dns_verified: dnsVerified,
      html_verified: htmlVerified,
      linkedin_verified: linkedinVerified,
      business_verified: businessVerified || initialProfile?.verification_status === "verified",
    }
  };

  const trustResult = calculateTrustScore(companyDataForScore);
  const badgeDetails = getBadgeDetails(trustResult.badge);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const validExtensions = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validExtensions.includes(file.type)) {
      toast.error("Invalid file format. Only PDF, JPG, and PNG are allowed.");
      return;
    }

    setUploadingField(fieldName);
    const uploadData = new FormData();
    uploadData.append("file", file);

    const result = await uploadCompanyDocAction(uploadData);
    setUploadingField(null);

    if (result.error) {
      toast.error(result.error);
    } else if (result.file_url) {
      setFormData(prev => ({ ...prev, [fieldName]: result.file_url }));
      toast.success("Document uploaded successfully.");
    }
  };

  // Domain Validation check
  const getDomainMismatchWarning = () => {
    if (!formData.official_email || !formData.website_url) return null;
    try {
      const emailDomain = formData.official_email.split("@")[1]?.toLowerCase().trim();
      const webDomain = formData.website_url
        .replace(/https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase()
        .trim();
      
      if (emailDomain && webDomain && emailDomain !== webDomain) {
        return `Corporate email domain (@${emailDomain}) does not match website domain (${webDomain}).`;
      }
    } catch (e) {}
    return null;
  };

  // OTP Simulations
  const sendEmailOtp = () => {
    if (!formData.official_email.includes("@")) {
      toast.error("Please enter a valid official email first.");
      return;
    }
    const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com"];
    const domain = formData.official_email.split("@")[1]?.toLowerCase().trim();
    if (publicDomains.includes(domain)) {
      toast.error("Generic email domains (Gmail, Yahoo, Outlook, etc.) are rejected for official employer accounts.");
      return;
    }
    setShowEmailOtpModal(true);
    toast.success(`OTP Code sent to ${formData.official_email}! (Use 123456)`);
  };

  const verifyEmailOtp = () => {
    if (emailOtpInput === "123456") {
      setEmailVerified(true);
      setShowEmailOtpModal(false);
      toast.success("Official corporate email verified successfully! (+20 trust score)");
    } else {
      toast.error("Invalid OTP code. Please enter 123456.");
    }
  };

  const sendPhoneOtp = () => {
    if (!formData.phone_number) {
      toast.error("Please enter a phone number first.");
      return;
    }
    setShowPhoneOtpModal(true);
    toast.success(`OTP Code sent to ${formData.phone_number}! (Use 123456)`);
  };

  const verifyPhoneOtp = () => {
    if (phoneOtpInput === "123456") {
      setPhoneVerified(true);
      setShowPhoneOtpModal(false);
      toast.success("Phone number verified successfully! (+10 trust score)");
    } else {
      toast.error("Invalid OTP code. Please enter 123456.");
    }
  };

  // Website Verification simulations
  const verifyWebsiteRecord = () => {
    if (!formData.website_url) {
      toast.error("Please provide a website URL in Step 1.");
      return;
    }
    setVerifyingWebsite(true);
    setTimeout(() => {
      setVerifyingWebsite(false);
      if (webVerifyOption === "dns") {
        setDnsVerified(true);
        toast.success("DNS TXT record found and validated successfully! (+20 trust score)");
      } else {
        setHtmlVerified(true);
        toast.success("HTML Verification file verified on site root! (+20 trust score)");
      }
    }, 1500);
  };

  // LinkedIn Verification simulation
  const verifyLinkedInPage = () => {
    if (!formData.linkedin_url.includes("linkedin.com/")) {
      toast.error("Please enter a valid LinkedIn Company URL first.");
      return;
    }
    setVerifyingLinkedIn(true);
    setTimeout(() => {
      setVerifyingLinkedIn(false);
      setLinkedinVerified(true);
      toast.success("LinkedIn profile matched with company name & website! (+10 trust score)");
    }, 1500);
  };

  // Recruiter list actions
  const addRecruiter = () => {
    if (!newRecruiter.name || !newRecruiter.email) {
      toast.error("Name and Email are required to list a recruiter.");
      return;
    }
    // Domain match check
    const recDomain = newRecruiter.email.split("@")[1]?.toLowerCase().trim();
    const compDomain = formData.official_email.split("@")[1]?.toLowerCase().trim();
    
    const isDomainMatch = recDomain && compDomain && recDomain === compDomain;

    setRecruiters([...recruiters, {
      name: newRecruiter.name,
      email: newRecruiter.email,
      linkedin: newRecruiter.linkedin,
      verified: isDomainMatch
    }]);

    if (isDomainMatch) {
      toast.success(`Recruiter verified instantly via matching email domain (@${compDomain})!`);
    } else {
      toast("Recruiter email domain mismatch. Sign-off will require manual admin approval.", { icon: "⚠️" });
    }

    setNewRecruiter({ name: "", email: "", linkedin: "" });
  };

  const removeRecruiter = (index: number) => {
    setRecruiters(recruiters.filter((_, i) => i !== index));
  };

  // Step validations
  const validateStep = (stepNum: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.name.trim()) newErrors.name = "Company Display Name is required.";
      if (!formData.website_url.trim()) newErrors.website_url = "Website URL is required.";
      if (!formData.official_email.trim()) newErrors.official_email = "Official corporate email is required.";
      if (!formData.phone_number.trim()) newErrors.phone_number = "Mobile/phone number is required.";
      if (!formData.headquarters_location.trim()) newErrors.headquarters_location = "Headquarters location is required.";
      if (!formData.logo_url) newErrors.logo_url = "Company logo is required.";
    }

    if (stepNum === 2 && !emailVerified) {
      toast.error("Please complete the corporate email OTP verification step to continue.");
      return false;
    }

    if (stepNum === 3 && !phoneVerified) {
      toast.error("Please complete the phone OTP verification step to continue.");
      return false;
    }

    if (stepNum === 4) {
      if (!formData.tax_id.trim() && !formData.cin_number.trim()) {
        toast.error("Please fill in at least one government registry identifier (GSTIN or CIN).");
        return false;
      }
      if (!formData.incorporation_doc_url) {
        newErrors.incorporation_doc_url = "Please upload incorporation/registration papers.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        website: formData.website_url,
        official_email: formData.official_email,
        phone_number: formData.phone_number,
        industry: formData.industry,
        company_size: formData.company_size,
        city: formData.headquarters_location.split(",")[0]?.trim() || "",
        country: "India",
        year_established: formData.founded_year,
        
        tax_id: formData.tax_id,
        cin_number: formData.cin_number,
        gstin_number: formData.tax_id,
        incorporation_doc_url: formData.incorporation_doc_url,
        
        description: formData.about_description,
        culture: formData.culture,
        benefits: formData.benefits,
        logo_url: formData.logo_url,
        cover_image_url: formData.banner_url,

        authorized_contact_name: formData.hr_contact_name,
        authorized_contact_designation: formData.hr_designation,

        social_links: {
          linkedin: formData.linkedin_url,
          email_verified: emailVerified,
          phone_verified: phoneVerified,
          dns_verified: dnsVerified,
          html_verified: htmlVerified,
          linkedin_verified: linkedinVerified,
          business_verified: businessVerified || initialProfile?.verification_status === "verified",
          admin_approved: initialProfile?.verification_status === "verified",
          recruiters_list: recruiters
        }
      };

      const patchRes = await updateCompanyProfileAction(payload);
      if (patchRes.error) {
        toast.error(`Update failed: ${patchRes.error}`);
        setIsSubmitting(false);
        return;
      }

      // Trigger verification request status
      const verifyRes = await submitCompanyVerificationAction();
      if (verifyRes.error) {
        toast.error(`Verification submission failed: ${verifyRes.error}`);
        setIsSubmitting(false);
        return;
      }

      toast.success("Company profile and verification details successfully synced!");
      router.push("/company");
      router.refresh();
    } catch (e) {
      toast.error("Unexpected error submitting verification.");
      setIsSubmitting(false);
    }
  };

  const warning = getDomainMismatchWarning();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      
      {/* Dynamic Trust Score Banner Header */}
      <div className="bg-surface border border-border/80 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-xl font-bold text-text animate-pulse">Verification Progress</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badgeDetails.color}`}>
              <span>{badgeDetails.indicator}</span>
              <span>{badgeDetails.label}</span>
            </span>
          </div>
          <p className="text-xs text-muted max-w-md">
            Complete the 8 verification stages to increase your Trust Score. Higher scores build job credibility.
          </p>
        </div>

        <div className="flex items-center gap-4 border-l border-border/60 pl-0 md:pl-6 shrink-0">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-primary block">{trustResult.score}</span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Score Points</span>
          </div>
          <div className="w-32 h-2.5 bg-bg border border-border/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${trustResult.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Progress Steps Indicators */}
      <div className="bg-surface border border-border/60 rounded-3xl p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] px-2">
          {[
            { step: 1, label: "Info" },
            { step: 2, label: "Email" },
            { step: 3, label: "Phone" },
            { step: 4, label: "Registry" },
            { step: 5, label: "Website" },
            { step: 6, label: "LinkedIn" },
            { step: 7, label: "Recruiters" },
            { step: 8, label: "Review" }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className={`size-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep > item.step 
                  ? "bg-primary border-primary text-white" 
                  : currentStep === item.step 
                    ? "bg-surface border-primary text-primary shadow-xs" 
                    : "bg-surface border-border text-muted"
              }`}>
                {currentStep > item.step ? <Check size={14} /> : item.step}
              </div>
              <span className={`text-xs font-semibold ${currentStep === item.step ? "text-primary" : "text-muted"}`}>
                {item.label}
              </span>
              {item.step < 8 && <div className="w-6 h-px bg-border/80"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Cards */}
      <div className="bg-surface border border-border/60 rounded-3xl p-8 shadow-sm text-left">
        
        {/* STEP 1: Basic Company Registration */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Building2 className="text-primary" /> Step 1: Corporate Information
              </h3>
              <p className="text-xs text-muted mt-1">Configure essential metadata describing your company profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Display Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className={`w-full h-11 px-4 bg-bg border rounded-xl focus:outline-none focus:border-primary type-ui ${errors.name ? "border-error" : "border-border/60"}`}
                />
                {errors.name && <p className="text-[10px] text-error font-semibold mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Website URL *</label>
                <input 
                  type="url" 
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="e.g. https://acme.com"
                  className={`w-full h-11 px-4 bg-bg border rounded-xl focus:outline-none focus:border-primary type-ui ${errors.website_url ? "border-error" : "border-border/60"}`}
                />
                {errors.website_url && <p className="text-[10px] text-error font-semibold mt-1">{errors.website_url}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Official Corporate Email *</label>
                <input 
                  type="email" 
                  name="official_email"
                  value={formData.official_email}
                  onChange={handleChange}
                  placeholder="e.g. contact@acme.com"
                  className={`w-full h-11 px-4 bg-bg border rounded-xl focus:outline-none focus:border-primary type-ui ${errors.official_email ? "border-error" : "border-border/60"}`}
                />
                {errors.official_email && <p className="text-[10px] text-error font-semibold mt-1">{errors.official_email}</p>}
                {warning && <p className="text-[10px] text-warning font-semibold mt-1">{warning}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Official Phone Number *</label>
                <input 
                  type="text" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="e.g. +91 9988776655"
                  className={`w-full h-11 px-4 bg-bg border rounded-xl focus:outline-none focus:border-primary type-ui ${errors.phone_number ? "border-error" : "border-border/60"}`}
                />
                {errors.phone_number && <p className="text-[10px] text-error font-semibold mt-1">{errors.phone_number}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Industry sector</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                >
                  <option value="IT">Information Technology (IT)</option>
                  <option value="Finance">Finance & Fintech</option>
                  <option value="Healthcare">Healthcare & Biotech</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Education">EdTech & Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Size</label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-1000">201-1000 Employees</option>
                  <option value="1000+">1000+ Employees</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Headquarters City *</label>
                <input 
                  type="text" 
                  name="headquarters_location"
                  value={formData.headquarters_location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore, India"
                  className={`w-full h-11 px-4 bg-bg border rounded-xl focus:outline-none focus:border-primary type-ui ${errors.headquarters_location ? "border-error" : "border-border/60"}`}
                />
                {errors.headquarters_location && <p className="text-[10px] text-error font-semibold mt-1">{errors.headquarters_location}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Founded Year</label>
                <input 
                  type="number" 
                  name="founded_year"
                  value={formData.founded_year}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>
            </div>

            {/* HR Contact info */}
            <div className="border-t border-border/40 pt-6 space-y-4 text-left">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Primary HR Contact Point</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">HR Manager Name</label>
                  <input 
                    type="text" 
                    name="hr_contact_name"
                    value={formData.hr_contact_name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted font-bold block">Designation</label>
                  <input 
                    type="text" 
                    name="hr_designation"
                    value={formData.hr_designation}
                    onChange={handleChange}
                    placeholder="e.g. Head Talent Acquisition"
                    className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                  />
                </div>
              </div>
            </div>

            {/* Logo and Banner uploads */}
            <div className="border-t border-border/40 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Logo *</label>
                <div className="flex items-center gap-4">
                  {formData.logo_url ? (
                    <div className="relative size-16 border border-border/60 rounded-xl overflow-hidden bg-bg">
                      <img src={formData.logo_url} alt="Logo" className="size-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: "" }))}
                        className="absolute top-0 right-0 bg-error text-white p-0.5 rounded-bl hover:bg-error-dark"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="size-16 bg-bg border-2 border-dashed border-border/85 rounded-xl flex items-center justify-center text-muted">
                      <Building2 size={24} />
                    </div>
                  )}
                  {!formData.logo_url && (
                    <label className="cursor-pointer text-xs font-bold text-primary border border-primary/40 px-4 py-2 rounded-xl bg-bg hover:bg-primary/5">
                      {uploadingField === "logo_url" ? "Uploading..." : "Upload Logo"}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "logo_url")}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
                {errors.logo_url && <p className="text-[10px] text-error font-semibold mt-1">{errors.logo_url}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Cover Banner (Optional)</label>
                <div className="flex items-center gap-4">
                  {formData.banner_url ? (
                    <div className="relative w-32 h-16 border border-border/60 rounded-xl overflow-hidden bg-bg">
                      <img src={formData.banner_url} alt="Banner" className="size-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, banner_url: "" }))}
                        className="absolute top-0 right-0 bg-error text-white p-0.5 rounded-bl hover:bg-error-dark"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-16 bg-bg border-2 border-dashed border-border/85 rounded-xl flex items-center justify-center text-[10px] text-muted font-semibold uppercase">
                      No Banner
                    </div>
                  )}
                  {!formData.banner_url && (
                    <label className="cursor-pointer text-xs font-bold text-primary border border-primary/40 px-4 py-2 rounded-xl bg-bg hover:bg-primary/5">
                      {uploadingField === "banner_url" ? "Uploading..." : "Upload Banner"}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "banner_url")}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Public profile descriptions */}
            <div className="border-t border-border/40 pt-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">About Company</label>
                <textarea 
                  name="about_description"
                  value={formData.about_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell candidates about your company mission and vision..."
                  className="w-full p-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Culture</label>
                <textarea 
                  name="culture"
                  value={formData.culture}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Fast-paced, collaborative, zero-ego policies, flexible hours..."
                  className="w-full p-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">Company Perks & Benefits</label>
                <textarea 
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Free snacks, health insurance, remote stipend, wellness budget..."
                  className="w-full p-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">LinkedIn Page URL</label>
                <input 
                  type="url" 
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="e.g. https://linkedin.com/company/acme"
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Email Verification */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Mail className="text-primary" /> Step 2: Email Verification
              </h3>
              <p className="text-xs text-muted mt-1">Verify that your account official email is registered with the company.</p>
            </div>

            <div className="bg-bg/40 p-6 rounded-2xl border border-border/40 max-w-xl space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block">Official Corporate Email</span>
                <span className="text-base font-bold text-text block">{formData.official_email}</span>
              </div>

              {emailVerified ? (
                <div className="bg-success-bg/30 text-success border border-success/20 p-4 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-semibold">Verified Corporate Email (+20 trust score points)</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted">
                    We will simulate sending a 6-digit confirmation code to your official inbox to verify domain credentials.
                  </p>
                  <Button type="button" onClick={sendEmailOtp} variant="primary" className="h-10 text-xs font-bold px-5">
                    Send Verification OTP
                  </Button>
                </div>
              )}
            </div>

            {/* Simulated email OTP modal box */}
            {showEmailOtpModal && (
              <div className="bg-bg/80 border border-border rounded-2xl p-6 max-w-md space-y-4 animate-in zoom-in duration-200">
                <h4 className="text-sm font-bold text-text">Verify Email Code</h4>
                <p className="text-xs text-muted">Enter verification PIN sent to your corporate address. (Enter 123456 to verify)</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code"
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value)}
                    className="h-10 px-3 bg-surface border border-border/80 rounded-xl focus:outline-none type-ui w-full text-center tracking-widest text-lg font-bold"
                  />
                  <Button type="button" onClick={verifyEmailOtp} variant="primary" className="px-5 text-xs font-bold">
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Phone Verification */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Phone className="text-primary" /> Step 3: Phone Verification
              </h3>
              <p className="text-xs text-muted mt-1">Verify employer phone credentials via 2-factor authentication codes.</p>
            </div>

            <div className="bg-bg/40 p-6 rounded-2xl border border-border/40 max-w-xl space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block">Official Mobile Number</span>
                <span className="text-base font-bold text-text block">{formData.phone_number || "Not provided"}</span>
              </div>

              {phoneVerified ? (
                <div className="bg-success-bg/30 text-success border border-success/20 p-4 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-semibold">Verified Phone Number (+10 trust score points)</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted">
                    We will simulate sending a 6-digit confirmation SMS to your mobile line.
                  </p>
                  <Button type="button" onClick={sendPhoneOtp} variant="primary" className="h-10 text-xs font-bold px-5">
                    Send SMS OTP
                  </Button>
                </div>
              )}
            </div>

            {/* Simulated phone OTP modal */}
            {showPhoneOtpModal && (
              <div className="bg-bg/80 border border-border rounded-2xl p-6 max-w-md space-y-4 animate-in zoom-in duration-200">
                <h4 className="text-sm font-bold text-text">Verify Phone Code</h4>
                <p className="text-xs text-muted">Enter SMS confirmation code. (Enter 123456 to verify)</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter PIN"
                    value={phoneOtpInput}
                    onChange={(e) => setPhoneOtpInput(e.target.value)}
                    className="h-10 px-3 bg-surface border border-border/80 rounded-xl focus:outline-none type-ui w-full text-center tracking-widest text-lg font-bold"
                  />
                  <Button type="button" onClick={verifyPhoneOtp} variant="primary" className="px-5 text-xs font-bold">
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Business Verification */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <FileText className="text-primary" /> Step 4: Business Registrations
              </h3>
              <p className="text-xs text-muted mt-1">Provide government registration details (CIN or GSTIN number) for legal audit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">GSTIN Registration Number (15-digit)</label>
                <input 
                  type="text" 
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">CIN Identification Number (21-digit)</label>
                <input 
                  type="text" 
                  name="cin_number"
                  value={formData.cin_number}
                  onChange={handleChange}
                  placeholder="e.g. U12345MH2026PTC123456"
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>
            </div>

            <div className="space-y-2 max-w-xl text-left">
              <label className="text-xs uppercase tracking-wider text-muted font-bold block">Upload Supporting Legal Documents *</label>
              <p className="text-[10px] text-muted -mt-1">PDF, Incorporation Certificate, MSME Registration Udyam, or trade licenses accepted.</p>
              
              <div className="border border-dashed border-border/85 rounded-2xl p-6 bg-bg/20 flex flex-col items-center justify-center gap-4 text-center">
                {formData.incorporation_doc_url ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-success font-semibold text-xs">
                      <CheckCircle2 size={16} /> Incorporation Certificate Uploaded
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, incorporation_doc_url: "" }))}
                      className="text-[10px] font-bold text-error hover:underline"
                    >
                      Delete and re-upload
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="text-muted" size={32} />
                    <label className="cursor-pointer text-xs font-bold text-primary border border-primary/40 px-5 py-2.5 rounded-xl bg-surface hover:bg-primary/5">
                      {uploadingField === "incorporation_doc_url" ? "Uploading Document..." : "Choose File to Upload"}
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, "incorporation_doc_url")}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                  </>
                )}
              </div>
              {errors.incorporation_doc_url && <p className="text-[10px] text-error font-semibold mt-1">{errors.incorporation_doc_url}</p>}
            </div>

            {/* Document Approval Status */}
            <div className="bg-bg/40 border border-border/40 p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Business Verification Status</span>
                <p className="text-xs font-semibold text-text">
                  {initialProfile?.verification_status === "verified" || businessVerified ? "Approved" : "Awaiting Admin Document Audit"}
                </p>
              </div>
              {!businessVerified && (
                <button 
                  type="button"
                  onClick={() => {
                    setBusinessVerified(true);
                    toast.success("Simulated business document approved! (+30 trust score points)");
                  }}
                  className="px-3.5 py-1.5 bg-success/10 border border-success/30 hover:bg-success/20 rounded-lg text-[10px] font-bold text-success transition-all"
                >
                  Mock Approval
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Website Verification */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Globe className="text-primary" /> Step 5: Website Domain Verification
              </h3>
              <p className="text-xs text-muted mt-1">Select a verification option to prove ownership of the website domain.</p>
            </div>

            {/* Verification options tab switcher */}
            <div className="flex gap-2 border-b border-border/60 pb-2">
              <button 
                type="button"
                onClick={() => setWebVerifyOption("dns")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${webVerifyOption === "dns" ? "bg-primary text-white" : "text-muted hover:bg-bg"}`}
              >
                Option A: DNS TXT Record
              </button>
              <button 
                type="button"
                onClick={() => setWebVerifyOption("html")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${webVerifyOption === "html" ? "bg-primary text-white" : "text-muted hover:bg-bg"}`}
              >
                Option B: Upload HTML File
              </button>
            </div>

            {webVerifyOption === "dns" ? (
              <div className="bg-bg/40 border border-border/40 p-6 rounded-2xl space-y-4 max-w-xl text-left">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Configure DNS settings</h4>
                <p className="text-xs text-muted">
                  Log in to your domain registrar and add the following TXT record to your configuration:
                </p>
                <div className="bg-surface p-3.5 border border-border rounded-xl font-mono text-xs flex justify-between items-center text-text select-all">
                  <span>skillsync-verification=12345</span>
                  <span className="text-[10px] uppercase font-bold text-primary cursor-pointer hover:underline" onClick={() => {
                    navigator.clipboard.writeText("skillsync-verification=12345");
                    toast.success("TXT record copied to clipboard!");
                  }}>Copy</span>
                </div>
              </div>
            ) : (
              <div className="bg-bg/40 border border-border/40 p-6 rounded-2xl space-y-4 max-w-xl text-left">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Download HTML Verification page</h4>
                <p className="text-xs text-muted">
                  Download the verification file and upload it to the root of your web server (e.g. `https://acme.com/skillsync_verify.html`).
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    const blob = new Blob(["skillsync-verification=12345"], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "skillsync_verify.html";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success("Verification file downloaded!");
                  }}
                  className="px-4 py-2 border border-border hover:bg-bg text-xs font-bold text-text rounded-xl transition-all"
                >
                  Download skillsync_verify.html
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              {(dnsVerified || htmlVerified) ? (
                <div className="bg-success-bg/30 text-success border border-success/20 p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold w-full max-w-xl">
                  <CheckCircle2 size={18} />
                  <span>Domain verified successfully! (+20 trust score points)</span>
                </div>
              ) : (
                <Button 
                  type="button" 
                  onClick={verifyWebsiteRecord} 
                  disabled={verifyingWebsite}
                  variant="primary" 
                  className="h-11 text-xs font-bold px-6"
                >
                  {verifyingWebsite ? "Detecting validation record..." : "Check Domain Verification"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: LinkedIn Verification */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Globe className="text-primary" /> Step 6: LinkedIn Page Verification
              </h3>
              <p className="text-xs text-muted mt-1">Associate your verified LinkedIn company profile page with JobLyne.</p>
            </div>

            <div className="bg-bg/40 border border-border/40 p-6 rounded-2xl max-w-xl space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted font-bold block">LinkedIn Company Page URL</label>
                <input 
                  type="url"
                  placeholder="https://linkedin.com/company/acme"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  className="w-full h-11 px-4 bg-bg border border-border/60 rounded-xl focus:outline-none focus:border-primary type-ui"
                />
              </div>

              {linkedinVerified ? (
                <div className="bg-success-bg/30 text-success border border-success/20 p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                  <CheckCircle2 size={18} />
                  <span>LinkedIn Page associated and verified (+10 trust score points)</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted">
                    We will dynamically check the URL existence, matching company names, and website match metrics.
                  </p>
                  <Button 
                    type="button" 
                    onClick={verifyLinkedInPage} 
                    disabled={verifyingLinkedIn}
                    variant="primary" 
                    className="h-10 text-xs font-bold px-5"
                  >
                    {verifyingLinkedIn ? "Resolving LinkedIn page..." : "Resolve & Verify Page"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: Recruiter Verification */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Users className="text-primary" /> Step 7: Recruiter Profiling
              </h3>
              <p className="text-xs text-muted mt-1">Manage active recruiters posting on behalf of your verified company namespace.</p>
            </div>

            {/* Recruiter Creation inputs */}
            <div className="bg-bg/40 border border-border/40 p-6 rounded-2xl space-y-4 text-left">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Add New Authorized Recruiter</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={newRecruiter.name}
                  onChange={(e) => setNewRecruiter(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10 px-3 bg-bg border border-border/60 rounded-xl focus:outline-none type-ui text-xs"
                />
                <input 
                  type="email" 
                  placeholder="Work Email Address"
                  value={newRecruiter.email}
                  onChange={(e) => setNewRecruiter(prev => ({ ...prev, email: e.target.value }))}
                  className="h-10 px-3 bg-bg border border-border/60 rounded-xl focus:outline-none type-ui text-xs"
                />
                <input 
                  type="url" 
                  placeholder="LinkedIn Profile URL"
                  value={newRecruiter.linkedin}
                  onChange={(e) => setNewRecruiter(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="h-10 px-3 bg-bg border border-border/60 rounded-xl focus:outline-none type-ui text-xs"
                />
              </div>
              <Button type="button" onClick={addRecruiter} variant="primary" className="h-9 px-4 text-xs font-bold">
                Add Recruiter
              </Button>
            </div>

            {/* Recruiters List */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Active Recruiter Roster</h4>
              <div className="space-y-2">
                {recruiters.map((rec, index) => (
                  <div key={index} className="bg-surface border border-border/60 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-text">{rec.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
                        <span>{rec.email}</span>
                        {rec.linkedin && <span>&bull; <a href={rec.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">LinkedIn</a></span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {rec.verified ? (
                        <span className="text-[10px] font-bold text-success bg-success-bg/25 border border-success/30 px-2 py-0.5 rounded-full">
                          Verified Recruiter
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-muted bg-bg/50 border border-border/60 px-2 py-0.5 rounded-full">
                          Pending Verification
                        </span>
                      )}
                      <button 
                        type="button" 
                        onClick={() => removeRecruiter(index)}
                        className="text-muted hover:text-error text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Admin Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <ShieldCheck className="text-primary" /> Step 8: Submission Audit
              </h3>
              <p className="text-xs text-muted mt-1">Review your calculated verification index metrics before final submission.</p>
            </div>

            <div className="bg-bg/40 border border-border/40 p-6 rounded-2xl space-y-4 max-w-xl text-left font-sans">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Score Point Distribution</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted">Corporate Email OTP Verified (+20 pts)</span>
                  <span className={trustResult.checks.emailVerified ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.emailVerified ? "Passed (20/20)" : "Pending (0/20)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted">Mobile Phone OTP Verified (+10 pts)</span>
                  <span className={trustResult.checks.phoneVerified ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.phoneVerified ? "Passed (10/10)" : "Pending (0/10)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted">Domain Ownership Verified (+20 pts)</span>
                  <span className={trustResult.checks.websiteVerified ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.websiteVerified ? "Passed (20/20)" : "Pending (0/20)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted">GST/CIN Registry Provided (+20 pts)</span>
                  <span className={trustResult.checks.businessSubmitted ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.businessSubmitted ? "Passed (20/20)" : "Pending (0/20)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted">GST/CIN Registry Approved (+10 pts)</span>
                  <span className={trustResult.checks.businessApproved ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.businessApproved ? "Passed (10/10)" : "Pending (0/10)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                  <span className="text-muted">LinkedIn Company Profile Associated (+10 pts)</span>
                  <span className={trustResult.checks.linkedinVerified ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.linkedinVerified ? "Passed (10/10)" : "Pending (0/10)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-muted">Admin Final Review Approved (+10 pts)</span>
                  <span className={trustResult.checks.adminApproved ? "text-success font-bold" : "text-muted"}>
                    {trustResult.checks.adminApproved ? "Passed (10/10)" : "Pending (0/10)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl max-w-xl space-y-2 text-left">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={14} /> Submission Overview
              </h4>
              <p className="text-[11px] text-primary/95 leading-relaxed font-sans">
                By submitting this configuration, you lock corporate data fields for final admin moderation reviews. Upon audit completion, your profile status will update automatically.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="flex justify-between pt-8 border-t border-t-border/40 mt-8">
          <button 
            type="button" 
            onClick={handleBack} 
            disabled={currentStep === 1}
            className="h-11 px-6 bg-bg border border-border/60 hover:bg-border/30 text-text font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Back
          </button>

          {currentStep < 8 ? (
            <button 
              type="button" 
              onClick={handleNext}
              className="h-11 px-6 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition-all active:scale-98 cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="h-11 px-8 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition-all active:scale-98 cursor-pointer disabled:opacity-75 flex items-center gap-2"
            >
              {isSubmitting ? "Submitting Profile..." : "Submit Verification Profile"}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
