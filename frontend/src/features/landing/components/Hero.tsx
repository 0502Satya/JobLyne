/**
 * The 'Hero' is the main section at the top of the homepage.
 * It's the first thing users see. It has a big title and a search bar for finding jobs.
 */
export default function Hero() {
    return (
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-bg transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    {/* A small blue badge to highlight the AI feature */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        AI-Powered Job Matching
                    </div>

                    {/* The main big title of the website */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-text leading-[1.1] mb-8" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
                        Your Dream Job is a <span className="text-primary">Search Away</span>
                    </h1>

                    {/* The search box for jobs and locations */}
                    <form action="/dashboard" method="GET" className="bg-surface p-2 rounded-2xl shadow-2xl border border-border flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
                        {/* Input for Job titles */}
                        <div className="flex-1 flex items-center px-4 py-3 gap-3 border-b md:border-b-0 md:border-r border-border">
                            <span className="material-symbols-outlined text-muted">search</span>
                            <input
                                name="query"
                                className="w-full bg-transparent border-none focus:ring-0 text-text placeholder:text-muted outline-none"
                                placeholder="Job title, keywords, or company"
                                type="text"
                            />
                        </div>
                        {/* Input for Locations */}
                        <div className="flex-1 flex items-center px-4 py-3 gap-3">
                            <span className="material-symbols-outlined text-muted">location_on</span>
                            <input
                                name="location"
                                className="w-full bg-transparent border-none focus:ring-0 text-text placeholder:text-muted outline-none"
                                placeholder="Location"
                                type="text"
                            />
                        </div>
                        {/* The blue button to start the search */}
                        <button type="submit" className="bg-btn-primary text-surface font-bold px-8 py-4 rounded-xl hover:bg-btn-primary-hover transition-all">
                            Find Jobs
                        </button>
                    </form>

                    {/* Some common job titles as suggestions */}
                    <p className="mt-6 text-muted text-sm">
                        Popular: Software Engineer, Product Manager, Data Scientist, UX Designer
                    </p>
                </div>
            </div>

            {/* A faint blue circle in the background just for style */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        </section>
    );
}
