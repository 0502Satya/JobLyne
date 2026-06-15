/**
 * This section shows some big numbers about the platform.
 * It helps build trust by showing how many people and companies use JobLyne.
 */
export default function PlatformStats() {
    const stats = [
        { value: "500k+", label: "Active Candidates" },
        { value: "10k+", label: "Global Companies" },
        { value: "2k+", label: "Premium Courses" },
    ];

    return (
        <section className="py-20 bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12 text-center">
                    {stats.map((stat) => (
                        <div key={stat.label} className="min-w-0">
                            {/* Big bold number */}
                            <p className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2 tracking-tighter">{stat.value}</p>
                            {/* Short name for the number */}
                            <p className="text-surface/80 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
