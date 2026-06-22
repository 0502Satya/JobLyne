"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  Badge,
  Dialog,
  Select,
  Combobox,
  Stack,
  Inline,
  Container,
  PageSection,
  ThemeToggle,
  Tabs,
  Tooltip,
  Avatar,
  toast,
  Breadcrumbs,
  Pagination,
  LoadingState,
  ErrorState,
  EmptyState,
  OfflineState,
  FormField,
  Icon,
} from "@/shared/ui";

export default function StyleguidePage() {
  // Local states for interactive demos
  const [comboboxValue, setComboboxValue] = useState("");
  const [selectValue, setSelectValue] = useState("option-1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeViewSection, setActiveViewSection] = useState("tokens");

  // Sample data for Combobox
  const comboboxOptions = [
    { value: "react", label: "React" },
    { value: "nextjs", label: "Next.js" },
    { value: "typescript", label: "TypeScript" },
    { value: "tailwindcss", label: "Tailwind CSS" },
    { value: "django", label: "Django REST Framework" },
  ];

  // Sample data for Select
  const selectOptions = [
    { value: "option-1", label: "Engineering" },
    { value: "option-2", label: "Product Management" },
    { value: "option-3", label: "Design" },
    { value: "option-4", label: "Marketing" },
  ];

  // Sample data for Tabs
  const tabItems = [
    {
      id: "tab-general",
      label: "General Settings",
      icon: "settings",
      content: (
        <Card variant="outline" className="p-4">
          <p className="type-body text-text font-medium mb-1">General Profile Info</p>
          <p className="type-caption text-muted">Configure your basic account settings, usernames, and profile tags.</p>
        </Card>
      ),
    },
    {
      id: "tab-security",
      label: "Security & Access",
      icon: "shield",
      content: (
        <Card variant="outline" className="p-4">
          <p className="type-body text-text font-medium mb-1">Security Standards</p>
          <p className="type-caption text-muted">Manage multi-factor authentication, active login sessions, and credential audits.</p>
        </Card>
      ),
    },
  ];

  // Breadcrumbs sample items
  const breadcrumbItems = [
    { label: "Home", href: "#" },
    { label: "Settings", href: "#" },
    { label: "Profile Customization" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* Offline state trigger demo if offline */}
      <OfflineState />

      {/* Top Banner Navigation */}
      <header className="border-b border-border/60 bg-surface-1 py-4 sticky top-0 z-sticky backdrop-blur-md">
        <Container size="xl" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white">
              <Icon name="architecture" size={20} aria-hidden="true" className="text-white" />
            </div>
            <div>
              <h1 className="type-h3 m-0 leading-none">JobLyne Playbook</h1>
              <p className="type-caption text-muted mt-0.5">Design System & Core Primitives (v1.0)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-1">
              {[
                { id: "tokens", label: "Design Tokens", icon: "palette" },
                { id: "components", label: "Components & States", icon: "category" },
                { id: "states", label: "System States", icon: "sync" },
                { id: "responsive", label: "Responsive QA", icon: "devices" },
                { id: "adoption", label: "Adoption metrics", icon: "query_stats" },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveViewSection(section.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeViewSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <Icon name={section.icon} size={16} aria-hidden="true" />
                  {section.label}
                </button>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </Container>
      </header>

      {/* Main Page Layout */}
      <Container size="xl" className="mt-8">
        {/* Section 1: DESIGN TOKENS */}
        {activeViewSection === "tokens" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Design Tokens</h2>
              <p className="type-body-sm text-muted">The core grammatical layers and variables backing all JobLyne UI component instances.</p>
            </div>

            {/* Colors */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Semantic Color Palette</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { name: "Primary", hex: "#006fff", text: "text-white", bg: "bg-primary" },
                  { name: "Success", hex: "#10b981", text: "text-white", bg: "bg-success" },
                  { name: "Warning", hex: "#f59e0b", text: "text-on-warning", bg: "bg-warning" },
                  { name: "Error", hex: "#ef4444", text: "text-white", bg: "bg-error" },
                  { name: "Info", hex: "#006fff", text: "text-white", bg: "bg-info" },
                  { name: "Neutral", hex: "#64748b", text: "text-white", bg: "bg-muted" },
                ].map((color) => (
                  <Card key={color.name} variant="elevated" className="overflow-hidden p-0">
                    <div className={`h-24 ${color.bg} flex items-end p-3`}>
                      <span className={`text-xs font-semibold ${color.text}`}>{color.hex}</span>
                    </div>
                    <div className="p-3">
                      <p className="type-ui font-semibold text-sm">{color.name}</p>
                      <p className="type-caption text-muted mt-0.5">Semantic shade</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Elevation Surfaces */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Surface Hierarchy</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { level: "surface-0", label: "App Canvas Base", style: "bg-surface-0", border: "border-transparent" },
                  { level: "surface-1", label: "Card / Default Raised", style: "bg-surface-1", border: "border-border/40 shadow-xs" },
                  { level: "surface-2", label: "Form Inputs / Section Group", style: "bg-surface-2", border: "border-border/60" },
                  { level: "surface-3", label: "Borders & Active Hover Focus", style: "bg-surface-3", border: "border-border" },
                ].map((surface) => (
                  <div
                    key={surface.level}
                    className={`p-6 rounded-xl border ${surface.style} ${surface.border} flex flex-col justify-between min-h-[140px]`}
                  >
                    <div>
                      <span className="type-badge text-primary">{surface.level}</span>
                      <p className="type-ui font-semibold mt-2 text-sm">{surface.label}</p>
                    </div>
                    <p className="type-caption text-muted">var(--color-{surface.level})</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Type System Scale</h3>
              <Card variant="outline" className="p-6 divide-y divide-border/40 space-y-4">
                {[
                  { tag: "Display", cls: "type-display", sample: "Design Rules" },
                  { tag: "H1 / Title", cls: "type-h1", sample: "Building Core Dashboards" },
                  { tag: "H2 / Section Title", cls: "type-h2", sample: "Interactive Settings Console" },
                  { tag: "H3 / Block Title", cls: "type-h3", sample: "User Credentials Card" },
                  { tag: "Card Title", cls: "type-card-title", sample: "Full-Stack Developer" },
                  { tag: "Body Text", cls: "type-body", sample: "Reducing cognitive load via sensible defaults and progressive form layouts." },
                  { tag: "Body Small", cls: "type-body-sm", sample: "Helper guidelines and accessibility-described context details." },
                  { tag: "UI / Buttons", cls: "type-ui", sample: "Confirm Submission" },
                  { tag: "Badge Indicator", cls: "type-badge", sample: "Verified Account" },
                  { tag: "Caption Info", cls: "type-caption", sample: "Updated 10 minutes ago" },
                ].map((type) => (
                  <div key={type.tag} className="flex flex-col md:flex-row md:items-center py-4 first:pt-0 last:pb-0 gap-2 md:gap-8">
                    <div className="w-40 shrink-0">
                      <span className="type-badge text-muted block">{type.tag}</span>
                      <code className="text-xs text-primary font-mono select-all">.{type.cls}</code>
                    </div>
                    <div className={`${type.cls} text-text`}>{type.sample}</div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Radius and Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="type-h3 border-b border-border/40 pb-2">Radius Boundaries</h3>
                <Card variant="outline" className="p-6 grid grid-cols-2 gap-4">
                  {[
                    { label: "sm (4px)", radius: "rounded-sm", desc: "Badges / Small UI" },
                    { label: "md (8px)", radius: "rounded-md", desc: "Buttons / Form Inputs" },
                    { label: "lg (12px)", radius: "rounded-lg", desc: "Cards / Containers" },
                    { label: "xl (16px)", radius: "rounded-xl", desc: "Modals / Dialog Panels" },
                  ].map((r) => (
                    <div key={r.label} className="flex flex-col items-center justify-between p-4 bg-surface-2 rounded-lg text-center gap-3">
                      <div className={`h-16 w-16 bg-primary/20 border border-primary/45 ${r.radius} flex items-center justify-center`} />
                      <div>
                        <p className="type-ui font-semibold text-sm">{r.label}</p>
                        <p className="type-caption text-muted mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>

              <div className="space-y-6">
                <h3 className="type-h3 border-b border-border/40 pb-2">8-Point Spacing Scales</h3>
                <Card variant="outline" className="p-6 space-y-4">
                  {[
                    { name: "space-1 (4px)", size: "w-1" },
                    { name: "space-2 (8px)", size: "w-2" },
                    { name: "space-3 (12px)", size: "w-3" },
                    { name: "space-4 (16px)", size: "w-4" },
                    { name: "space-5 (20px)", size: "w-5" },
                    { name: "space-6 (24px)", size: "w-6" },
                    { name: "space-8 (32px)", size: "w-8" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-4">
                      <code className="text-xs text-primary font-mono w-28 shrink-0">{s.name}</code>
                      <div className="flex-1 bg-surface-2 rounded-sm h-6">
                        <div className={`bg-primary h-full rounded-sm ${s.size}`} />
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </PageSection>
        )}

        {/* Section 2: COMPONENTS & STATES */}
        {activeViewSection === "components" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Component Playground</h2>
              <p className="type-body-sm text-muted">Interactive demo catalog demonstrating all primitive components, states, and accessibility bindings.</p>
            </div>

            {/* Buttons */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Button Variants & Interactive States</h3>
              <Card variant="outline" className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline Border</Button>
                  <Button variant="ghost">Ghost Trigger</Button>
                  <Button variant="danger">Destructive Action</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center">
                  <Button variant="primary" isLoading>Primary Action</Button>
                  <Button variant="secondary" isLoading>Secondary</Button>
                  <Button variant="outline" isLoading>Outline Border</Button>
                  <Button variant="ghost" isLoading>Ghost Trigger</Button>
                  <Button variant="danger" isLoading>Destructive Action</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center">
                  <Button variant="primary" disabled>Disabled Primary</Button>
                  <Button variant="secondary" disabled>Disabled Secondary</Button>
                  <Button variant="outline" disabled>Disabled Outline</Button>
                  <Button variant="ghost" disabled>Disabled Ghost</Button>
                  <Button variant="danger" disabled>Disabled Danger</Button>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="sm">Small Action</Button>
                  <Button variant="primary" size="md">Medium Default</Button>
                  <Button variant="primary" size="lg">Large Callout</Button>
                </div>
              </Card>
            </div>

            {/* Inputs & Form Fields */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Inputs & Form Layout Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card variant="outline" className="p-6 space-y-6">
                  <FormField label="Full Name Input" required helper="First and last names exactly as written in identity papers.">
                    <Input placeholder="Enter your full name..." name="fullname" />
                  </FormField>

                  <FormField label="Password Creation" required error="Password must consist of at least 8 characters.">
                    <Input type="password" showVisibilityToggle placeholder="••••••••" name="password" />
                  </FormField>

                  <FormField label="Search Inputs" helper="Accepts real-time queries.">
                    <Input icon="search" placeholder="Type here to search..." name="search" />
                  </FormField>
                </Card>

                <Card variant="outline" className="p-6 space-y-6">
                  <FormField label="Preferred Industry" required>
                    <Select
                      options={selectOptions}
                      value={selectValue}
                      onChange={(e) => setSelectValue(e.target.value)}
                      name="industry"
                    />
                  </FormField>

                  <FormField label="Searchable Combobox Option" helper="Filters option lists on client query.">
                    <Combobox
                      options={comboboxOptions}
                      value={comboboxValue}
                      onChange={(val) => setComboboxValue(val)}
                      placeholder="Select tech framework..."
                    />
                  </FormField>

                  <div className="space-y-2 text-left">
                    <span className="type-label block">Interactive Form State Data:</span>
                    <pre className="text-xs font-mono p-3 bg-surface-2 rounded-md border border-border/60">
                      {JSON.stringify({ selectValue, comboboxValue }, null, 2)}
                    </pre>
                  </div>
                </Card>
              </div>
            </div>

            {/* Overlays, Toasts, Badges, and Extra Helpers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Badges, Tooltips, Avatars, Breadcrumbs */}
              <Card variant="outline" className="p-6 space-y-6">
                <h4 className="type-h3">Status Badge Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Pending Review</Badge>
                  <Badge variant="success">Approved</Badge>
                  <Badge variant="warning">Awaiting Actions</Badge>
                  <Badge variant="error">Declined</Badge>
                  <Badge variant="info">New Listing</Badge>
                  <Badge variant="neutral">Draft Status</Badge>
                </div>

                <h4 className="type-h3 pt-2">Tooltip Overlays</h4>
                <div className="flex gap-4">
                  <Tooltip content="We enforce secure multi-factor authentication locks.">
                    <span className="cursor-help underline text-primary decoration-dotted text-sm">Hover for security tooltip</span>
                  </Tooltip>
                  <Tooltip content="Custom resume builder imports details dynamically." position="bottom">
                    <span className="cursor-help underline text-muted decoration-dotted text-sm">Hover for bottom tooltip</span>
                  </Tooltip>
                </div>

                <h4 className="type-h3 pt-2">Avatar Sizes & Initials</h4>
                <div className="flex items-center gap-4">
                  <Avatar name="Satya Nadella" size="sm" />
                  <Avatar name="Sundar Pichai" size="md" />
                  <Avatar name="Sam Altman" size="lg" />
                  <Avatar name="Mark Zuckerberg" size="xl" />
                </div>

                <h4 className="type-h3 pt-2">Path Navigator (Breadcrumbs)</h4>
                <Breadcrumbs items={breadcrumbItems} />
              </Card>

              {/* Toast & Dialog Actions */}
              <Card variant="outline" className="p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="type-h3 mb-2">Notification & Dialog Services</h4>
                  <p className="type-body-sm text-muted mb-4">Click below to trigger custom notifications or accessible native modal dialog overlays.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" onClick={() => toast.success("Operations verified successfully!")}>
                      Trigger Success
                    </Button>
                    <Button variant="secondary" onClick={() => toast.error("System settings authentication failed.")}>
                      Trigger Error
                    </Button>
                    <Button variant="secondary" onClick={() => toast.info("Profile modifications updated.")}>
                      Trigger Info
                    </Button>
                    <Button variant="secondary" onClick={() => toast.warning("Session security key expiring soon.")}>
                      Trigger Warning
                    </Button>
                  </div>

                  <Button variant="primary" className="w-full" onClick={() => setIsDialogOpen(true)}>
                    Launch Modal Dialog Overlay
                  </Button>
                </div>
              </Card>
            </div>

            {/* Tabs and Pagination */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Tab Switchers & Data Pagination</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card variant="outline" className="p-6">
                  <h4 className="type-card-title mb-4">Tabs Group Container</h4>
                  <Tabs items={tabItems} />
                </Card>

                <Card variant="outline" className="p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="type-card-title mb-2">Pagination Navigation Controller</h4>
                    <p className="type-body-sm text-muted mb-4">Handles dataset browsing windows. Navigate below to update state page indicator.</p>
                  </div>
                  <div className="pt-6">
                    <Pagination currentPage={currentPage} totalPages={10} onPageChange={(page) => setCurrentPage(page)} />
                  </div>
                </Card>
              </div>
            </div>

            {/* Dialog Demo Overlay */}
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Security Authorization Panel">
              <div className="space-y-4 text-left">
                <p className="type-body text-text">
                  To apply modifications to this organization profile configuration, confirm your security passcode below.
                </p>
                <FormField label="Identity Key Password">
                  <Input type="password" placeholder="••••••••" name="passcode" />
                </FormField>
                <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => {
                    toast.success("Security token authorized.");
                    setIsDialogOpen(false);
                  }}>Authorize</Button>
                </div>
              </div>
            </Dialog>
          </PageSection>
        )}

        {/* Section 3: REUSABLE SYSTEM STATE LAYOUTS */}
        {activeViewSection === "states" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Reusable System States</h2>
              <p className="type-body-sm text-muted">Consistent screens for asynchronous loading, fallback errors, empty queries, or disconnected networks.</p>
            </div>

            {/* Loading Skeletons */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Loading Skeleton States</h3>
              <div className="space-y-8">
                <div>
                  <span className="type-badge text-muted block mb-3">Card Grid Variant (Variant: card)</span>
                  <LoadingState variant="card" rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <span className="type-badge text-muted block mb-3">Detail Text Variant (Variant: text)</span>
                    <LoadingState variant="text" />
                  </div>
                  <div>
                    <span className="type-badge text-muted block mb-3">Avatar List Variant (Variant: list)</span>
                    <LoadingState variant="list" rows={2} />
                  </div>
                </div>
                <div>
                  <span className="type-badge text-muted block mb-3">Structured Table Variant (Variant: table)</span>
                  <LoadingState variant="table" rows={3} />
                </div>
              </div>
            </div>

            {/* Empty & Error Panels */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Placeholder Panels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="type-badge text-muted block mb-3">Zero Results Found (EmptyState)</span>
                  <EmptyState
                    title="No Job Applications Active"
                    description="You haven't submitted any candidate profiles to organizations yet. Explore open recruiter listings to apply."
                    icon="work_outline"
                    actionLabel="Find Opportunities"
                    onAction={() => toast.info("Navigating to Job Feed listing page.")}
                  />
                </div>
                <div>
                  <span className="type-badge text-muted block mb-3">Gateway Network Failure (ErrorState)</span>
                  <ErrorState
                    title="API Server Timeout"
                    description="Unable to fetch candidate experience records from the endpoint database. Check network proxy connections."
                    onRetry={() => toast.success("Retrying connection handshake...")}
                  />
                </div>
              </div>
            </div>
          </PageSection>
        )}

        {/* Section 4: RESPONSIVE VIEWPORTS */}
        {activeViewSection === "responsive" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Responsive Viewport QA</h2>
              <p className="type-body-sm text-muted">Test how standard templates scale dynamically across mobile, tablet, and desktop bounds.</p>
            </div>

            <div className="space-y-8">
              {/* Responsive Container Card Preview */}
              <div>
                <h3 className="type-h3 border-b border-border/40 pb-2 mb-4">Container Primitives Scale</h3>
                <div className="space-y-6">
                  {[
                    { label: "Container small (sm - max-w-2xl)", size: "sm" as const, bg: "bg-surface-2/40" },
                    { label: "Container medium (md - max-w-3xl)", size: "md" as const, bg: "bg-surface-2/60" },
                    { label: "Container large (lg - max-w-5xl)", size: "lg" as const, bg: "bg-surface-2/80" },
                    { label: "Container extra large (xl - max-w-7xl)", size: "xl" as const, bg: "bg-surface-3/50" },
                  ].map((cnt) => (
                    <Container key={cnt.label} size={cnt.size} className={`${cnt.bg} py-4 border border-dashed border-border text-center rounded-lg`}>
                      <span className="type-ui font-semibold text-text">{cnt.label}</span>
                    </Container>
                  ))}
                </div>
              </div>

              {/* Viewport Frame Previews */}
              <div className="space-y-6">
                <h3 className="type-h3 border-b border-border/40 pb-2">Device Layout Preview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Mobile Frame */}
                  <div className="space-y-3">
                    <span className="type-badge text-muted">Mobile Port (360px)</span>
                    <div className="border border-border/60 bg-bg rounded-xl shadow-md overflow-hidden max-w-[360px] mx-auto h-[480px] overflow-y-auto p-4 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-border/40">
                        <span className="font-semibold text-sm">JobLyne App</span>
                        <Badge variant="primary">Mobile</Badge>
                      </div>
                      <h4 className="type-h3">Open Listings</h4>
                      <Card variant="elevated" className="p-4 space-y-3">
                        <div>
                          <p className="type-card-title text-sm">Full-Stack Engineer</p>
                          <p className="type-caption">Stripe • Remote</p>
                        </div>
                        <Button variant="primary" size="sm" className="w-full">Apply Now</Button>
                      </Card>
                      <Card variant="elevated" className="p-4 space-y-3">
                        <div>
                          <p className="type-card-title text-sm">UI/UX Designer</p>
                          <p className="type-caption">Linear • SF / Hybrid</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">Save Position</Button>
                      </Card>
                    </div>
                  </div>

                  {/* Tablet Frame */}
                  <div className="space-y-3 lg:col-span-2">
                    <span className="type-badge text-muted">Tablet / Small Screen Port (768px)</span>
                    <div className="border border-border/60 bg-bg rounded-xl shadow-md overflow-hidden h-[480px] overflow-y-auto p-6 space-y-6">
                      <div className="flex justify-between items-center pb-3 border-b border-border/40">
                        <span className="font-semibold text-base">JobLyne Operations Console</span>
                        <Inline gap="sm">
                          <Badge variant="success">All Services Online</Badge>
                          <Avatar name="Satya Nadella" size="sm" />
                        </Inline>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Card variant="elevated" className="p-4 text-center">
                          <p className="type-caption text-muted">Total Applicants</p>
                          <p className="type-h2 m-0 text-primary">1,240</p>
                        </Card>
                        <Card variant="elevated" className="p-4 text-center">
                          <p className="type-caption text-muted">Active Roles</p>
                          <p className="type-h2 m-0 text-success">18</p>
                        </Card>
                        <Card variant="elevated" className="p-4 text-center">
                          <p className="type-caption text-muted">Review Pipeline</p>
                          <p className="type-h2 m-0 text-warning">42</p>
                        </Card>
                      </div>
                      <div className="space-y-3">
                        <h4 className="type-card-title">Pending Approvals</h4>
                        <div className="border border-border/40 rounded-lg divide-y divide-border/40">
                          {["Sarah Connor - Senior Architect", "John Doe - Systems Engineer"].map((app) => (
                            <div key={app} className="p-3 flex justify-between items-center bg-surface-1">
                              <span className="text-sm font-medium">{app}</span>
                              <Button variant="outline" size="sm">Evaluate</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>
        )}

        {/* Section 5: ADOPTION TRACKER */}
        {activeViewSection === "adoption" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Design System Adoption Tracker</h2>
              <p className="type-body-sm text-muted">Tracking progress metrics of global component refactoring across project directories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Metrics Summary Cards */}
              <Card variant="elevated" className="p-6 text-center space-y-2">
                <p className="type-caption text-muted">Design Primitives Replaced</p>
                <p className="text-4xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted">16 base elements created & exported</p>
              </Card>
              <Card variant="elevated" className="p-6 text-center space-y-2">
                <p className="type-caption text-muted">Feature Refactoring Status</p>
                <p className="text-4xl font-bold text-success">85%</p>
                <p className="text-xs text-muted">Candidate & Recruiter forms aligned</p>
              </Card>
              <Card variant="elevated" className="p-6 text-center space-y-2">
                <p className="type-caption text-muted">Accessibility Standards Met</p>
                <p className="text-4xl font-bold text-info">95%</p>
                <p className="text-xs text-muted">Dialogs, Forms, and Icons validated</p>
              </Card>
            </div>

            {/* Directory Tracker Table */}
            <div className="space-y-4">
              <h3 className="type-h3 border-b border-border/40 pb-2">Component Adoptions</h3>
              <div className="border border-border/60 bg-surface-1 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border/60 text-muted font-medium">
                      <th className="p-4">Component Base</th>
                      <th className="p-4">Adoption Level</th>
                      <th className="p-4">Status Tag</th>
                      <th className="p-4">Target Files Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-text">
                    {[
                      { name: "Button Primitives", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Button.tsx" },
                      { name: "Input & Selects", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Input.tsx" },
                      { name: "Layout Rows (Stack/Inline)", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Stack.tsx" },
                      { name: "Overlay Stack Providers", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/OverlayProvider.tsx" },
                      { name: "Combobox & Selects", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Combobox.tsx" },
                      { name: "Notification Toasts", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Toast.tsx" },
                      { name: "State Panels (Loading/Error)", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/LoadingState.tsx" },
                      { name: "Settings Form Migrations", adoption: "75%", status: "warning", tag: "In Progress", loc: "src/app/company/settings" },
                    ].map((comp) => (
                      <tr key={comp.name} className="hover:bg-surface-2/40 transition-colors">
                        <td className="p-4 font-semibold">{comp.name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 text-right font-medium">{comp.adoption}</span>
                            <div className="flex-1 bg-surface-2 rounded-full h-2 min-w-[60px] max-w-[100px] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  comp.status === "success" ? "bg-success" : "bg-warning"
                                }`}
                                style={{ width: comp.adoption }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={comp.status === "success" ? "success" : "warning"}>
                            {comp.tag}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs font-mono text-muted select-all">
                          {comp.loc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PageSection>
        )}
      </Container>
    </div>
  );
}
