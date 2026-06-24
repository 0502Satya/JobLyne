import { PageSection, Container, Icon } from "@/shared/ui";

/**
 * This section shows some names of famous companies that use JobLyne.
 * It's just to show that the platform is trusted by big names.
 */
export default function HiringCompanies() {
    const companies = [
        { name: "TechCorp", gradient: "from-info to-primary", icon: "terminal" },
        { name: "GlobalFin", gradient: "from-success/80 to-success", icon: "trending_up" },
        { name: "EduStream", gradient: "from-warning to-error", icon: "school" },
        { name: "HealthLine", gradient: "from-error to-error/60", icon: "favorite" },
    ];

    return (
        <PageSection className="border-b border-border py-8 transition-colors bg-surface">
            <Container size="xl">
                {/* A simple horizontal list of company names */}
                <div className="justify-center gap-4 opacity-75 items-center transition-all flex-wrap duration-300 flex sm:gap-8 md:gap-16 hover:opacity-100">
                    <span className="w-full text-xs uppercase text-center tracking-decorative mb-2 text-muted md:w-auto md:mb-0 md:text-left">
                        Top hiring companies:
                    </span>
                    {companies.map((company) => (
                        <div key={company.name} className="cursor-pointer duration-200 items-center gap-2 transition-transform flex hover:scale-105">
                            {/* Rich aesthetic gradient circle with dynamic symbols */}
                            <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${company.gradient} justify-center shrink-0 shadow-md items-center shadow-primary/5 flex text-white`}>
                                <Icon name={company.icon} size={16} className="text-white" aria-hidden="true" />
                            </div>
                            <span className="text-text tracking-tight type-badge">{company.name}</span>
                        </div>
                    ))}
                </div>
            </Container>
        </PageSection>
    );
}

