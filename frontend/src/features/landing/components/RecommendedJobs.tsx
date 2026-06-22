import Link from "next/link";
import { Banknote, Clock } from "lucide-react";

/**
 * This section shows job recommendations specifically for the user.
 * It includes a 'match percentage' to show how well they fit the job.
 */
export default function RecommendedJobs() {
    const jobs = [
        {
            title: "Senior AI Engineer",
            company: "TechCorp",
            location: "San Francisco, CA",
            salary: "$140k - $180k",
            type: "Full-time",
            match: "98%",
            logo: "TC",
            color: "primary"
        },
        {
            title: "Product Designer",
            company: "GlobalFin",
            location: "Remote",
            salary: "$110k - $150k",
            type: "Full-time",
            match: "92%",
            logo: "GF",
            color: "accent"
        },
        {
            title: "Data Analyst",
            company: "EduStream",
            location: "New York, NY",
            salary: "$90k - $120k",
            type: "Hybrid",
            match: "85%",
            logo: "ES",
            color: "primary"
        }
    ];

    return (
        <section className="bg-bg transition-colors py-20">
            <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
                {/* Title and 'View All' button */}
                <div className="mb-10 flex-col flex gap-6 justify-between sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <h2 className="text-text type-h2 truncate mb-2">Recommended for You</h2>
                        <p className="text-sm text-muted sm:text-base">Jobs that match your profile and search history.</p>
                    </div>
                    <Link href="/jobs" className="text-primary shrink-0 min-h-[44px] type-ui text-left hover:underline flex items-center">View All Jobs</Link>
                </div>

                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <div key={job.title} className="border-border group rounded-2xl transition-all shadow-sm min-w-0 p-5 bg-surface border sm:p-6 hover:shadow-md">
                            <div className="gap-4 items-start mb-4 flex justify-between">
                                {/* A circle with the company's short name (like TC) */}
                                <div className={`justify-center h-10 w-10 shrink-0 items-center type-ui flex rounded-xl sm:text-base sm:w-12 sm:h-12 ${job.color === 'primary' ? 'text-primary bg-primary/10' : 'bg-accent/10 text-accent'
                                    }`}>
                                    {job.logo}
                                </div>
                                {/* A small green tag showing the match percentage */}
                                <span className="px-2 py-1 shrink-0 text-green-700 uppercase text-xs rounded-full bg-green-100">
                                    {job.match} Match
                                </span>
                            </div>

                            <h3 className="text-text type-card-title truncate transition-colors mb-1 group-hover:text-primary">
                                {job.title}
                            </h3>
                            <p className="mb-4 truncate text-sm text-muted">{job.company} • {job.location}</p>

                            {/* Extra details like Salary and Job Type */}
                            <div className="text-xs items-center flex-wrap gap-3 flex mb-6 text-muted sm:gap-4 sm:text-xs">
                                <span className="gap-1.5 flex items-center">
                                    <Banknote size={14} className="shrink-0" aria-hidden="true" /> {job.salary}
                                </span>
                                <span className="gap-1.5 flex items-center">
                                    <Clock size={14} className="shrink-0" aria-hidden="true" /> {job.type}
                                </span>
                            </div>

                            <Link href="/auth/signup" className="w-full text-text min-h-[44px] py-3.5 bg-bg transition-all rounded-xl hover:text-white hover:bg-btn-primary flex items-center justify-center type-ui">
                                Apply Now
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
