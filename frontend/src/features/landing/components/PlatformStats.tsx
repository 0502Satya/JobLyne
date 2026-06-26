import { PageSection, Container } from "@/shared/ui";

/**
 * This section shows some big numbers about the platform.
 * It helps build trust by showing how many people and companies use JobLyne.
 */
export default function PlatformStats() {
    const stats = [
        { value: "500k+", label: "Active candidates" },
        { value: "10k+", label: "Global companies" },
        { value: "45k+", label: "Active jobs" },
    ];

    return (
        <PageSection className="bg-primary text-white py-20" aria-label="Platform statistics">
            <Container size="xl">
                <dl className="text-center grid grid-cols-1 gap-10 sm:grid-cols-3 md:gap-12">
                    {stats.map((stat) => (
                        <div key={stat.label} className="min-w-0">
                            {/* Big bold number */}
                            <dd className="mb-2 type-display">{stat.value}</dd>
                            {/* Short name for the number */}
                            <dt className="text-xs uppercase text-white/80 tracking-decorative">{stat.label}</dt>
                        </div>
                    ))}
                </dl>
            </Container>
        </PageSection>
    );
}
