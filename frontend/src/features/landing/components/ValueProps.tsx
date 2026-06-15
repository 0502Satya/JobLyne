/**
 * This section lists the main benefits of using JobLyne.
 * Each benefit is shown inside a nice rounded card.
 */
export default function ValueProps() {
    const props = [
        {
            title: "AI-Powered Matching",
            description: "Smart systems connect you to jobs based on your skills and goals.",
            icon: "auto_awesome",
            color: "primary",
        },
        {
            title: "LMS Marketplace",
            description: "Find the best courses or teach your own training programs.",
            icon: "menu_book",
            color: "accent",
        },
        {
            title: "Recruiter Insights",
            description: "See clear charts and data about teams and planning.",
            icon: "monitoring",
            color: "primary",
        },
        {
            title: "Career Services",
            description: "Help with your resume and practice interviews with AI.",
            icon: "badge",
            color: "accent",
        },
    ];

    return (
        <section className="py-24 bg-bg transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* The main title of this section */}
                <div className="text-center mb-16 px-4">
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-text mb-4 tracking-tight">The JobLyne Advantage</h2>
                    <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">Everything you need to grow your career in one place.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {props.map((prop) => (
                        <div key={prop.title} className="p-6 sm:p-8 rounded-3xl bg-surface border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group min-w-0">
                            {/* The icon in the corner of the card */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-sm ${prop.color === 'primary' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'
                                }`}>
                                <span className="material-symbols-outlined text-2xl">{prop.icon}</span>
                            </div>
                            {/* Title and details inside the card */}
                            <h3 className="text-lg sm:text-xl font-black mb-3 text-text truncate">{prop.title}</h3>
                            <p className="text-muted text-sm leading-relaxed line-clamp-3">{prop.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
