"use client";

import React, { useState } from "react";
import { SignUpModal } from "@/shared/ui";
import { GraduationCap, Search, Star, X, FileText, ClipboardCheck, CheckCircle2, ShoppingCart } from "lucide-react";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  // Guest Interceptor Modal states
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpActionText, setSignUpActionText] = useState("to perform this action");

  const courses = [
    {
      id: "course-1",
      title: "Full Stack AI Engineering",
      description: "Take this comprehensive program to learn the skills you need to design, build, and deploy full-stack AI and machine learning systems.",
      category: "Development",
      price: "$89.99",
      rating: "4.9",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn1IppxK8scBLpLpnfwSMPKJ6XLvaPr80cfcRe4qxR6hhhqurTRpIxnPR7G3E6xOgCPuH3BnmOeBLb3H7GvQJBd6sW8ofWZ4iA2SbxLTkbcr9A3eNxU6lI55QhrJNHrybbhhxjx-daD1xv6Xyy4ANIL9Lf-dHFyf6peO1YlLD13YdOBeAPN2hEsETCNOVjteHLmyTOadkZvZDFqlLCWw5-DsauC2RdT6BHR1oISdkl-QYTcU0sQRn-Z_pya4EhEqGM7bkOZQvzvFk",
      tag: "Bestseller",
      curriculum: [
        "Week 1: Fundamentals of Machine Learning & Neural Networks",
        "Week 2: Deep Learning Frameworks and PyTorch Integration",
        "Week 3: Designing REST APIs for Model Inference & Services",
        "Week 4: Frontend Deployments & Streamlining UI/UX for AI Systems",
        "Week 5: Scalable Cloud Architecture and Model Monitoring"
      ]
    },
    {
      id: "course-2",
      title: "Advanced Data Visualization",
      description: "Learn advanced styling techniques, interactive dashboards, and visual storytelling for complex data structures and analytics.",
      category: "Data Science",
      price: "$124.99",
      rating: "4.8",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhqtzheV8WS0o38J9gZDlGfXvolBLHaOPtmBS0O1ZcArK7wSxjbcN359XBFrNNHLK3ly4fOnLcarynKLP_0oeFRmWISJtGAw9qCHEMBZEfrL6vlzu8ZkIcrdFH5-tF8PF5yaT1wwvzWUdbHc4btq0x7EkhHmvSlQqCE11lKW6zZcb79lGXB5AljA96N8k9kTKoTTGu53sCcsh-v9ByzLkG1m3r472T8MXanxl9TNfYTjV9W8VHpcEaQ0lz4c8WO6wj9LvF8zE_wKU",
      curriculum: [
        "Week 1: Visual Perception Theory & Color Design Systems",
        "Week 2: Interactive Plotting with D3.js and Chart.js",
        "Week 3: Developing Dynamic Dashboards in React",
        "Week 4: Real-time Data Streaming & Visual Updates",
        "Week 5: Capstone: Designing a High-Fidelity Analytics UI"
      ]
    },
    {
      id: "course-3",
      title: "Agile Project Leadership",
      description: "Master Agile ceremonies, Scrum master practices, and lean product management to drive cross-functional team success.",
      category: "Business",
      price: "$59.99",
      rating: "5.0",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmZ0w5FFnZdfLH25bvCOQKAdPQtdZJxEEQ4I0EHE6D35NfbkhrfGRkCMunlJIrj4k6ZH0TWPSDL-KAai9p-BK47fWrkS1BLGW8bb8r2MIhwnWDnzuoXzNOlIzVjKTW0j4gCKxdythaEWJJNQz2ejdIf1KL-fDQUcZrRkx4t04W-f_nxE4Y7ZwFyMlG_Pi-lW-v0BFV7Sni_Wa7NFjPU-fIlSPNOTbg20aa6LO8tfFTk_kxUx0hvzpQxFnVd7Zhzun0osUmVAj_VCg",
      curriculum: [
        "Week 1: Agile Manifesto and Core Mindsets",
        "Week 2: Scrum Framework: Roles, Ceremonies, and Artifacts",
        "Week 3: Estimation techniques and Sprint Backlog Grooming",
        "Week 4: Scaling Agile Frameworks (SAFe) in Organizations",
        "Week 5: Building Trust and Leading High-Performance Teams"
      ]
    }
  ];

  // Client-side filtering logic
  const filteredCourses = React.useMemo(() => {
    let result = [...courses];
    
    // 1. Search Query filter
    if (searchQuery.trim()) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 2. Category filter
    if (selectedCategory !== "All") {
      result = result.filter(c => c.category === selectedCategory);
    }
    
    return result;
  }, [searchQuery, selectedCategory]);

  const handleEnrollNow = (courseTitle: string) => {
    setSignUpActionText(`to enroll in the "${courseTitle}" course`);
    setIsSignUpModalOpen(true);
  };

  return (
    <div className="w-full text-text max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 flex-col">
      {/* Auth Interceptor Modal */}
      <SignUpModal 
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        actionText={signUpActionText}
      />

      {/* Page Header */}
      <div className="gap-4 flex justify-between flex-col md:flex-row md:items-center">
        <div>
          <h2 className="text-text items-center type-h1 gap-2 flex">
            <GraduationCap className="text-primary" size={30} aria-hidden="true" />
            Bridge your skill gap
          </h2>
          <p className="mt-1 text-muted">Learn new skills to qualify for the high-paying jobs listed on JobLyne.</p>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="flex gap-4 flex-col md:flex-row md:items-center justify-between border-b border-border pb-6">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or topics..." 
            className="w-full pl-9 min-h-[44px] pr-8 text-sm border-border/60 bg-surface py-2.5 rounded-xl border focus:outline-none focus:border-primary"
          />
          <Search className="left-3 absolute text-muted top-3" size={18} aria-hidden="true" />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery("")}
              className="right-3 absolute text-muted top-3 hover:text-text"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          {["All", "Development", "Data Science", "Business"].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`transition-all py-2 px-4 type-caption rounded-xl border ${selectedCategory === category ? "text-primary border-primary bg-primary/10" : "bg-surface text-muted border-border/60 hover:text-text"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => setSelectedCourse(course)}
              className="group rounded-2xl overflow-hidden transition-all bg-surface border-border shadow-sm min-w-0 border dark:border-border cursor-pointer hover:shadow-xl flex flex-col justify-between"
            >
              {/* Image & Tag */}
              <div className="h-40 relative overflow-hidden sm:h-48">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={course.title}
                  src={course.image}
                />
                {course.tag && (
                  <div className="px-2.5 py-1 left-4 top-4 absolute text-white rounded-full type-badge bg-accent">
                    {course.tag}
                  </div>
                )}
              </div>

              {/* Course details card body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="gap-2 flex mb-3 items-center">
                    <span className="px-2 py-1 text-primary type-caption rounded bg-primary/10">{course.category}</span>
                    <div className="flex text-warning items-center">
                      <Star className="fill-current" size={14} aria-hidden="true" />
                      <span className="ml-1 type-caption">{course.rating}</span>
                    </div>
                  </div>
                  <h4 className="type-card-title truncate text-text mb-2 group-hover:text-primary transition-colors">{course.title}</h4>
                  <p className="text-sm leading-relaxed line-clamp-2 text-muted mb-6">{course.description}</p>
                </div>

                <div className="gap-4 flex items-center justify-between border-t border-border/40 pt-4">
                  <span className="text-text type-h2">{course.price}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEnrollNow(course.title); }}
                    className="type-ui text-primary min-h-[44px] hover:underline"
                  >
                    Enroll now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="justify-center border-dashed border-border gap-4 rounded-2xl py-24 items-center text-center flex-col flex p-8 bg-surface border">
          <div className="bg-border/20 p-4 rounded-full text-muted">
            <GraduationCap size={48} aria-hidden="true" />
          </div>
          <div>
            <p className="text-text type-card-title">No courses match your criteria</p>
            <p className="mt-1 text-sm text-muted max-w-sm">Try typing different search keywords or changing the selected category.</p>
          </div>
        </div>
      )}

      {/* Course Detail Modal Drawer */}
      {selectedCourse && (
        <div className="justify-end fade-in inset-0 animate-in bg-card/60 flex backdrop-blur-sm duration-300 z-50 fixed">
          <div className="inset-0 absolute" onClick={() => setSelectedCourse(null)}></div>
          
          <div className="w-full h-full slide-in-from-right border-l border-border relative max-w-2xl overflow-hidden animate-in shadow-2xl duration-300 flex justify-between max-h-full bg-surface flex-col">
            
            {/* Header Block */}
            <div className="border-b items-center border-border/60 p-6 bg-bg/40 flex justify-between">
              <div className="gap-4 flex items-center">
                <GraduationCap className="text-primary" size={30} aria-hidden="true" />
                <div>
                  <h3 className="text-text line-clamp-1 type-card-title">{selectedCourse.title}</h3>
                  <p className="type-label">{selectedCourse.category} Course Details</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCourse(null)}
                className="w-11 justify-center items-center bg-bg text-muted transition-colors h-11 flex rounded-xl hover:text-text hover:bg-border/20"
                aria-label="Close details"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Curriculum details */}
            <div className="flex-1 overflow-y-auto gap-8 p-6 flex flex-col">
              
              {/* Course Meta Info */}
              <div className="rounded-2xl border-primary/20 items-center bg-primary/5 flex-col p-6 justify-between flex gap-6 border sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex text-warning items-center bg-surface border border-border/40 p-3 rounded-xl">
                    <Star className="fill-current" size={24} aria-hidden="true" />
                    <span className="ml-1 text-lg font-bold">{selectedCourse.rating} Rating</span>
                  </div>
                  <div>
                    <h4 className="text-text text-base">Self-Paced Learning</h4>
                    <p className="type-caption text-muted mt-0.5">High-fidelity instructional videos, exercises, and slides.</p>
                  </div>
                </div>

                <div className="flex text-right items-end flex-col sm:items-end">
                  <span className="type-badge text-muted">Enrollment Fee</span>
                  <span className="text-primary mt-1 type-card-title">
                    {selectedCourse.price}
                  </span>
                </div>
              </div>

              {/* Description Segment */}
              <div className="flex gap-2.5 flex-col">
                <h4 className="uppercase text-base items-center gap-2 tracking-wider flex text-muted">
                  <FileText className="text-muted" size={18} aria-hidden="true" />
                  Course Description
                </h4>
                <p className="bg-bg/20 text-sm border-border/30 leading-relaxed text-text/90 whitespace-pre-line p-4 rounded-xl border">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Curriculum breakdown */}
              <div className="border-border/40 border-t gap-4 pt-6 flex flex-col">
                <h4 className="uppercase text-base items-center gap-2 tracking-wider flex text-muted">
                  <ClipboardCheck className="text-muted" size={18} aria-hidden="true" />
                  Curriculum Breakdown
                </h4>
                
                <div className="gap-3 flex flex-col">
                  {selectedCourse.curriculum.map((weekText: string) => (
                    <div key={weekText} className="border-border/40 bg-bg/20 flex gap-3 items-center p-4 rounded-xl border">
                      <CheckCircle2 className="text-primary" size={18} aria-hidden="true" />
                      <span className="type-ui text-text">{weekText}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Frame */}
            <div className="border-t gap-4 items-center border-border/60 p-6 bg-bg/40 flex justify-between">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="min-h-[48px] px-5 items-center transition-all py-3 flex type-caption rounded-xl border border-border/60 hover:bg-bg text-muted"
              >
                Close details
              </button>

              <button 
                onClick={() => handleEnrollNow(selectedCourse.title)}
                className="justify-center px-8 min-h-[48px] gap-1.5 items-center py-3 type-ui shadow bg-primary flex text-white rounded-xl transition-opacity hover:opacity-90"
              >
                <ShoppingCart size={18} aria-hidden="true" />
                Buy & Enroll now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
