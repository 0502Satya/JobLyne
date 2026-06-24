"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  Building2, ShieldCheck, HelpCircle, FileText, CheckCircle2, 
  AlertTriangle, UploadCloud, Plus, X, Globe, Phone, Mail, User, Briefcase,
  MapPin
} from "lucide-react";
import { 
  updateCompanyProfileAction
} from "@/features/auth/actions";
import { 
  uploadCompanyDocAction, 
  submitCompanyVerificationAction,
  inviteTeamMemberAction
} from "../actions";

interface VerificationWizardProps {
  initialProfile: any;
}

export default function VerificationWizard({ initialProfile }: VerificationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    // Step 1: Legal & Verification
    legal_name: "",
    country: "India",
    registration_number: "",
    tax_id: "",
    company_type: "private_ltd",
    year_established: new Date().getFullYear(),
    registered_address: "",
    official_email: "",
    phone_number: "",
    authorized_contact_name: "",
    authorized_contact_designation: "",
    id_proof_url: "",
    incorporation_doc_url: "",
    tax_doc_url: "",
    address_proof_url: "",

    // Step 2: Public Profile
    display_name: "",
    logo_url: "",
    banner_url: "",
    industry: "IT",
    company_size: "11-50",
    headquarters_location: "",
    website_url: "",
    tagline: "",
    about_description: "",
    linkedin_url: "",
    twitter_url: "",
    facebook_url: "",
    instagram_url: "",

    // Step 3: Hiring Preferences & Settings
    hiring_contact_email: "",
    profile_visibility: true,
    allow_candidate_messages: true,
  });

  // Hiring tags list
  const [hiringDepartments, setHiringDepartments] = useState<string[]>([]);
  const [depInput, setDepInput] = useState("");

  const [perksBenefits, setPerksBenefits] = useState<string[]>([]);
  const [perkInput, setPerkInput] = useState("");

  const [cultureTags, setCultureTags] = useState<string[]>([]);
  const [cultureInput, setCultureInput] = useState("");

  // Team invitations
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteEmailInput, setInviteEmailInput] = useState("");

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Load initial data & draft
  useEffect(() => {
    // Start with profile fields if present
    if (initialProfile) {
      setFormData(prev => ({
        ...prev,
        legal_name: initialProfile.legal_name || initialProfile.name || "",
        registration_number: initialProfile.registration_number || initialProfile.cin_number || "",
        tax_id: initialProfile.tax_id || initialProfile.gstin_number || "",
        company_type: initialProfile.company_type || "private_ltd",
        year_established: initialProfile.year_established || new Date().getFullYear(),
        registered_address: initialProfile.registered_address || initialProfile.city || "",
        official_email: initialProfile.official_email || initialProfile.email || "",
        phone_number: initialProfile.phone_number || "",
        authorized_contact_name: initialProfile.authorized_contact_name || "",
        authorized_contact_designation: initialProfile.authorized_contact_designation || "",
        id_proof_url: initialProfile.id_proof_url || "",
        incorporation_doc_url: initialProfile.incorporation_doc_url || "",
        tax_doc_url: initialProfile.tax_doc_url || "",
        address_proof_url: initialProfile.address_proof_url || "",

        display_name: initialProfile.name || "",
        logo_url: initialProfile.logo_url || "",
        banner_url: initialProfile.cover_image_url || "",
        industry: initialProfile.industry || "IT",
        company_size: initialProfile.company_size || "11-50",
        headquarters_location: initialProfile.headquarters_location || initialProfile.city || "",
        website_url: initialProfile.website || "",
        tagline: initialProfile.tagline || "",
        about_description: initialProfile.description || "",
        linkedin_url: initialProfile.social_links?.linkedin || "",
        twitter_url: initialProfile.social_links?.twitter || "",
        facebook_url: initialProfile.social_links?.facebook || "",
        instagram_url: initialProfile.social_links?.instagram || "",

        hiring_contact_email: initialProfile.hiring_contact_email || "",
        profile_visibility: initialProfile.profile_visibility ?? true,
        allow_candidate_messages: initialProfile.allow_candidate_messages ?? true,
      }));

      if (initialProfile.hiring_departments) {
        setHiringDepartments(initialProfile.hiring_departments);
      }
      if (initialProfile.perks_benefits) {
        setPerksBenefits(initialProfile.perks_benefits);
      }
      if (initialProfile.culture_tags) {
        setCultureTags(initialProfile.culture_tags);
      }
    }

    // Try loading saved draft from localStorage to resume progress
    try {
      const draft = localStorage.getItem("joblyne_company_verification_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        if (parsed.hiringDepartments) setHiringDepartments(parsed.hiringDepartments);
        if (parsed.perksBenefits) setPerksBenefits(parsed.perksBenefits);
        if (parsed.cultureTags) setCultureTags(parsed.cultureTags);
        if (parsed.inviteEmails) setInviteEmails(parsed.inviteEmails);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      }
    } catch (e) {
      console.error("Failed to load draft from localStorage", e);
    }
  }, [initialProfile]);

  // 2. Persist draft state on changes
  useEffect(() => {
    try {
      const draft = {
        formData,
        hiringDepartments,
        perksBenefits,
        cultureTags,
        inviteEmails,
        currentStep
      };
      localStorage.setItem("joblyne_company_verification_draft", JSON.stringify(draft));
    } catch (e) {
      console.error("Failed to save draft to localStorage", e);
    }
  }, [formData, hiringDepartments, perksBenefits, cultureTags, inviteEmails, currentStep]);

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error if any
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Tag helper adding/removing
  const addTag = (type: "dept" | "perk" | "culture") => {
    if (type === "dept" && depInput.trim()) {
      if (!hiringDepartments.includes(depInput.trim())) {
        setHiringDepartments([...hiringDepartments, depInput.trim()]);
      }
      setDepInput("");
    } else if (type === "perk" && perkInput.trim()) {
      if (!perksBenefits.includes(perkInput.trim())) {
        setPerksBenefits([...perksBenefits, perkInput.trim()]);
      }
      setPerkInput("");
    } else if (type === "culture" && cultureInput.trim()) {
      if (!cultureTags.includes(cultureInput.trim())) {
        setCultureTags([...cultureTags, cultureInput.trim()]);
      }
      setCultureInput("");
    }
  };

  const removeTag = (type: "dept" | "perk" | "culture", index: number) => {
    if (type === "dept") {
      setHiringDepartments(hiringDepartments.filter((_, i) => i !== index));
    } else if (type === "perk") {
      setPerksBenefits(perksBenefits.filter((_, i) => i !== index));
    } else if (type === "culture") {
      setCultureTags(cultureTags.filter((_, i) => i !== index));
    }
  };

  const addInvite = () => {
    if (inviteEmailInput.trim()) {
      const email = inviteEmailInput.trim().toLowerCase();
      // Basic check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (inviteEmails.includes(email)) {
        toast.error("Email already in invitations list.");
        return;
      }
      setInviteEmails([...inviteEmails, email]);
      setInviteEmailInput("");
    }
  };

  const removeInvite = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  // Document upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    // Mime type check
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

  // Domain Mismatch Warning
  const getDomainWarning = () => {
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
        return "Official email domain does not match website domain. This may require manual review by our verification team.";
      }
    } catch (e) {}
    return null;
  };

  // Step Validations
  const validateStep = (stepNum: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.legal_name.trim()) newErrors.legal_name = "Legal company name is required.";
      if (!formData.registration_number.trim()) newErrors.registration_number = "Registration number is required.";
      if (!formData.tax_id.trim()) newErrors.tax_id = "Tax ID / GST / PAN is required.";
      if (!formData.registered_address.trim()) newErrors.registered_address = "Registered address is required.";
      if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required.";
      if (!formData.authorized_contact_name.trim()) newErrors.authorized_contact_name = "Authorized contact name is required.";
      if (!formData.authorized_contact_designation.trim()) newErrors.authorized_contact_designation = "Authorized contact designation is required.";
      
      // Email domain checks
      if (!formData.official_email.trim()) {
        newErrors.official_email = "Official company email is required.";
      } else {
        const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "protonmail.com"];
        const domain = formData.official_email.split("@")[1]?.toLowerCase().trim();
        if (publicDomains.includes(domain)) {
          newErrors.official_email = "Generic/public emails (Gmail, Yahoo, Outlook, etc.) are rejected. Please use your official corporate email.";
        }
      }

      // India formats checks
      if (formData.country === "India") {
        // GSTIN Format: 15 chars alphanumeric
        const gstRegex = /^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]{1}\d{1}[Zz]{1}[A-Za-z\d]{1}$/;
        // PAN Format: 10 chars alphanumeric
        const panRegex = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
        // CIN Format: 21 chars alphanumeric
        const cinRegex = /^[ULul]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6}$/;

        const regNum = formData.registration_number.trim();
        const taxId = formData.tax_id.trim();

        if (regNum && !cinRegex.test(regNum)) {
          newErrors.registration_number = "Invalid Indian Corporate Identity Number (CIN) format. Expected standard 21-digit format (e.g. U12345MH2026PTC123456).";
        }

        if (taxId && !gstRegex.test(taxId) && !panRegex.test(taxId)) {
          newErrors.tax_id = "Invalid Indian GSTIN (15-digit) or PAN (10-digit) format. Please enter a valid identifier.";
        }
      }

      // Required Doc Uploads
      if (!formData.incorporation_doc_url) newErrors.incorporation_doc_url = "Incorporation document upload is required.";
      if (!formData.tax_doc_url) newErrors.tax_doc_url = "Tax registration document upload is required.";
    }

    if (stepNum === 2) {
      if (!formData.display_name.trim()) newErrors.display_name = "Public Display Name is required.";
      if (!formData.headquarters_location.trim()) newErrors.headquarters_location = "Headquarters location is required.";
      if (!formData.logo_url) newErrors.logo_url = "Company logo is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fill in all required fields correctly before continuing.");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Submit flow
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Format payload for PATCH profile update
      const updatePayload = {
        name: formData.display_name,
        description: formData.about_description,
        website: formData.website_url,
        logo_url: formData.logo_url,
        cover_image_url: formData.banner_url,
        industry: formData.industry,
        city: formData.headquarters_location.split(",")[0]?.trim() || "",
        country: formData.country,
        tax_id: formData.tax_id,
        cin_number: formData.registration_number,
        gstin_number: formData.tax_id,

        // legal fields
        legal_name: formData.legal_name,
        registration_number: formData.registration_number,
        company_type: formData.company_type,
        year_established: formData.year_established,
        registered_address: formData.registered_address,
        official_email: formData.official_email,
        phone_number: formData.phone_number,
        authorized_contact_name: formData.authorized_contact_name,
        authorized_contact_designation: formData.authorized_contact_designation,
        id_proof_url: formData.id_proof_url,
        incorporation_doc_url: formData.incorporation_doc_url,
        tax_doc_url: formData.tax_doc_url,
        address_proof_url: formData.address_proof_url,

        // profile metadata fields
        company_size: formData.company_size,
        headquarters_location: formData.headquarters_location,
        additional_locations: [],
        tagline: formData.tagline,
        social_links: {
          linkedin: formData.linkedin_url,
          twitter: formData.twitter_url,
          facebook: formData.facebook_url,
          instagram: formData.instagram_url,
        },

        // hiring info
        hiring_departments: hiringDepartments,
        hiring_contact_email: formData.hiring_contact_email || formData.official_email,
        perks_benefits: perksBenefits,
        culture_tags: cultureTags,

        // settings
        profile_visibility: formData.profile_visibility,
        allow_candidate_messages: formData.allow_candidate_messages,
      };

      // 2. Submit PATCH
      const patchRes = await updateCompanyProfileAction(updatePayload);
      if (patchRes.error) {
        toast.error(`Profile Save Failed: ${patchRes.error}`);
        setIsSubmitting(false);
        return;
      }

      // 3. Send Team Invites
      if (inviteEmails.length > 0) {
        for (const email of inviteEmails) {
          await inviteTeamMemberAction(email, "VIEWER");
        }
      }

      // 4. Submit Verification
      const verifyRes = await submitCompanyVerificationAction();
      if (verifyRes.error) {
        toast.error(`Verification Submission Failed: ${verifyRes.error}`);
        setIsSubmitting(false);
        return;
      }

      // Success
      toast.success("Verification request submitted successfully!");
      localStorage.removeItem("joblyne_company_verification_draft");
      
      // Force refresh company data and route
      router.push("/company");
      router.refresh();
    } catch (e) {
      toast.error("An unexpected error occurred during submission.");
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const domainWarning = getDomainWarning();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      
      {/* Header */}
      <div className="space-y-2 text-center">
        <Building2 className="text-primary mx-auto h-12 w-12" aria-hidden="true" />
        <h1 className="type-h1 text-text">Verify Your Workspace profile</h1>
        <p className="type-body text-muted max-w-xl mx-auto">
          Submit your legal verification details and document templates to complete your corporate onboarding and unlock job posting abilities.
        </p>
      </div>

      {/* Progress Wizard Steps */}
      <div className="bg-surface border-border border-b rounded-3xl p-6 transition-all shadow-sm">
        <div className="justify-between items-center flex relative max-w-2xl mx-auto">
          <div className="bg-border h-1 top-1/2 left-0 absolute w-full -translate-y-1/2 z-0"></div>
          <div 
            className="bg-primary h-1 top-1/2 left-0 absolute transition-all duration-300 -translate-y-1/2 z-0"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
          
          {[
            { step: 1, label: "Legal Profile" },
            { step: 2, label: "Public Profile" },
            { step: 3, label: "Hiring Info" },
            { step: 4, label: "Review & Submit" }
          ].map((item) => (
            <div key={item.step} className="items-center flex flex-col relative z-10">
              <div className={`size-10 rounded-full font-semibold transition-all border-2 flex justify-center items-center ${
                currentStep > item.step 
                  ? "bg-primary border-primary text-white" 
                  : currentStep === item.step 
                    ? "bg-surface border-primary text-primary shadow-lg shadow-primary/20" 
                    : "bg-surface border-border text-muted"
              }`}>
                {currentStep > item.step ? <CheckCircle2 size={20} aria-hidden="true" /> : item.step}
              </div>
              <span className={`text-xs mt-2 font-medium tracking-tight whitespace-nowrap ${
                currentStep === item.step ? "text-primary" : "text-muted"
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-surface border border-border rounded-card transition-all p-8 shadow-sm">
        
        {/* STEP 1: Legal & Verification */}
        {currentStep === 1 && (
          <div className="fade-in space-y-6 animate-in duration-300">
            <div>
              <h2 className="type-h2 text-text">Step 1: Legal & Verification details</h2>
              <p className="type-label">Provide your company's official registered data and uploads. This remains private for admin review.</p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              {/* Country Select */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Country of incorporation *</label>
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange}
                  className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other Region</option>
                </select>
              </div>

              {/* Legal Name */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Official Legal Name *</label>
                <input 
                  type="text" 
                  name="legal_name"
                  value={formData.legal_name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corporation Pvt. Ltd."
                  className={`w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                    errors.legal_name ? "border-error" : ""
                  }`}
                />
                {errors.legal_name && <p className="text-xs text-error font-medium">{errors.legal_name}</p>}
              </div>

              {/* Corporate Registration Number (CIN) */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">
                  {formData.country === "India" ? "Corporate Identity Number (CIN) *" : "Company Registration Number *"}
                </label>
                <input 
                  type="text" 
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  placeholder={formData.country === "India" ? "U12345MH2026PTC123456" : "Registration ID"}
                  className={`w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                    errors.registration_number ? "border-error" : ""
                  }`}
                />
                {errors.registration_number && <p className="text-xs text-error font-medium">{errors.registration_number}</p>}
              </div>

              {/* Tax Registration (GST/PAN) */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">
                  {formData.country === "India" ? "GSTIN or PAN *" : "Tax ID / VAT / EIN *"}
                </label>
                <input 
                  type="text" 
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  placeholder={formData.country === "India" ? "27AAAAA1111A1Z1" : "Tax Registration Code"}
                  className={`w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                    errors.tax_id ? "border-error" : ""
                  }`}
                />
                {errors.tax_id && <p className="text-xs text-error font-medium">{errors.tax_id}</p>}
              </div>

              {/* Company Type */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Entity Type *</label>
                <select 
                  name="company_type" 
                  value={formData.company_type} 
                  onChange={handleChange}
                  className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                >
                  <option value="private_ltd">Private Limited</option>
                  <option value="public_ltd">Public Limited</option>
                  <option value="llp">Limited Liability Partnership (LLP)</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="ngo">NGO / Non-Profit</option>
                  <option value="government">Government Agency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Year Established */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Year Established</label>
                <input 
                  type="number" 
                  name="year_established"
                  value={formData.year_established}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                />
              </div>

              {/* Official Corporate Email */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Official Company Email *</label>
                <div className="relative">
                  <Mail className="left-4 absolute top-1/2 -translate-y-1/2 text-muted h-5 w-5" aria-hidden="true" />
                  <input 
                    type="email" 
                    name="official_email"
                    value={formData.official_email}
                    onChange={handleChange}
                    placeholder="e.g. hr@yourcompany.com"
                    className={`w-full min-h-[44px] pl-12 border-border rounded-xl py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                      errors.official_email ? "border-error" : ""
                    }`}
                  />
                </div>
                {errors.official_email && <p className="text-xs text-error font-medium">{errors.official_email}</p>}
              </div>

              {/* Phone number */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Phone Number *</label>
                <div className="relative">
                  <Phone className="left-4 absolute top-1/2 -translate-y-1/2 text-muted h-5 w-5" aria-hidden="true" />
                  <input 
                    type="tel" 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full min-h-[44px] pl-12 border-border rounded-xl py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                      errors.phone_number ? "border-error" : ""
                    }`}
                  />
                </div>
                {errors.phone_number && <p className="text-xs text-error font-medium">{errors.phone_number}</p>}
              </div>

              {/* Authorized Contact Person */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Authorized Signatory Name *</label>
                <div className="relative">
                  <User className="left-4 absolute top-1/2 -translate-y-1/2 text-muted h-5 w-5" aria-hidden="true" />
                  <input 
                    type="text" 
                    name="authorized_contact_name"
                    value={formData.authorized_contact_name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className={`w-full min-h-[44px] pl-12 border-border rounded-xl py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                      errors.authorized_contact_name ? "border-error" : ""
                    }`}
                  />
                </div>
                {errors.authorized_contact_name && <p className="text-xs text-error font-medium">{errors.authorized_contact_name}</p>}
              </div>

              {/* Authorized Designation */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Authorized Contact Designation *</label>
                <div className="relative">
                  <Briefcase className="left-4 absolute top-1/2 -translate-y-1/2 text-muted h-5 w-5" aria-hidden="true" />
                  <input 
                    type="text" 
                    name="authorized_contact_designation"
                    value={formData.authorized_contact_designation}
                    onChange={handleChange}
                    placeholder="e.g. HR Director / Founder"
                    className={`w-full min-h-[44px] pl-12 border-border rounded-xl py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                      errors.authorized_contact_designation ? "border-error" : ""
                    }`}
                  />
                </div>
                {errors.authorized_contact_designation && <p className="text-xs text-error font-medium">{errors.authorized_contact_designation}</p>}
              </div>
            </div>

            {/* Registered Address */}
            <div className="space-y-2">
              <label className="type-ui text-text font-medium block">Registered HQ Address *</label>
              <textarea 
                name="registered_address"
                value={formData.registered_address}
                onChange={handleChange}
                placeholder="Full address of the corporate headquarters..."
                rows={3}
                className={`w-full border-border rounded-xl px-4 py-3 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                  errors.registered_address ? "border-error" : ""
                }`}
              />
              {errors.registered_address && <p className="text-xs text-error font-medium">{errors.registered_address}</p>}
            </div>

            {/* Document Uploads */}
            <div className="border-t pt-6 border-border space-y-6">
              <h3 className="type-h3 text-text">Verify Documents</h3>
              <p className="type-label -mt-4">Please upload corporate identification documents. Maximium size: 5MB. PDF, JPG, PNG accepted.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Incorporation doc */}
                <div className="border rounded-2xl p-6 bg-surface border-border flex flex-col justify-between h-[180px]">
                  <div className="space-y-1">
                    <h4 className="text-text type-ui font-semibold flex gap-2 items-center">
                      Certificate of incorporation * 
                      {formData.incorporation_doc_url && <CheckCircle2 className="text-success h-5 w-5" aria-hidden="true" />}
                    </h4>
                    <p className="text-xs text-muted">Upload copy of incorporation act registration papers.</p>
                  </div>
                  <div>
                    {formData.incorporation_doc_url ? (
                      <div className="flex justify-between items-center bg-success/5 border border-success/20 rounded-xl px-4 py-2">
                        <span className="text-xs text-success font-medium truncate max-w-[200px]">Doc Uploaded</span>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, incorporation_doc_url: "" }))}
                          className="text-error hover:text-error/80 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-text hover:text-primary transition-all flex justify-center items-center py-3 bg-bg border border-dashed border-border rounded-xl text-xs font-semibold hover:border-primary">
                        {uploadingField === "incorporation_doc_url" ? (
                          <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="flex gap-2 items-center"><UploadCloud size={16} /> Choose Document</div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, "incorporation_doc_url")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    )}
                  </div>
                  {errors.incorporation_doc_url && <p className="text-xs text-error font-medium mt-1">{errors.incorporation_doc_url}</p>}
                </div>

                {/* Tax Doc */}
                <div className="border rounded-2xl p-6 bg-surface border-border flex flex-col justify-between h-[180px]">
                  <div className="space-y-1">
                    <h4 className="text-text type-ui font-semibold flex gap-2 items-center">
                      Tax Registration Doc *
                      {formData.tax_doc_url && <CheckCircle2 className="text-success h-5 w-5" aria-hidden="true" />}
                    </h4>
                    <p className="text-xs text-muted">Upload GST certificate, EIN paper, or local tax registration.</p>
                  </div>
                  <div>
                    {formData.tax_doc_url ? (
                      <div className="flex justify-between items-center bg-success/5 border border-success/20 rounded-xl px-4 py-2">
                        <span className="text-xs text-success font-medium truncate max-w-[200px]">Doc Uploaded</span>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, tax_doc_url: "" }))}
                          className="text-error hover:text-error/80 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-text hover:text-primary transition-all flex justify-center items-center py-3 bg-bg border border-dashed border-border rounded-xl text-xs font-semibold hover:border-primary">
                        {uploadingField === "tax_doc_url" ? (
                          <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="flex gap-2 items-center"><UploadCloud size={16} /> Choose Document</div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, "tax_doc_url")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    )}
                  </div>
                  {errors.tax_doc_url && <p className="text-xs text-error font-medium mt-1">{errors.tax_doc_url}</p>}
                </div>

                {/* ID Proof (optional) */}
                <div className="border rounded-2xl p-6 bg-surface border-border flex flex-col justify-between h-[180px]">
                  <div className="space-y-1">
                    <h4 className="text-text type-ui font-semibold flex gap-2 items-center">
                      Authorized Contact ID Proof
                      {formData.id_proof_url && <CheckCircle2 className="text-success h-5 w-5" aria-hidden="true" />}
                    </h4>
                    <p className="text-xs text-muted">Upload PAN, Aadhaar, Passport of contact signatory.</p>
                  </div>
                  <div>
                    {formData.id_proof_url ? (
                      <div className="flex justify-between items-center bg-success/5 border border-success/20 rounded-xl px-4 py-2">
                        <span className="text-xs text-success font-medium truncate max-w-[200px]">Doc Uploaded</span>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, id_proof_url: "" }))}
                          className="text-error hover:text-error/80 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-text hover:text-primary transition-all flex justify-center items-center py-3 bg-bg border border-dashed border-border rounded-xl text-xs font-semibold hover:border-primary">
                        {uploadingField === "id_proof_url" ? (
                          <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="flex gap-2 items-center"><UploadCloud size={16} /> Choose Document</div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, "id_proof_url")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Address Proof (optional) */}
                <div className="border rounded-2xl p-6 bg-surface border-border flex flex-col justify-between h-[180px]">
                  <div className="space-y-1">
                    <h4 className="text-text type-ui font-semibold flex gap-2 items-center">
                      HQ Address Proof
                      {formData.address_proof_url && <CheckCircle2 className="text-success h-5 w-5" aria-hidden="true" />}
                    </h4>
                    <p className="text-xs text-muted">Upload utility bill or registry showing registered address.</p>
                  </div>
                  <div>
                    {formData.address_proof_url ? (
                      <div className="flex justify-between items-center bg-success/5 border border-success/20 rounded-xl px-4 py-2">
                        <span className="text-xs text-success font-medium truncate max-w-[200px]">Doc Uploaded</span>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, address_proof_url: "" }))}
                          className="text-error hover:text-error/80 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-text hover:text-primary transition-all flex justify-center items-center py-3 bg-bg border border-dashed border-border rounded-xl text-xs font-semibold hover:border-primary">
                        {uploadingField === "address_proof_url" ? (
                          <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="flex gap-2 items-center"><UploadCloud size={16} /> Choose Document</div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, "address_proof_url")}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Public Profile */}
        {currentStep === 2 && (
          <div className="fade-in space-y-6 animate-in duration-300">
            <div>
              <h2 className="type-h2 text-text">Step 2: Public Profile Details</h2>
              <p className="type-label">This information is shown to candidates searching for openings on JobLyne.</p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              
              {/* Display Name */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Public Display Name *</label>
                <input 
                  type="text" 
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Labs"
                  className={`w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                    errors.display_name ? "border-error" : ""
                  }`}
                />
                {errors.display_name && <p className="text-xs text-error font-medium">{errors.display_name}</p>}
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Company Tagline (Max 120 chars)</label>
                <input 
                  type="text" 
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="e.g. Engineering the future of developer tools."
                  className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                />
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Website URL (recommended)</label>
                <div className="relative">
                  <Globe className="left-4 absolute top-1/2 -translate-y-1/2 text-muted h-5 w-5" aria-hidden="true" />
                  <input 
                    type="url" 
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="e.g. https://acme.com"
                    className="w-full min-h-[44px] pl-12 border-border rounded-xl py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                  />
                </div>
                {domainWarning && (
                  <p className="text-xs text-warning bg-warning-bg rounded-lg border border-warning/10 p-2 flex gap-1.5 items-start mt-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{domainWarning}</span>
                  </p>
                )}
              </div>

              {/* Headquarters Location */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Headquarters Location *</label>
                <div className="relative">
                  <MapPin className="left-4 absolute top-1/2 -translate-y-1/2 text-muted h-5 w-5" aria-hidden="true" />
                  <input 
                    type="text" 
                    name="headquarters_location"
                    value={formData.headquarters_location}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, India"
                    className={`w-full min-h-[44px] pl-12 border-border rounded-xl py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui ${
                      errors.headquarters_location ? "border-error" : ""
                    }`}
                  />
                </div>
                {errors.headquarters_location && <p className="text-xs text-error font-medium">{errors.headquarters_location}</p>}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Industry Sector *</label>
                <select 
                  name="industry" 
                  value={formData.industry} 
                  onChange={handleChange}
                  className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                >
                  <option value="IT">Information Technology (IT)</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Healthcare">Healthcare / Biotech</option>
                  <option value="Finance">Finance / Fintech</option>
                  <option value="Retail">Retail / E-commerce</option>
                  <option value="Education">Education / Edtech</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Company Size *</label>
                <select 
                  name="company_size" 
                  value={formData.company_size} 
                  onChange={handleChange}
                  className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="500+">500+ Employees</option>
                </select>
              </div>
            </div>

            {/* Logo & Banner URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-border">
              
              {/* Logo Url */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Company Logo Image *</label>
                <div className="flex gap-4 items-center">
                  {formData.logo_url ? (
                    <div className="relative size-16 rounded-xl border border-border overflow-hidden bg-bg">
                      <img src={formData.logo_url} alt="Logo" className="object-cover size-full" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: "" }))}
                        className="absolute -top-1 -right-1 bg-error text-white rounded-full p-0.5 hover:bg-error/90 shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="size-16 rounded-xl border-2 border-dashed border-border flex justify-center items-center text-muted">
                      <Building2 size={24} />
                    </div>
                  )}
                  {!formData.logo_url && (
                    <label className="cursor-pointer text-xs font-semibold px-4 py-2 bg-bg border border-border rounded-xl hover:text-primary hover:border-primary transition-all">
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
                {errors.logo_url && <p className="text-xs text-error font-medium">{errors.logo_url}</p>}
              </div>

              {/* Cover Banner Image */}
              <div className="space-y-2">
                <label className="type-ui text-text font-medium block">Public Profile Banner (optional)</label>
                <div className="flex gap-4 items-center">
                  {formData.banner_url ? (
                    <div className="relative w-32 h-16 rounded-xl border border-border overflow-hidden bg-bg">
                      <img src={formData.banner_url} alt="Banner" className="object-cover size-full" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, banner_url: "" }))}
                        className="absolute -top-1 -right-1 bg-error text-white rounded-full p-0.5 hover:bg-error/90 shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-16 rounded-xl border-2 border-dashed border-border flex justify-center items-center text-muted text-xs">
                      No Banner
                    </div>
                  )}
                  {!formData.banner_url && (
                    <label className="cursor-pointer text-xs font-semibold px-4 py-2 bg-bg border border-border rounded-xl hover:text-primary hover:border-primary transition-all">
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

            {/* About Description */}
            <div className="space-y-2">
              <label className="type-ui text-text font-medium block">About Company Description (Max 2000 chars)</label>
              <textarea 
                name="about_description"
                value={formData.about_description}
                onChange={handleChange}
                maxLength={2000}
                placeholder="Tell candidates about your mission, values, work culture, and domain..."
                rows={5}
                className="w-full border-border rounded-xl px-4 py-3 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
              />
              <div className="text-right text-xs text-muted">
                {formData.about_description.length}/2000 characters
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 border-t pt-6 border-border">
              <h3 className="type-h3 text-text">Social Links</h3>
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                
                {/* LinkedIn */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted block">LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/example"
                    className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted block">Twitter / X URL</label>
                  <input 
                    type="url" 
                    name="twitter_url"
                    value={formData.twitter_url}
                    onChange={handleChange}
                    placeholder="https://twitter.com/example"
                    className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted block">Facebook URL</label>
                  <input 
                    type="url" 
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    placeholder="https://facebook.com/example"
                    className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-muted block">Instagram URL</label>
                  <input 
                    type="url" 
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleChange}
                    placeholder="https://instagram.com/example"
                    className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                  />
                </div>

              </div>
            </div>

          </div>
        )}

        {/* STEP 3: Hiring Preferences & Settings */}
        {currentStep === 3 && (
          <div className="fade-in space-y-6 animate-in duration-300">
            <div>
              <h2 className="type-h2 text-text">Step 3: Hiring Preferences & Settings</h2>
              <p className="type-label">Define departments, perks, invite team members, and toggle visibility configurations.</p>
            </div>

            {/* Hiring Departments Tag Input */}
            <div className="space-y-2">
              <label className="type-ui text-text font-medium block">Hiring Departments / Verticals</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={depInput} 
                  onChange={(e) => setDepInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("dept"))}
                  placeholder="e.g. Engineering, Product, HR"
                  className="flex-1 min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                />
                <button 
                  type="button" 
                  onClick={() => addTag("dept")}
                  className="min-h-[44px] px-4 bg-primary text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center font-medium"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="gap-2 flex flex-wrap pt-2">
                {hiringDepartments.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag("dept", idx)} className="text-primary hover:text-primary-dark">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Perks and benefits Tag Input */}
            <div className="space-y-2">
              <label className="type-ui text-text font-medium block">Perks and benefits Offered</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={perkInput} 
                  onChange={(e) => setPerkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("perk"))}
                  placeholder="e.g. Health Insurance, WFH Options, ESOPs"
                  className="flex-1 min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                />
                <button 
                  type="button" 
                  onClick={() => addTag("perk")}
                  className="min-h-[44px] px-4 bg-primary text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center font-medium"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="gap-2 flex flex-wrap pt-2">
                {perksBenefits.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 bg-company-accent/10 border border-company-accent/20 text-company-accent px-3 py-1 rounded-full text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag("perk", idx)} className="text-company-accent hover:text-company-accent">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Culture Tags */}
            <div className="space-y-2">
              <label className="type-ui text-text font-medium block">Culture Tags</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={cultureInput} 
                  onChange={(e) => setCultureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("culture"))}
                  placeholder="e.g. Remote-first, High-Growth, Collaborative"
                  className="flex-1 min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                />
                <button 
                  type="button" 
                  onClick={() => addTag("culture")}
                  className="min-h-[44px] px-4 bg-primary text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center font-medium"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="gap-2 flex flex-wrap pt-2">
                {cultureTags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag("culture", idx)} className="text-accent hover:text-accent">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Hiring Contact Email */}
            <div className="space-y-2">
              <label className="type-ui text-text font-medium block">Hiring Contact Email (optional, defaults to official email)</label>
              <input 
                type="email" 
                name="hiring_contact_email"
                value={formData.hiring_contact_email}
                onChange={handleChange}
                placeholder="e.g. careers@yourcompany.com"
                className="w-full min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
              />
            </div>

            {/* Team Invitations */}
            <div className="space-y-4 border-t pt-6 border-border">
              <h3 className="type-h3 text-text">Invite Team Members</h3>
              <p className="type-label -mt-2">Send invitations to coworkers to join this company workspace.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={inviteEmailInput} 
                  onChange={(e) => setInviteEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInvite())}
                  placeholder="e.g. colleague@yourcompany.com"
                  className="flex-1 min-h-[44px] border-border rounded-xl px-4 py-2 bg-bg outline-none border focus:ring-2 focus:ring-primary type-ui"
                />
                <button 
                  type="button" 
                  onClick={addInvite}
                  className="min-h-[44px] px-6 bg-primary text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center font-medium"
                >
                  Invite
                </button>
              </div>
              <div className="space-y-2 pt-2">
                {inviteEmails.map((email, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-bg rounded-xl px-4 py-2 border border-border">
                    <span className="text-xs text-text font-semibold">{email}</span>
                    <button type="button" onClick={() => removeInvite(idx)} className="text-error hover:text-error/85">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4 border-t pt-6 border-border">
              <h3 className="type-h3 text-text">Workspace Configurations</h3>
              
              <div className="space-y-4">
                <label className="flex gap-3 items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="profile_visibility"
                    checked={formData.profile_visibility}
                    onChange={handleCheckboxChange}
                    className="size-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm text-text font-semibold block">Public Profile Visibility</span>
                    <span className="text-xs text-muted">Allow job seekers to browse this company profile and see public fields.</span>
                  </div>
                </label>

                <label className="flex gap-3 items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="allow_candidate_messages"
                    checked={formData.allow_candidate_messages}
                    onChange={handleCheckboxChange}
                    className="size-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm text-text font-semibold block">Candidate Direct Messaging</span>
                    <span className="text-xs text-muted">Allow candidate to start direct messaging threads with company admins.</span>
                  </div>
                </label>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="fade-in space-y-8 animate-in duration-300">
            <div>
              <h2 className="type-h2 text-text">Step 4: Review Workspace Profile</h2>
              <p className="type-label">Ensure all information is accurate before submitting for administrator verification review.</p>
            </div>

            <div className="space-y-6">
              
              {/* Category 1: Legal details */}
              <div className="border border-border rounded-2xl p-6 bg-bg space-y-4">
                <h4 className="text-text type-ui font-bold border-b pb-2 border-border flex gap-2 items-center">
                  <ShieldCheck className="text-primary h-5 w-5" />
                  Legal & Verification Info
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted block text-xs uppercase font-semibold">Legal Name</span> <strong className="text-text">{formData.legal_name}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Entity Type</span> <strong className="text-text">{formData.company_type.toUpperCase().replace("_", " ")}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Company Registration Number</span> <strong className="text-text">{formData.registration_number}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Tax ID / VAT</span> <strong className="text-text">{formData.tax_id}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Official Email</span> <strong className="text-text">{formData.official_email}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Phone Number</span> <strong className="text-text">{formData.phone_number}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Authorized Signatory</span> <strong className="text-text">{formData.authorized_contact_name} ({formData.authorized_contact_designation})</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Country</span> <strong className="text-text">{formData.country}</strong></div>
                </div>
                <div className="pt-2">
                  <span className="text-muted block text-xs uppercase font-semibold mb-1">HQ Address</span>
                  <p className="text-text text-sm font-semibold">{formData.registered_address}</p>
                </div>
              </div>

              {/* Category 2: Public profile details */}
              <div className="border border-border rounded-2xl p-6 bg-bg space-y-4">
                <h4 className="text-text type-ui font-bold border-b pb-2 border-border flex gap-2 items-center">
                  <Building2 className="text-company-accent h-5 w-5" />
                  Public Profile details
                </h4>
                <div className="flex gap-4 items-center mb-4">
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo" className="size-14 rounded-xl border border-border object-cover" />
                  )}
                  <div>
                    <h5 className="text-text font-bold text-base">{formData.display_name}</h5>
                    <p className="text-xs text-muted">{formData.tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted block text-xs uppercase font-semibold">Website</span> <span className="text-text font-semibold truncate block">{formData.website_url || "None"}</span></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Headquarters</span> <strong className="text-text">{formData.headquarters_location}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Industry</span> <strong className="text-text">{formData.industry}</strong></div>
                  <div><span className="text-muted block text-xs uppercase font-semibold">Size</span> <strong className="text-text">{formData.company_size} Employees</strong></div>
                </div>
                {formData.about_description && (
                  <div className="pt-2">
                    <span className="text-muted block text-xs uppercase font-semibold mb-1">About Company</span>
                    <p className="text-text text-sm line-clamp-4">{formData.about_description}</p>
                  </div>
                )}
              </div>

              {/* Category 3: Hiring Info */}
              <div className="border border-border rounded-2xl p-6 bg-bg space-y-4">
                <h4 className="text-text type-ui font-bold border-b pb-2 border-border flex gap-2 items-center">
                  <FileText className="text-accent h-5 w-5" />
                  Hiring and settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted block text-xs uppercase font-semibold mb-1">Hiring Verticals</span>
                    <div className="gap-1.5 flex flex-wrap">
                      {hiringDepartments.map((tag, idx) => (
                        <span key={idx} className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">{tag}</span>
                      ))}
                      {hiringDepartments.length === 0 && <span className="text-xs text-muted font-medium">None added</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted block text-xs uppercase font-semibold mb-1">Perks and benefits</span>
                    <div className="gap-1.5 flex flex-wrap">
                      {perksBenefits.map((tag, idx) => (
                        <span key={idx} className="bg-company-accent/10 border border-company-accent/20 text-company-accent px-2.5 py-0.5 rounded-full text-xs font-semibold">{tag}</span>
                      ))}
                      {perksBenefits.length === 0 && <span className="text-xs text-muted font-medium">None added</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted block text-xs uppercase font-semibold mb-1">Team Invitations</span>
                    <p className="text-text text-sm font-semibold">
                      {inviteEmails.length > 0 ? `${inviteEmails.length} invitations will be sent.` : "No invitations pending."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Button Controls */}
      <div className="flex justify-between items-center bg-surface border border-border rounded-3xl p-6 shadow-sm">
        <button 
          type="button" 
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className="min-h-[44px] px-6 rounded-xl border border-border hover:bg-bg transition-all type-ui font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < 4 ? (
          <button 
            type="button" 
            onClick={handleNext}
            className="min-h-[44px] px-6 rounded-xl bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all type-ui font-semibold"
          >
            Continue
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-h-[44px] px-8 rounded-xl bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all type-ui font-semibold disabled:opacity-75 flex gap-2 items-center"
          >
            {isSubmitting ? (
              <>
                <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Submitting...
              </>
            ) : (
              "Submit for Verification"
            )}
          </button>
        )}
      </div>

    </div>
  );
}
