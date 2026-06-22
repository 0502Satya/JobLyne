import { Icon } from "@/shared/ui";

/**
 * This section shows links for different types of people (like Candidates or Companies).
 * Each link has an icon and a name.
 */
export default function StakeholderNav() {
    const stakeholders = [
        { name: "Candidates", icon: "person" },
        { name: "Companies", icon: "corporate_fare" },
        { name: "Recruiters", icon: "search_check" },
        { name: "Institutes", icon: "school" },
        { name: "Trainers", icon: "model_training" },
    ];

    return (
        <section className="border-y py-12 border-border bg-bg transition-colors">
            <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
                <p className="mb-10 type-label uppercase text-center tracking-widest">Tailored for your journey</p>

                {/* We map (loop) through the list of people names and icons above */}
                <div className="grid-cols-2 grid gap-6 sm:grid-cols-3 sm:gap-8 md:grid-cols-5">
                    {stakeholders.map((item) => (
                        <a key={item.name} className="group items-center flex-col flex py-2 min-w-0" href="#">
                            {/* The box containing the icon */}
                            <div className="justify-center h-12 border-border rounded-2xl w-12 items-center transition-all shadow-sm text-muted duration-300 flex bg-surface border sm:h-14 sm:w-14 group-hover:text-primary group-hover:shadow-lg">
                                <Icon name={item.icon} size={28} className="transition-colors duration-300" aria-hidden="true" />
                            </div>
                            {/* The name under the icon */}
                            <span className="w-full text-text tracking-tight mt-3 text-center type-ui truncate transition-colors group-hover:text-primary">{item.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
