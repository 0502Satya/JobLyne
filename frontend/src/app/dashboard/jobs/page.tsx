"use client";

import React, { useEffect, useState, useTransition } from "react";
import { 
  getJobsAction, 
  applyToJobAction, 
  saveJobAction, 
  unsaveJobAction, 
  getCandidateProfileAction, 
  updateCandidateProfileAction 
} from "@/features/auth/actions";
import { toast } from "react-hot-toast";

/**
 * High-fidelity, real-time Job Search & AI Skill-Matching Dashboard.
 * Replaces the static 'Coming Soon' placeholder.
 */
export default function SearchJobPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Active filters & search terms
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("All"); // All, Entry, Mid, Senior
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<string[]>([]);
  const [matchThreshold, setMatchThreshold] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"recent" | "match">("recent");

  // UX states
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);

  // Load initial candidate profile & job list
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const profileData = await getCandidateProfileAction();
        if (profileData && !profileData.error) {
          setProfile(profileData);
        }

        const jobsData = await getJobsAction();
        if (jobsData && !jobsData.error) {
          setJobs(Array.isArray(jobsData) ? jobsData : (jobsData.results || []));
        }
      } catch (err) {
        console.error("Failed to initialize jobs data:", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Fetch jobs dynamically based on primary search query & location keywords
  const handleKeywordSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getJobsAction({ 
        query: searchQuery, 
        location: locationQuery 
      });
      if (data && !data.error) {
        setJobs(Array.isArray(data) ? data : (data.results || []));
      } else {
        setJobs([]);
      }
    } catch (err) {
      toast.error("Failed to reload jobs");
    } finally {
      setLoading(false);
    }
  };

  // Reset all search states
  const handleResetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setExperienceLevel("All");
    setSalaryMin("");
    setSalaryMax("");
    setSelectedEmpTypes([]);
    setMatchThreshold(0);
    setSortBy("recent");
    // Reload unmodified job stream
    startTransition(async () => {
      setLoading(true);
      const data = await getJobsAction();
      if (data && !data.error) {
        setJobs(Array.isArray(data) ? data : (data.results || []));
      }
      setLoading(false);
    });
  };

  // Toggle employment type checkboxes
  const handleEmpTypeToggle = (type: string) => {
    setSelectedEmpTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Apply real-time client-side filter and sorting logic on the loaded jobs
  const filteredAndSortedJobs = React.useMemo(() => {
    let result = [...jobs];

    // 1. Employment Type filter
    if (selectedEmpTypes.length > 0) {
      result = result.filter(job => 
        selectedEmpTypes.some(type => 
          job.employment_type?.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // 2. Experience Level filter
    if (experienceLevel !== "All") {
      result = result.filter(job => {
        const req = job.experience_required ?? 0;
        if (experienceLevel === "Entry") return req <= 1;
        if (experienceLevel === "Mid") return req > 1 && req <= 4;
        if (experienceLevel === "Senior") return req >= 5;
        return true;
      });
    }

    // 3. Salary Range filter
    if (salaryMin) {
      result = result.filter(job => Number(job.salary_max ?? 9999999) >= Number(salaryMin));
    }
    if (salaryMax) {
      result = result.filter(job => Number(job.salary_min ?? 0) <= Number(salaryMax));
    }

    // 4. Match Score Threshold
    if (matchThreshold > 0) {
      result = result.filter(job => (job.match_score ?? 60) >= matchThreshold);
    }

    // 5. Sorting
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
    } else if (sortBy === "match") {
      result.sort((a, b) => (b.match_score ?? 60) - (a.match_score ?? 60));
    }

    return result;
  }, [jobs, selectedEmpTypes, experienceLevel, salaryMin, salaryMax, matchThreshold, sortBy]);

  // Handle direct job bookmarking
  const handleToggleSave = async (e: React.MouseEvent, job: any) => {
    e.stopPropagation();
    setSavingId(job.id);
    try {
      if (job.is_saved) {
        const res = await unsaveJobAction(job.id);
        if (!res.error) {
          toast.success("Removed from saved list");
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: false } : j));
          if (selectedJob?.id === job.id) {
            setSelectedJob((prev: any) => ({ ...prev, is_saved: false }));
          }
        }
      } else {
        const res = await saveJobAction(job.id);
        if (!res.error) {
          toast.success("Opportunity bookmarked!");
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: true } : j));
          if (selectedJob?.id === job.id) {
            setSelectedJob((prev: any) => ({ ...prev, is_saved: true }));
          }
        }
      }
    } catch (err) {
      toast.error("Failed to bookmark job");
    } finally {
      setSavingId(null);
    }
  };

  // Submit job application
  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      const res = await applyToJobAction(jobId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Application submitted successfully!");
        setSelectedJob((prev: any) => prev ? { ...prev, has_applied: true } : null);
      }
    } catch (err) {
      toast.error("Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  // Dynamically add a missing skill to the candidate profile and recalculate match score optimistically
  const handleAddSkill = async (skillName: string) => {
    if (!profile) return;
    setUpdatingSkill(skillName);
    
    // Optimistic profile update locally
    const currentSkills = profile.skills || [];
    const updatedSkills = [...new Set([...currentSkills, skillName])];
    
    const originalProfile = { ...profile };
    setProfile((prev: any) => ({ ...prev, skills: updatedSkills }));
    
    try {
      const res = await updateCandidateProfileAction({ skills: updatedSkills });
      if (res.error) {
        toast.error(res.error);
        setProfile(originalProfile); // Rollback
      } else {
        toast.success(`"${skillName}" successfully added to your profile!`);
        
        // Dynamically recalculate match score of the currently selected job optimistically
        if (selectedJob) {
          const reqSkills = selectedJob.skills || [];
          const candidateSkillsSet = new Set(updatedSkills.map(s => s.toLowerCase()));
          
          let newScore = 60;
          if (reqSkills.length > 0) {
            const overlap = reqSkills.filter((s: string) => candidateSkillsSet.has(s.toLowerCase()));
            newScore = Math.round((overlap.length / reqSkills.length) * 100);
          }
          
          setSelectedJob((prev: any) => ({ ...prev, match_score: Math.min(Math.max(newScore, 0), 100) }));
          setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, match_score: Math.min(Math.max(newScore, 0), 100) } : j));
        }
      }
    } catch (err) {
      toast.error("Failed to add skill");
      setProfile(originalProfile);
    } finally {
      setUpdatingSkill(null);
    }
  };

  // Partition skills into matching vs missing
  const skillAnalysis = React.useMemo(() => {
    if (!selectedJob) return { matching: [], missing: [], percentage: 0 };
    const jobSkills = selectedJob.skills || [];
    const candidateSkills = new Set((profile?.skills || []).map((s: string) => s.toLowerCase()));
    
    const matching = jobSkills.filter((s: string) => candidateSkills.has(s.toLowerCase()));
    const missing = jobSkills.filter((s: string) => !candidateSkills.has(s.toLowerCase()));
    
    const percentage = jobSkills.length > 0 
      ? Math.round((matching.length / jobSkills.length) * 100) 
      : 60;
      
    return { matching, missing, percentage };
  }, [selectedJob, profile]);

  return (
    <div className="flex flex-col gap-6 text-text w-full max-w-full box-sizing-border-box overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-text flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">explore</span>
            Discover Opportunities
          </h2>
          <p className="text-muted font-medium mt-1">Intelligent career matching and high-fidelity sourcing feeds.</p>
        </div>
        
        {/* Sort & Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-border/20 p-1 border border-border/40">
            <button 
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${sortBy === "recent" ? "bg-primary text-surface shadow" : "text-muted hover:text-text"}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setSortBy("match")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${sortBy === "match" ? "bg-primary text-surface shadow animate-pulse" : "text-muted hover:text-text"}`}
            >
              Best Match
            </button>
          </div>
          
          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center justify-center gap-1.5 bg-surface border border-border/60 hover:border-primary/60 px-4 py-2.5 rounded-xl transition-all font-bold text-xs min-h-[44px]"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            Filters
          </button>
        </div>
      </div>

      {/* Main Grid Block */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start w-full">
        
        {/* Sidebar Filters - Desktop (Sticky) */}
        <aside className="hidden lg:flex lg:flex-col bg-surface border border-border/60 rounded-2xl p-6 gap-6 sticky top-[85px] max-w-full">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <h3 className="font-black text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">tune</span>
              Advanced Filters
            </h3>
            <button 
              onClick={handleResetFilters}
              disabled={isPending}
              className="text-xs font-bold text-primary hover:underline"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleKeywordSearch} className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Keywords</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Role, title, or skill..." 
                  className="w-full bg-bg border border-border/60 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
                <span className="material-symbols-outlined text-muted absolute left-3 top-3 text-lg">search</span>
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-muted hover:text-text"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* City/Location Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">City or Location</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="e.g. San Francisco, Remote" 
                  className="w-full bg-bg border border-border/60 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
                <span className="material-symbols-outlined text-muted absolute left-3 top-3 text-lg">pin_drop</span>
                {locationQuery && (
                  <button 
                    type="button" 
                    onClick={() => setLocationQuery("")}
                    className="absolute right-3 top-3 text-muted hover:text-text"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="bg-primary text-surface font-bold text-xs py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 w-full min-h-[48px] shadow"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Apply Keywords
            </button>
          </form>

          {/* Employment Type Multi-Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Employment Type</label>
            <div className="flex flex-col gap-2">
              {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map(type => (
                <label key={type} className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedEmpTypes.includes(type)}
                    onChange={() => handleEmpTypeToggle(type)}
                    className="accent-primary w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="group-hover:text-primary transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Required Range Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {["All", "Entry", "Mid", "Senior"].map(level => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${experienceLevel === level ? "bg-primary/10 border-primary text-primary" : "border-border/60 bg-bg text-muted hover:text-text"}`}
                >
                  {level === "Entry" ? "0-1 Years" : level === "Mid" ? "2-4 Years" : level === "Senior" ? "5+ Years" : "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Salary Bounds Limits */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Expected Salary Range</label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-bg border border-border/60 rounded-xl py-2 px-3 text-xs focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
              <span className="text-muted text-xs font-bold">to</span>
              <div className="relative flex-1">
                <input 
                  type="number" 
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-bg border border-border/60 rounded-xl py-2 px-3 text-xs focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Match Score Threshold */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-muted uppercase tracking-wider">Min Match Score</span>
              <span className="text-primary">{matchThreshold}%+</span>
            </div>
            <input 
              type="range" 
              min="0"
              max="95"
              step="5"
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(Number(e.target.value))}
              className="accent-primary w-full cursor-pointer h-1.5 bg-border/40 rounded-lg appearance-none"
            />
          </div>
        </aside>

        {/* Results Feed Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full max-w-full">
          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-surface rounded-2xl animate-pulse border border-border shadow-sm"></div>
              ))}
            </div>
          ) : filteredAndSortedJobs.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="text-xs text-muted font-bold pl-1 uppercase tracking-widest">
                Showing {filteredAndSortedJobs.length} matches found
              </div>
              
              {filteredAndSortedJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const matchVal = job.match_score ?? 60;
                
                return (
                  <div 
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-surface border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4 group ${isSelected ? "border-primary ring-2 ring-primary/10 shadow-lg translate-x-1" : "border-border/60 hover:border-primary/40"}`}
                  >
                    {/* Header line */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className="h-14 w-14 rounded-xl bg-bg border border-border/40 flex items-center justify-center p-2.5 shrink-0 group-hover:scale-105 transition-transform">
                          {job.company_logo ? (
                            <img src={job.company_logo} alt={job.company_name} className="h-full w-full object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-3xl text-primary font-bold">work</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-text group-hover:text-primary transition-colors leading-tight line-clamp-1">{job.title}</h4>
                          <p className="text-muted text-sm font-semibold mt-0.5">{job.company_name} • {job.location}</p>
                        </div>
                      </div>
                      
                      {/* Bookmark Button */}
                      <button 
                        onClick={(e) => handleToggleSave(e, job)}
                        disabled={savingId === job.id}
                        className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${job.is_saved ? "bg-primary/10 text-primary" : "bg-bg text-muted hover:text-primary hover:bg-primary/5"} shrink-0`}
                        aria-label="Bookmark job"
                      >
                        <span className={`material-symbols-outlined text-xl ${job.is_saved ? "filled" : ""}`}>
                          {job.is_saved ? "bookmark" : "bookmark_add"}
                        </span>
                      </button>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-muted/80 text-sm leading-relaxed line-clamp-2">
                      {job.description || "No description provided. Click to view matching analysis details."}
                    </p>

                    {/* Skill tags & salary info */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {job.skills && job.skills.length > 0 ? (
                        job.skills.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="px-2.5 py-1 rounded-lg bg-bg text-muted text-xs font-bold border border-border/30">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-bg text-muted text-xs font-bold border border-border/30">
                          General
                        </span>
                      )}
                      
                      {job.salary_min && (
                        <span className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 text-xs font-black ml-auto border border-green-200/30">
                          {job.currency}{job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Meta section */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Posted {new Date(job.posted_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Match Indicator Pill */}
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${matchVal >= 80 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200/40" : "bg-primary/10 text-primary border border-primary/20"}`}>
                          <span className="material-symbols-outlined text-sm leading-none filled">auto_awesome</span>
                          {matchVal}% Match
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center bg-surface border border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-border/20 rounded-full text-muted">
                <span className="material-symbols-outlined text-5xl">search_off</span>
              </div>
              <div>
                <p className="text-text font-black text-lg">No matching listings found</p>
                <p className="text-muted text-sm mt-1 max-w-sm">Try resetting your filters or adjusting your search queries to see more active listings.</p>
              </div>
              <button 
                onClick={handleResetFilters}
                className="mt-2 bg-primary text-surface font-bold text-xs px-6 py-3 rounded-xl hover:opacity-90 transition-opacity min-h-[48px]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Interactive Detail Drawer Component */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          {/* Dismissal Backdrop */}
          <div className="absolute inset-0" onClick={() => setSelectedJob(null)}></div>
          
          {/* Main Slide-in Drawer Container */}
          <div className="relative w-full max-w-2xl bg-surface border-l border-border h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 max-h-full overflow-hidden">
            
            {/* Header Block */}
            <div className="p-6 border-b border-border/60 flex items-center justify-between bg-bg/40">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-xl bg-bg border border-border/40 flex items-center justify-center p-2">
                  {selectedJob.company_logo ? (
                    <img src={selectedJob.company_logo} alt={selectedJob.company_name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-primary font-bold">work</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-text line-clamp-1">{selectedJob.title}</h3>
                  <p className="text-muted text-sm font-semibold">{selectedJob.company_name} • {selectedJob.location}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedJob(null)}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-bg hover:bg-border/20 text-muted hover:text-text transition-colors"
                aria-label="Close details"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable details body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              {/* Score Meter & Match Analysis Grid */}
              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                    {/* SVG circular progress */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-border/10 fill-none" strokeWidth="6" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        className="stroke-primary fill-none transition-all duration-1000" 
                        strokeWidth="6" 
                        strokeDasharray={213.6}
                        strokeDashoffset={213.6 - (213.6 * (selectedJob.match_score ?? 60)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-black text-lg text-primary">
                      {selectedJob.match_score ?? 60}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-text flex items-center gap-1">
                      AI Career Score
                    </h4>
                    <p className="text-muted text-xs font-semibold mt-0.5">Based on skill overlaps and profile relevance constraints.</p>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right sm:items-end">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">Salary Range</span>
                  <span className="text-lg font-black text-green-700 dark:text-green-400 mt-1">
                    {selectedJob.salary_min ? `${selectedJob.currency}${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max?.toLocaleString()}` : "Not Disclosed"}
                  </span>
                </div>
              </div>

              {/* Description Segment */}
              <div className="flex flex-col gap-2.5">
                <h4 className="font-black text-base uppercase tracking-wider text-muted flex items-center gap-2">
                  <span className="material-symbols-outlined text-muted text-lg">description</span>
                  Job Description
                </h4>
                <p className="text-text/90 text-sm leading-relaxed whitespace-pre-line bg-bg/20 rounded-xl p-4 border border-border/30">
                  {selectedJob.description || "No description provided."}
                </p>
              </div>

              {/* Dynamic AI Skill Match Section */}
              <div className="flex flex-col gap-4 border-t border-border/40 pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base uppercase tracking-wider text-muted flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg leading-none">auto_awesome</span>
                    Required Skills Breakdown
                  </h4>
                  <span className="text-xs text-muted font-bold">
                    {skillAnalysis.matching.length} of {selectedJob.skills?.length || 0} matching
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Matching section */}
                  {skillAnalysis.matching.length > 0 && (
                    <div className="flex flex-col gap-2 bg-green-50/20 dark:bg-green-900/5 border border-green-200/30 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xs font-black uppercase tracking-wider">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Your matching qualifications
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skillAnalysis.matching.map((skill: string) => (
                          <span key={skill} className="px-2.5 py-1 text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-1.5 border border-green-200/40">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing section */}
                  {skillAnalysis.missing.length > 0 ? (
                    <div className="flex flex-col gap-2 bg-amber-50/20 dark:bg-amber-900/5 border border-amber-200/30 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
                        <span className="material-symbols-outlined text-base">bolt</span>
                        Recommended skills to add
                      </div>
                      <p className="text-muted text-xs font-semibold">Adding these skills will instantly boost your match ratio and increase visibility.</p>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skillAnalysis.missing.map((skill: string) => (
                          <button
                            key={skill}
                            onClick={() => handleAddSkill(skill)}
                            disabled={updatingSkill !== null}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 rounded-lg flex items-center gap-1.5 border border-amber-300/40 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all cursor-pointer min-h-[36px]"
                          >
                            {updatingSkill === skill ? (
                              <span className="inline-block animate-spin h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full mr-1"></span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">add_circle</span>
                            )}
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-100/20 border border-green-200/30 p-4 rounded-xl text-center text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">verified</span>
                      <span>Outstanding! You satisfy 100% of the requested skill criteria.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements text */}
              {selectedJob.requirements && (
                <div className="flex flex-col gap-2.5 border-t border-border/40 pt-6">
                  <h4 className="font-black text-base uppercase tracking-wider text-muted flex items-center gap-2">
                    <span className="material-symbols-outlined text-muted text-lg">fact_check</span>
                    Prerequisites & Expectations
                  </h4>
                  <p className="text-text/80 text-sm leading-relaxed whitespace-pre-line bg-bg/20 rounded-xl p-4 border border-border/30">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions Frame */}
            <div className="p-6 border-t border-border/60 bg-bg/40 flex items-center justify-between gap-4">
              <button 
                onClick={(e) => handleToggleSave(e, selectedJob)}
                disabled={savingId !== null}
                className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border min-h-[48px] ${selectedJob.is_saved ? "bg-primary/10 border-primary text-primary" : "border-border/60 hover:bg-bg text-muted"}`}
              >
                <span className="material-symbols-outlined text-sm leading-none filled">{selectedJob.is_saved ? "bookmark" : "bookmark_add"}</span>
                {selectedJob.is_saved ? "Bookmarked" : "Save Job"}
              </button>

              {selectedJob.has_applied ? (
                <button 
                  disabled
                  className="bg-green-500/25 border border-green-500/30 text-green-700 dark:text-green-400 font-bold text-sm px-8 py-3 rounded-xl flex items-center gap-1.5 min-h-[48px]"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Applied
                </button>
              ) : (
                <button 
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applyingId !== null}
                  className="bg-primary text-surface font-black text-sm px-8 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 min-h-[48px] shadow"
                >
                  {applyingId === selectedJob.id ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-surface border-t-transparent rounded-full"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">rocket_launch</span>
                      Apply to Opportunity
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Drawer / Modal - Mobile Filters overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)}></div>
          
          <div className="relative w-full max-h-[85vh] bg-surface rounded-t-3xl shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-w-lg">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                Filter Options
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={handleResetFilters} className="text-xs font-bold text-primary">Reset</button>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-bg hover:bg-border/20 text-muted"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Keyword fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Search terms</label>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Role, skill, keywords..." 
                  className="w-full bg-bg border border-border/60 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">City or region</label>
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="e.g. Remote, Dallas" 
                  className="w-full bg-bg border border-border/60 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Employment Types */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Employment Types</label>
              <div className="flex flex-wrap gap-2">
                {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map(type => {
                  const isChecked = selectedEmpTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleEmpTypeToggle(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isChecked ? "bg-primary text-surface border-primary" : "border-border/60 bg-bg text-muted"}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Experience Level</label>
              <div className="grid grid-cols-4 gap-2">
                {["All", "Entry", "Mid", "Senior"].map(level => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${experienceLevel === level ? "bg-primary/10 border-primary text-primary" : "border-border/60 bg-bg text-muted"}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary bounds */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Expected Salary bounds</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className="flex-1 bg-bg border border-border/60 rounded-xl py-2 px-3 text-xs focus:border-primary focus:outline-none min-h-[44px]"
                />
                <span className="text-muted text-xs font-bold">to</span>
                <input 
                  type="number" 
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className="flex-1 bg-bg border border-border/60 rounded-xl py-2 px-3 text-xs focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Score slide slider */}
            <div className="flex flex-col gap-2 pb-4">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted uppercase tracking-wider">Min Match Score</span>
                <span className="text-primary">{matchThreshold}%+</span>
              </div>
              <input 
                type="range" 
                min="0"
                max="95"
                step="5"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="accent-primary w-full cursor-pointer h-1.5 bg-border/40 rounded-lg appearance-none"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleKeywordSearch}
                className="flex-1 bg-primary text-surface font-black text-sm py-3.5 rounded-xl hover:opacity-90 transition-opacity min-h-[48px]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
