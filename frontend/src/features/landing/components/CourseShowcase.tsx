import { Button } from "@/shared/ui";
import { ExternalLink, Star } from "lucide-react";

/**
 * This section shows some recommended courses.
 * It helps people learn the skills they need for high-paying jobs.
 */
export default function CourseShowcase() {
    const courses = [
        {
            title: "Full Stack AI Engineering",
            description: "Take these courses to qualify for the high-paying jobs listed above.",
            category: "Development",
            price: "$89.99",
            rating: "4.9",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn1IppxK8scBLpLpnfwSMPKJ6XLvaPr80cfcRe4qxR6hhhqurTRpIxnPR7G3E6xOgCPuH3BnmOeBLb3H7GvQJBd6sW8ofWZ4iA2SbxLTkbcr9A3eNxU6lI55QhrJNHrybbhhxjx-daD1xv6Xyy4ANIL9Lf-dHFyf6peO1YlLD13YdOBeAPN2hEsETCNOVjteHLmyTOadkZvZDFqlLCWw5-DsauC2RdT6BHR1oISdkl-QYTcU0sQRn-Z_pya4EhEqGM7bkOZQvzvFk",
            tag: "Bestseller"
        },
        {
            title: "Advanced Data Visualization",
            description: "Take these courses to qualify for the high-paying jobs listed above.",
            category: "Data Science",
            price: "$124.99",
            rating: "4.8",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhqtzheV8WS0o38J9gZDlGfXvolBLHaOPtmBS0O1ZcArK7wSxjbcN359XBFrNNHLK3ly4fOnLcarynKLP_0oeFRmWISJtGAw9qCHEMBZEfrL6vlzu8ZkIcrdFH5-tF8PF5yaT1wwvzWUdbHc4btq0x7EkhHmvSlQqCE11lKW6zZcb79lGXB5AljA96N8k9kTKoTTGu53sCcsh-v9ByzLkG1m3r472T8MXanxl9TNfYTjV9W8VHpcEaQ0lz4c8WO6wj9LvF8zE_wKU"
        },
        {
            title: "Agile Project Leadership",
            description: "Take these courses to qualify for the high-paying jobs listed above.",
            category: "Business",
            price: "$59.99",
            rating: "5.0",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmZ0w5FFnZdfLH25bvCOQKAdPQtdZJxEEQ4I0EHE6D35NfbkhrfGRkCMunlJIrj4k6ZH0TWPSDL-KAai9p-BK47fWrkS1BLGW8bb8r2MIhwnWDnzuoXzNOlIzVjKTW0j4gCKxdythaEWJJNQz2ejdIf1KL-fDQUcZrRkx4t04W-f_nxE4Y7ZwFyMlG_Pi-lW-v0BFV7Sni_Wa7NFjPU-fIlSPNOTbg20aa6LO8tfFTk_kxUx0hvzpQxFnVd7Zhzun0osUmVAj_VCg"
        }
    ];

    return (
        <section className="bg-background-light transition-colors py-24 dark:bg-card/40">
            <div className="mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
                {/* Title and a link to see all courses */}
                <div className="items-end flex-col mb-12 flex gap-6 justify-between md:flex-row">
                    <div>
                        <h2 className="text-text mb-2 type-h1">Bridge Your Skill Gap</h2>
                        <p className="text-muted">Learn new skills to get better jobs.</p>
                    </div>
                    <a className="text-primary gap-1.5 items-center flex hover:underline" href="#">
                        Explore all courses
                        <ExternalLink size={14} aria-hidden="true" />
                    </a>
                </div>

                {/* Grid showing the list of courses */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course.title} className="group rounded-2xl overflow-hidden transition-all bg-surface border-border shadow-sm min-w-0 border dark:border-border dark:bg-card hover:shadow-xl">
                            {/* Image with a 'Bestseller' tag if needed */}
                            <div className="h-40 relative overflow-hidden sm:h-48">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={course.title}
                                    src={course.image}
                                />
                                {course.tag && (
                                    <div className="px-2 py-1 left-4 top-4 absolute text-white rounded-full type-badge bg-accent">
                                        {course.tag}
                                    </div>
                                )}
                            </div>
                            {/* Details like Category, Rating, Title, and Price */}
                            <div className="p-5 sm:p-6">
                                <div className="gap-2 flex mb-3 items-center">
                                    <span className="px-2 py-1 text-primary type-caption rounded bg-primary/10">{course.category}</span>
                                    <div className="flex text-yellow-500 items-center">
                                        <Star size={14} className="fill-current text-yellow-500" aria-hidden="true" />
                                        <span className="ml-1 type-caption">{course.rating}</span>
                                    </div>
                                </div>
                                <h4 className="type-card-title truncate text-text mb-2">{course.title}</h4>
                                <p className="text-sm leading-relaxed line-clamp-2 text-muted mb-6">{course.description}</p>
                                <div className="gap-4 flex items-center justify-between">
                                    <span className="text-text type-h2">{course.price}</span>
                                    <button className="type-ui text-primary min-h-[44px] hover:underline">Enroll Now</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
