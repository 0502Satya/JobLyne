import { PageSection, Container, Badge, Button } from "@/shared/ui";
import { Search, MapPin } from "lucide-react";

/**
 * The 'Hero' is the main section at the top of the homepage.
 * It's the first thing users see. It has a big title and a search bar for finding jobs.
 */
export default function Hero() {
    return (
        <PageSection spacing="lg" className="relative overflow-hidden bg-bg transition-colors">
            <Container size="xl" className="z-10 relative">
                <div className="text-center max-w-4xl mx-auto">
                    {/* A small blue badge to highlight the AI feature */}
                    <Badge variant="primary" className="mb-6 uppercase tracking-wider py-1 px-3">
                        <span className="flex h-2 relative w-2 mr-2">
                            <span className="w-full h-full animate-ping inline-flex opacity-75 absolute rounded-full bg-primary"></span>
                            <span className="h-2 inline-flex relative w-2 rounded-full bg-primary"></span>
                        </span>
                        AI-Powered Job Matching
                    </Badge>

                    {/* The main big title of the website */}
                    <h1 className="text-text mb-8 type-display">
                        Your Dream Job is a <span className="text-primary">Search Away</span>
                    </h1>

                    {/* The search box for jobs and locations */}
                    <form action="/jobs" method="GET" className="max-w-3xl mx-auto border-border rounded-2xl p-2 gap-2 flex-col shadow-xl flex bg-surface border md:flex-row">
                        {/* Input for Job titles */}
                        <div className="border-b flex-1 border-border items-center py-3 gap-3 flex px-4 md:border-r md:border-b-0">
                            <Search size={20} className="text-muted" aria-hidden="true" />
                            <label htmlFor="hero-query" className="sr-only">Job title, keywords, or company</label>
                            <input
                                id="hero-query"
                                name="query"
                                className="w-full text-text bg-transparent outline-none border-none focus:ring-0 placeholder:text-muted"
                                placeholder="Job title, keywords, or company"
                                type="text"
                             />
                        </div>
                        {/* Input for Locations */}
                        <div className="flex-1 items-center py-3 gap-3 flex px-4">
                            <MapPin size={20} className="text-muted" aria-hidden="true" />
                            <label htmlFor="hero-location" className="sr-only">Location</label>
                            <input
                                id="hero-location"
                                name="location"
                                className="w-full text-text bg-transparent outline-none border-none focus:ring-0 placeholder:text-muted"
                                placeholder="Location"
                                type="text"
                            />
                        </div>
                        {/* The blue button to start the search */}
                        <Button type="submit" variant="primary" size="lg" className="rounded-xl shrink-0 px-8 py-4">
                            Find Jobs
                        </Button>
                    </form>

                    {/* Some common job titles as suggestions */}
                    <p className="text-sm text-muted mt-6">
                        Popular: Software Engineer, Product Manager, Data Scientist, UX Designer
                    </p>
                </div>
            </Container>

            {/* A faint blue circle in the background just for style */}
            <div className="blur-3xl translate-x-1/2 w-[40vw] absolute max-h-[600px] h-[40vw] bg-primary/5 pointer-events-none rounded-full max-w-[600px] -translate-y-1/2 right-0 top-0"></div>
        </PageSection>
    );
}
