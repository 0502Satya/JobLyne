"use client";

import React, { useEffect, useState, useTransition, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  getJobsAction, 
  applyToJobAction, 
  saveJobAction, 
  unsaveJobAction, 
  getCandidateProfileAction, 
  updateCandidateProfileAction 
} from "@/features/auth/actions";
import { toast } from "react-hot-toast";
import { SignUpModal, EmptyState } from "@/shared/ui";
import { Compass, SlidersHorizontal } from "lucide-react";
import JobsFilterSidebar from "@/features/jobs/components/JobsFilterSidebar";
import JobListItem from "@/features/jobs/components/JobListItem";
import { generateJobSlug } from "@/shared/utils/slug";

/**
 * High-fidelity, real-time Job Search & AI Skill-Matching Dashboard.
 * Accessible to both authenticated candidates and public guests.
 */
function SearchJobPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Active filters & search terms initialized from search params if present
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("location") || "");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experience") || "All"); // All, Entry, Mid, Senior, or numeric
  const [salaryMin, setSalaryMin] = useState(searchParams.get("salaryMin") || "");
  const [salaryMax, setSalaryMax] = useState(searchParams.get("salaryMax") || "");
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<string[]>(
    searchParams.get("empTypes")?.split(",").filter(Boolean) || []
  );
  const [matchThreshold, setMatchThreshold] = useState<number>(
    Number(searchParams.get("match") || "0")
  );
  const [sortBy, setSortBy] = useState<"recent" | "match">(
    (searchParams.get("sort") as "recent" | "match") || "recent"
  );

  // UX states
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Guest Interceptor Modal states
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpActionText, setSignUpActionText] = useState("to perform this action");

  // Sync state changes with URL Search Params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    if (experienceLevel !== "All") params.set("experience", experienceLevel);
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    if (selectedEmpTypes.length > 0) params.set("empTypes", selectedEmpTypes.join(","));
    if (matchThreshold > 0) params.set("match", matchThreshold.toString());
    if (sortBy !== "recent") params.set("sort", sortBy);

    const queryString = params.toString();
    const newUrl = `/jobs${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [searchQuery, locationQuery, experienceLevel, salaryMin, salaryMax, selectedEmpTypes, matchThreshold, sortBy]);

  // Load initial candidate profile & job list (handling filters in query params)
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const profileData = await getCandidateProfileAction();
        if (profileData && !profileData.error) {
          setProfile(profileData);
        }

        const query = searchParams.get("query") || "";
        const location = searchParams.get("location") || "";
        const jobsData = await getJobsAction({ query, location });
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
  }, [searchParams]);

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

  // Apply real-time client-side filter and sorting logic on the loaded jobs
  const filteredAndSortedJobs = useMemo(() => {
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
    if (experienceLevel !== "All" && experienceLevel !== "30") {
      result = result.filter(job => {
        const req = job.experience_required ?? 0;
        
        // Determine category range based on selected years
        const years = Number(experienceLevel);
        if (!isNaN(years)) {
          if (years === 0) {
            return req === 0;
          } else if (years >= 1 && years <= 2) {
            return req >= 1 && req <= 2;
          } else if (years >= 3 && years <= 5) {
            return req >= 3 && req <= 5;
          } else if (years >= 6 && years <= 9) {
            return req >= 6 && req <= 9;
          } else if (years >= 10 && years <= 14) {
            return req >= 10 && req <= 14;
          } else {
            return req >= 15;
          }
        }
        
        // Fallback for Entry/Mid/Senior string categories
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
    if (!profile) {
      setSignUpActionText("to bookmark this job opportunity");
      setIsSignUpModalOpen(true);
      return;
    }
    setSavingId(job.id);
    try {
      if (job.is_saved) {
        const res = await unsaveJobAction(job.id);
        if (!res.error) {
          toast.success("Removed from saved list");
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: false } : j));
        }
      } else {
        const res = await saveJobAction(job.id);
        if (!res.error) {
          toast.success("Opportunity bookmarked!");
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_saved: true } : j));
        }
      }
    } catch (err) {
      toast.error("Failed to bookmark job");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="w-full text-text max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 flex-col">
      {/* Interceptor Signup Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        actionText={signUpActionText}
      />

      {/* Page Header */}
      <div className="gap-4 flex justify-between flex-col md:flex-row md:items-center">
        <div>
          <h1 className="text-text items-center type-h1 gap-2 flex font-bold">
            <Compass className="text-primary" size={30} aria-hidden="true" />
            Discover Opportunities
          </h1>
          <p className="mt-1 text-muted text-sm">Intelligent career matching and high-fidelity sourcing feeds.</p>
        </div>
        
        {/* Sort & Quick Controls */}
        <div className="flex gap-3 items-center">
          <div className="border-border/40 bg-border/20 p-1 flex rounded-xl border">
            <button 
              onClick={() => setSortBy("recent")}
              className={`min-h-[44px] px-3 transition-all rounded-lg py-1.5 type-caption font-semibold cursor-pointer ${sortBy === "recent" ? "bg-primary shadow text-white" : "text-muted hover:text-text"}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setSortBy("match")}
              className={`min-h-[44px] px-3 transition-all rounded-lg py-1.5 type-caption font-semibold cursor-pointer ${sortBy === "match" ? "bg-primary shadow text-white" : "text-muted hover:text-text"}`}
            >
              Best Match
            </button>
          </div>
          
          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden type-caption justify-center rounded-xl gap-1.5 min-h-[44px] items-center border-border/60 transition-all py-2.5 flex px-4 bg-surface border hover:border-primary/60 cursor-pointer font-semibold"
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Grid Block */}
      <div className="w-full gap-8 items-start grid grid-cols-1 lg:grid-cols-4">
        
        {/* Sidebar Filters - Desktop (Sticky) */}
        <JobsFilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationQuery={locationQuery}
          setLocationQuery={setLocationQuery}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          salaryMin={salaryMin}
          setSalaryMin={setSalaryMin}
          salaryMax={salaryMax}
          setSalaryMax={setSalaryMax}
          selectedEmpTypes={selectedEmpTypes}
          setSelectedEmpTypes={setSelectedEmpTypes}
          matchThreshold={matchThreshold}
          setMatchThreshold={setMatchThreshold}
          handleKeywordSearch={handleKeywordSearch}
          handleResetFilters={handleResetFilters}
          isPending={isPending}
          className="hidden lg:flex lg:flex-col sticky top-[calc(var(--height-header)+12px)]"
        />

        {/* Results Feed Panel */}
        <div className="lg:col-span-3 w-full max-w-full flex gap-6 flex-col">
          {loading ? (
            <div className="flex gap-6 flex-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-border rounded-2xl animate-pulse shadow-sm h-48 bg-surface border"></div>
              ))}
            </div>
          ) : filteredAndSortedJobs.length > 0 ? (
            <div className="gap-4 flex flex-col">
              <div className="uppercase pl-1 tracking-widest type-caption text-muted font-bold text-xs">
                Showing {filteredAndSortedJobs.length} matches found
              </div>
              
              {filteredAndSortedJobs.map((job) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  isSelected={false}
                  savingId={savingId}
                  onSelect={() => router.push(`/jobs/${generateJobSlug(job)}`)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching listings found"
              description="Try resetting your filters or adjusting your search queries to see more active listings."
              icon="search_off"
              actionLabel="Clear all filters"
              onAction={handleResetFilters}
              className="py-16"
            />
          )}
        </div>
      </div>

      {/* Floating Bottom Drawer / Modal - Mobile Filters overlay */}
      {isFilterDrawerOpen && (
        <div className="justify-center fade-in items-end inset-0 animate-in bg-card/60 flex backdrop-blur-sm duration-300 z-50 fixed lg:hidden">
          <div className="inset-0 absolute" onClick={() => setIsFilterDrawerOpen(false)}></div>
          
          <div className="w-full max-h-[85vh] rounded-t-3xl overflow-y-auto relative max-w-lg animate-in p-6 shadow-2xl slide-in-from-bottom duration-300 flex gap-6 bg-surface flex-col">
            <div className="border-border/40 border-b pb-3 items-center flex justify-between">
              <h3 className="type-card-title items-center gap-2 flex font-semibold">
                <SlidersHorizontal className="text-primary" size={20} aria-hidden="true" />
                Filter Options
              </h3>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="justify-center items-center bg-bg rounded-full h-8 flex w-8 text-muted hover:text-text hover:bg-border/20 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <JobsFilterSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              experienceLevel={experienceLevel}
              setExperienceLevel={setExperienceLevel}
              salaryMin={salaryMin}
              setSalaryMin={setSalaryMin}
              salaryMax={salaryMax}
              setSalaryMax={setSalaryMax}
              selectedEmpTypes={selectedEmpTypes}
              setSelectedEmpTypes={setSelectedEmpTypes}
              matchThreshold={matchThreshold}
              setMatchThreshold={setMatchThreshold}
              handleKeywordSearch={(e) => {
                handleKeywordSearch(e);
                setIsFilterDrawerOpen(false);
              }}
              handleResetFilters={handleResetFilters}
              isPending={isPending}
              className="border-none p-0 bg-transparent shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchJobPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 flex-col">
        <div className="flex gap-6 flex-col">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-border rounded-2xl animate-pulse shadow-sm h-48 bg-surface border"></div>
          ))}
        </div>
      </div>
    }>
      <SearchJobPageContent />
    </Suspense>
  );
}
