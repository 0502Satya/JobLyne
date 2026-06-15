/**
 * This section shows some names of famous companies that use JobLyne.
 * It's just to show that the platform is trusted by big names.
 */
export default function HiringCompanies() {
    const companies = [
        { name: "TechCorp", gradient: "from-[#06b6d4] to-[#3b82f6]", icon: "terminal" },
        { name: "GlobalFin", gradient: "from-[#10b981] to-[#0f766e]", icon: "trending_up" },
        { name: "EduStream", gradient: "from-[#8b5cf6] to-[#ec4899]", icon: "school" },
        { name: "HealthLine", gradient: "from-[#f43f5e] to-[#e11d48]", icon: "favorite" },
    ];

    return (
        <section className="py-8 bg-surface border-b border-border transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* A simple horizontal list of company names */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-16 opacity-75 hover:opacity-100 transition-all duration-300 font-display">
                    <span className="text-[10px] sm:text-xs font-black text-muted uppercase tracking-[0.2em] w-full text-center md:w-auto md:text-left mb-2 md:mb-0">
                        Top Hiring Companies:
                    </span>
                    {companies.map((company) => (
                        <div key={company.name} className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
                            {/* Rich aesthetic gradient circle with dynamic symbols */}
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${company.gradient} flex items-center justify-center shrink-0 shadow-md shadow-primary/5`}>
                                <span className="material-symbols-outlined text-white text-[16px] font-bold">
                                    {company.icon}
                                </span>
                            </div>
                            <span className="font-black text-text text-xs sm:text-sm tracking-tight">{company.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

