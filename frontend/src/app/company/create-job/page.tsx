"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCompanyProfileAction } from "@/features/auth/actions";
import { createJobAction, updateJobAction } from "@/features/company/actions";
import { getJobDetailAction } from "@/features/auth/jobActions";
import { toast } from "react-hot-toast";
import Button from "@/shared/ui/Button";
import { 
  Network, 
  Briefcase, 
  PlusCircle, 
  ChevronRight, 
  MapPin, 
  Clock, 
  BriefcaseBusiness, 
  CheckCircle2, 
  FileText,
  ChevronLeft,
  X,
  Plus
} from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardSuccess, setWizardSuccess] = useState(false);
  const [successJobId, setSuccessJobId] = useState<string | null>(null);

  // Step Form Fields
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "Engineering",
    location: "Remote",
    workMode: "Remote" as "Remote" | "Hybrid" | "Onsite",
    employmentType: "Full-time",
    skills: [] as string[],
    newSkillInput: "",
    experience: 3,
    education: "Bachelor's Degree",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    noticePeriod: "Immediate",
    aboutCompany: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    deadline: "",
    openings: 1,
    resumeRequired: true,
    coverLetterOptional: true,
    autoClose: false
  });

  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const loadJobDetails = async (jobId: string, isDuplicate = false) => {
    setLoading(true);
    const res = await getJobDetailAction(jobId);
    if (res.error) {
      toast.error(res.error);
    } else {
      const desc = res.description || "";
      const reqsText = res.requirements || "";
      
      let parsedReqs: any = {};
      try {
        if (reqsText.startsWith("{")) {
          parsedReqs = JSON.parse(reqsText);
        }
      } catch {
        // Ignored
      }

      const extractSection = (header: string) => {
        const match = desc.match(new RegExp(`### ${header}\\n([\\s\\S]*?)(?:\\n###|\\n---|$)`));
        return match ? match[1].trim() : "";
      };

      setJobForm({
        title: res.title || "",
        department: parsedReqs.department || "Engineering",
        location: res.location?.name || res.raw_location || "",
        workMode: (desc.match(/Work Mode:\s*(Remote|Hybrid|Onsite)/)?.[1] as any) || "Remote",
        employmentType: res.employment_type || "Full-time",
        skills: parsedReqs.skills || [],
        newSkillInput: "",
        experience: Number(res.experience_required || 3),
        education: parsedReqs.education || "Bachelor's Degree",
        salaryMin: res.salary_min ? res.salary_min.toString() : "",
        salaryMax: res.salary_max ? res.salary_max.toString() : "",
        currency: res.currency || "USD",
        noticePeriod: parsedReqs.noticePeriod || "Immediate",
        aboutCompany: extractSection("About Company") || res.company?.description || "",
        responsibilities: extractSection("Responsibilities") || "",
        requirements: extractSection("Requirements") || "",
        benefits: extractSection("Benefits") || "",
        deadline: parsedReqs.deadline || "",
        openings: parsedReqs.openings || 1,
        resumeRequired: parsedReqs.resumeRequired !== false,
        coverLetterOptional: parsedReqs.coverLetterOptional !== false,
        autoClose: desc.includes("Auto Close: Yes")
      });

      if (!isDuplicate) {
        setEditingJobId(jobId);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadCompanyProfile = async () => {
      const profileData = await getCompanyProfileAction();
      if (!profileData.error) {
        setProfile(profileData);
        if (profileData.description) {
          setJobForm(prev => ({ ...prev, aboutCompany: profileData.description }));
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("id");
      const duplicateId = searchParams.get("duplicateId");
      if (id) {
        await loadJobDetails(id, false);
      } else if (duplicateId) {
        await loadJobDetails(duplicateId, true);
      }
    };
    loadCompanyProfile();
  }, []);

  const addSkillTag = () => {
    const val = jobForm.newSkillInput.trim();
    if (val && !jobForm.skills.includes(val)) {
      setJobForm({
        ...jobForm,
        skills: [...jobForm.skills, val],
        newSkillInput: ""
      });
    }
  };

  const removeSkillTag = (tag: string) => {
    setJobForm({
      ...jobForm,
      skills: jobForm.skills.filter(s => s !== tag)
    });
  };

  const handleWizardSubmit = async (status: "OPEN" | "DRAFT") => {
    const formattedDescription = `
### About Company
${jobForm.aboutCompany || "Not specified."}

### Responsibilities
${jobForm.responsibilities || "Not specified."}

### Requirements
${jobForm.requirements || "Not specified."}

### Benefits
${jobForm.benefits || "Not specified."}

---
Department: ${jobForm.department}
Work Mode: ${jobForm.workMode}
Notice Period: ${jobForm.noticePeriod}
Deadline: ${jobForm.deadline || "None"}
Openings: ${jobForm.openings}
Auto Close: ${jobForm.autoClose ? "Yes" : "No"}
Resume Required: ${jobForm.resumeRequired ? "Yes" : "No"}
Cover Letter Optional: ${jobForm.coverLetterOptional ? "Yes" : "No"}
`.trim();

    const structuredRequirements = JSON.stringify({
      education: jobForm.education,
      noticePeriod: jobForm.noticePeriod,
      openings: jobForm.openings,
      deadline: jobForm.deadline,
      resumeRequired: jobForm.resumeRequired,
      coverLetterOptional: jobForm.coverLetterOptional,
      skills: jobForm.skills
    });

    const payload = {
      title: jobForm.title,
      description: formattedDescription,
      requirements: structuredRequirements,
      location: jobForm.location,
      employment_type: jobForm.employmentType,
      experience_required: jobForm.experience.toString(),
      salary_min: jobForm.salaryMin ? parseFloat(jobForm.salaryMin) : undefined,
      salary_max: jobForm.salaryMax ? parseFloat(jobForm.salaryMax) : undefined,
      skills: jobForm.skills,
      currency: jobForm.currency,
      status: status
    };

    setLoading(true);
    let res;
    if (editingJobId) {
      res = await updateJobAction(editingJobId, payload as any);
    } else {
      res = await createJobAction(payload);
    }

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success(editingJobId ? "Job requisition updated successfully!" : (status === "OPEN" ? "New job published live!" : "Job draft saved successfully!"));
      setSuccessJobId(res.data?.id || editingJobId);
      if (status === "OPEN") {
        setWizardSuccess(true);
      } else {
        // Redirection or close
        setTimeout(() => {
          window.close();
        }, 1500);
      }
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm("Cancel job creation? Unsaved inputs will be lost.")) {
      window.close();
    }
  };

  if (wizardSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-left">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="size-20 mx-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Requisition Live!</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your job post is live and the matching engine is scanning the candidate pool for matching candidates.
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Button
              onClick={() => window.close()}
              variant="primary"
              className="w-full h-11 rounded-xl text-xs font-bold font-sans text-center items-center justify-center flex"
            >
              Close Window
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors font-sans text-left">
      {/* Premium Flow Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-xl text-white p-2 shadow-md shadow-primary/20">
              <Network size={20} />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">JobLyne</span>
              <span className="text-[9px] text-primary uppercase font-bold tracking-widest block -mt-0.5">Wizard Requisition</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="size-8 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main Form container wrapper */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col">
          
          {/* Step Indicator Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800/60">
            {[
              { step: 1, label: "Info" },
              { step: 2, label: "Prereqs" },
              { step: 3, label: "Details" },
              { step: 4, label: "Settings" },
              { step: 5, label: "Preview" }
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className={`size-8 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                  wizardStep === item.step
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : wizardStep > item.step
                      ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/50"
                      : "bg-slate-950 text-slate-500 border border-slate-800"
                }`}>
                  {wizardStep > item.step ? "✓" : item.step}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest hidden sm:inline-block ${
                  wizardStep === item.step ? "text-primary" : "text-slate-500"
                }`}>
                  {item.label}
                </span>
                {item.step < 5 && <ChevronRight size={14} className="text-slate-700 hidden sm:inline-block" />}
              </div>
            ))}
          </div>

          {/* Form Area */}
          <div className="min-h-[350px] mb-8">
            {/* STEP 1: Basic Information */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Job Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Lead Full-Stack Engineer (React / Python)"
                    className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Department</label>
                    <select
                      value={jobForm.department}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-white"
                    >
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Product</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>Operations</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Employment Type</label>
                    <select
                      value={jobForm.employmentType}
                      onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-white"
                    >
                      <option>Full-time</option>
                      <option>Contract</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Location (HQ / City)</label>
                    <input
                      type="text"
                      required
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA / Remote"
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white placeholder-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Work Mode</label>
                    <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                      {(["Remote", "Hybrid", "Onsite"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setJobForm({ ...jobForm, workMode: mode })}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            jobForm.workMode === mode
                              ? "bg-primary text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Requirements */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Skills Required</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={jobForm.newSkillInput}
                      onChange={(e) => setJobForm({ ...jobForm, newSkillInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkillTag();
                        }
                      }}
                      placeholder="Type skill tag (e.g. Python) and press Enter or Add..."
                      className="flex-1 h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white placeholder-slate-600"
                    />
                    <button
                      type="button"
                      onClick={addSkillTag}
                      className="px-4 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Skill tag list rendering */}
                  <div className="flex flex-wrap gap-1.5 mt-2 font-semibold">
                    {jobForm.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg text-xs font-bold">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillTag(skill)}
                          className="text-primary hover:text-red-500 font-bold ml-1 text-xs shrink-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {jobForm.skills.length === 0 && (
                      <span className="text-xs text-slate-500 italic font-medium">No skill tags added yet. Added tags appear here.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Experience Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <label htmlFor="wizard-exp-slider" className="uppercase">Experience Needed</label>
                      <span className="text-primary">{jobForm.experience} Years+</span>
                    </div>
                    <input
                      id="wizard-exp-slider"
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={jobForm.experience}
                      onChange={(e) => setJobForm({ ...jobForm, experience: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-primary mt-3"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Entry level (0 yrs)</span>
                      <span>15+ yrs</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Notice Period</label>
                    <select
                      value={jobForm.noticePeriod}
                      onChange={(e) => setJobForm({ ...jobForm, noticePeriod: e.target.value })}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-white"
                    >
                      <option>Immediate</option>
                      <option>15 Days</option>
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Min Salary <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={jobForm.salaryMin}
                      onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                      placeholder="e.g. 110000"
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white placeholder-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Max Salary <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={jobForm.salaryMax}
                      onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                      placeholder="e.g. 140000"
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white placeholder-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Currency</label>
                    <select
                      value={jobForm.currency}
                      onChange={(e) => setJobForm({ ...jobForm, currency: e.target.value })}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Description Details */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex gap-2">
                  <FileText className="text-primary shrink-0" size={16} />
                  <span>Fill the core description sections. They will render automatically as clean JDs for candidates.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">About Company Description</label>
                    <textarea
                      rows={6}
                      value={jobForm.aboutCompany}
                      onChange={(e) => setJobForm({ ...jobForm, aboutCompany: e.target.value })}
                      placeholder="Enter short details of culture, product, stack..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Job Responsibilities</label>
                    <textarea
                      rows={6}
                      value={jobForm.responsibilities}
                      onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                      placeholder="e.g. - Architect and deliver highly scalable UI components..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Requirements & Prerequisites</label>
                    <textarea
                      rows={6}
                      value={jobForm.requirements}
                      onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                      placeholder="e.g. - 3+ years experience with React/Next.js..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Benefits & Offers</label>
                    <textarea
                      rows={6}
                      value={jobForm.benefits}
                      onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                      placeholder="e.g. - Unlimited PTO, premium health insurance, remote stipend..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Application Settings */}
            {wizardStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Application Deadline</label>
                    <input
                      type="date"
                      value={jobForm.deadline}
                      onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Number of Openings</label>
                    <input
                      type="number"
                      min={1}
                      value={jobForm.openings}
                      onChange={(e) => setJobForm({ ...jobForm, openings: Number(e.target.value) })}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-primary text-xs text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <hr className="border-slate-800" />

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Application Constraints</h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={jobForm.resumeRequired}
                        onChange={(e) => setJobForm({ ...jobForm, resumeRequired: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Candidate Resume Required</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Force candidate uploads before letting them apply.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={jobForm.coverLetterOptional}
                        onChange={(e) => setJobForm({ ...jobForm, coverLetterOptional: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Cover Letter Optional</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Let candidates provide brief notes in their submit form.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={jobForm.autoClose}
                        onChange={(e) => setJobForm({ ...jobForm, autoClose: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Auto Close Position</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Automatically close listings when target opening limit is reached.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: High-fidelity Candidate Preview */}
            {wizardStep === 5 && (
              <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 border border-slate-800 p-6 rounded-2xl bg-slate-950/40 text-left animate-in fade-in duration-300">
                <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
                  <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 font-bold">
                    <BriefcaseBusiness size={28} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-xl font-extrabold text-white leading-snug">{jobForm.title || "Job Title"}</h3>
                    <div className="flex gap-2.5 items-center text-xs text-slate-400 flex-wrap font-medium">
                      <span>{profile?.name || "Your Company Name"}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {jobForm.location} ({jobForm.workMode})</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {jobForm.employmentType}</span>
                    </div>
                  </div>
                </div>

                {/* Salary Bracket Banner */}
                <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Candidate Match Score</span>
                    <span className="text-xs text-primary font-semibold mt-0.5 block">Estimated Fit Analysis Vetted</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Expected Salary</span>
                    <span className="text-sm text-emerald-400 font-bold block mt-0.5">
                      {jobForm.salaryMin ? `${jobForm.currency} ${Number(jobForm.salaryMin).toLocaleString()} - ${Number(jobForm.salaryMax).toLocaleString()}` : "Negotiable"}
                    </span>
                  </div>
                </div>

                {/* JDs Sections */}
                <div className="space-y-5 text-xs leading-relaxed text-slate-300 font-medium">
                  {jobForm.aboutCompany && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">About Company</h4>
                      <p className="whitespace-pre-line leading-relaxed">{jobForm.aboutCompany}</p>
                    </div>
                  )}
                  
                  {jobForm.responsibilities && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Responsibilities</h4>
                      <p className="whitespace-pre-line leading-relaxed">{jobForm.responsibilities}</p>
                    </div>
                  )}

                  {jobForm.requirements && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Prerequisites & Requirements</h4>
                      <p className="whitespace-pre-line leading-relaxed">{jobForm.requirements}</p>
                    </div>
                  )}

                  {jobForm.benefits && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Benefits & Offers</h4>
                      <p className="whitespace-pre-line leading-relaxed">{jobForm.benefits}</p>
                    </div>
                  )}
                </div>

                {/* Skills required tags */}
                {jobForm.skills.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-800 font-semibold">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-sans">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {jobForm.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400 rounded-lg uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Navigation Bar */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800/80">
            <div>
              {wizardStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="gap-1.5 flex items-center min-h-[44px] px-5 rounded-xl text-xs font-bold"
                >
                  <ChevronLeft size={14} /> Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleWizardSubmit("DRAFT")}
                className="min-h-[44px] px-5 rounded-xl text-xs font-bold"
                disabled={loading}
              >
                Save Draft
              </Button>

              {wizardStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (wizardStep === 1 && !jobForm.title) {
                      toast.error("Please enter a Job Title");
                      return;
                    }
                    if (wizardStep === 2 && (!jobForm.salaryMin || !jobForm.salaryMax)) {
                      toast.error("Please specify a Salary Range");
                      return;
                    }
                    setWizardStep(prev => prev + 1);
                  }}
                  className="min-h-[44px] px-5 rounded-xl text-xs font-bold"
                >
                  Continue <ChevronRight size={14} />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleWizardSubmit("OPEN")}
                  className="min-h-[44px] px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 border-none text-center items-center justify-center flex"
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish Job"}
                </Button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
