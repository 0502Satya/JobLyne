import { PageSection, Container, Button } from "@/shared/ui";

/**
 * This section is the final step on the page.
 * It encourages the user to create an account or talk to sales.
 */
export default function CTASection() {
    return (
        <PageSection spacing="lg" className="relative overflow-hidden bg-bg transition-colors">
            <Container size="md" className="z-10 relative text-center">
                {/* Big question to catch user's interest */}
                <h2 className="text-text mb-6 type-h1">
                    Ready to transform your career intelligence?
                </h2>
                <p className="mb-10 leading-relaxed text-lg text-muted sm:text-xl">
                    Join us and find the best opportunities for your professional growth.
                </p>

                {/* Main action buttons */}
                <div className="justify-center gap-4 flex items-stretch flex-col sm:flex-row sm:items-center">
                    <Button variant="primary" size="lg" className="rounded-2xl sm:min-h-[64px] sm:text-lg sm:py-5 sm:px-10 shadow-lg shadow-primary/25">
                        Create Free Account
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-2xl sm:min-h-[64px] sm:text-lg sm:py-5 sm:px-10">
                        Talk to Sales
                    </Button>
                </div>
            </Container>

            {/* Decorative blurred circles for style */}
            <div className="blur-3xl -translate-x-1/2 w-[40vw] bg-primary/10 absolute max-w-[256px] h-[40vw] left-0 pointer-events-none rounded-full top-1/2 -translate-y-1/2"></div>
            <div className="blur-3xl max-w-[384px] translate-x-1/2 absolute translate-y-1/2 pointer-events-none w-[60vw] bg-primary/10 rounded-full bottom-0 right-0 h-[60vw]"></div>
        </PageSection>
    );
}
