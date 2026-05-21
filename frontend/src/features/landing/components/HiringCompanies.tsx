/**
 * This section shows some names of famous companies that use JobLyne.
 * It's just to show that the platform is trusted by big names.
 */
export default function HiringCompanies() {
    const companies = [
        { name: "TechCorp" },
        { name: "GlobalFin" },
        { name: "EduStream" },
        { name: "HealthLine" },
    ];

    return (
        <section className="py-8 bg-surface border-b border-border transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* A simple horizontal list of company names */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all font-display">
                    <span className="text-[10px] sm:text-xs font-black text-muted uppercase tracking-[0.2em] w-full text-center md:w-auto md:text-left mb-2 md:mb-0">Top Hiring Companies:</span>
                    {companies.map((company) => (
                        <div key={company.name} className="flex items-center gap-2">
                            {/* Rounded circle placeholder for the logo */}
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-bg rounded-full shrink-0"></div>
                            <span className="font-black text-text text-xs sm:text-sm tracking-tight">{company.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
