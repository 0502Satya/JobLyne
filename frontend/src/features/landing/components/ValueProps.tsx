import { PageSection, Container, Icon } from "@/shared/ui";

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
            title: "Instant Verification",
            description: "Build trust with employers instantly through verified credentials.",
            icon: "verified_user",
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
        <PageSection className="bg-bg transition-colors py-24">
            <Container size="xl">
                {/* The main title of this section */}
                <div className="mb-16 text-center px-4">
                    <h2 className="text-text type-h2 mb-4">The JobLyne Advantage</h2>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Everything you need to grow your career in one place.</p>
                </div>

                <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
                    {props.map((prop) => (
                        <div key={prop.title} className="border-border group rounded-3xl transition-all p-6 min-w-0 bg-surface border sm:p-8 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
                            {/* The icon in the corner of the card */}
                            <div className={`justify-center h-12 w-12 items-center shadow-sm transition-colors flex mb-6 rounded-xl ${prop.color === 'primary' ? 'text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white' : 'bg-accent/10 text-accent group-hover:text-white group-hover:bg-accent'
                                }`}>
                                <Icon name={prop.icon} size={24} aria-hidden="true" />
                            </div>
                            {/* Title and details inside the card */}
                            <h3 className="text-text mb-3 type-card-title truncate">{prop.title}</h3>
                            <p className="leading-relaxed text-sm text-muted line-clamp-3">{prop.description}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </PageSection>
    );
}
