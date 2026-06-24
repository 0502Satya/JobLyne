"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Checkbox,
  RadioGroup,
  RadioItem,
  Toggle,
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
  Table,
  Column,
  SortKey,
  Text,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonButton,
  SkeletonInput,
  SkeletonList,
  SkeletonCard,
  SkeletonTable,
} from "@/shared/ui";

interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  rating: number;
  joinedDate: string;
}

const mockCandidates: Candidate[] = Array.from({ length: 100 }, (_, i) => ({
  id: `CAND-${i + 1000}`,
  name: [
    "Jane Cooper", "Devon Lane", "Courtney Henry", "Wade Warren",
    "Theresa Webb", "Albert Flores", "Eleanor Pena", "Darlene Robertson",
    "Floyd Miles", "Arlene McCoy", "Kristin Watson", "Leslie Alexander"
  ][i % 12] + ` ${String.fromCharCode(65 + (i % 26))}.`,
  role: [
    "Software Engineer", "Product Manager", "UI/UX Designer",
    "QA Analyst", "Data Scientist", "DevOps Specialist", "Marketing Director"
  ][i % 7],
  email: `candidate.${i + 1}@example.com`,
  status: ["Pending", "Approved", "Reviewing", "Declined"][i % 4],
  rating: (i % 5) + 1,
  joinedDate: `2026-0${(i % 5) + 1}-15`,
}));

export default function StyleguidePage() {
  // Local states for interactive demos
  const [comboboxValue, setComboboxValue] = useState("");
  const [selectValue, setSelectValue] = useState("option-1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeViewSection, setActiveViewSection] = useState("tokens");

  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [checkboxIndeterminate, setCheckboxIndeterminate] = useState(true);
  const [radioValue, setRadioValue] = useState("premium");
  const [toggleChecked, setToggleChecked] = useState(false);

  // Grid states
  const [gridDensity, setGridDensity] = useState<"comfortable" | "compact">("comfortable");
  const [gridVisibleColumns, setGridVisibleColumns] = useState<string[]>(["id", "name", "role", "status", "rating", "joinedDate"]);
  const [gridSelectedIds, setGridSelectedIds] = useState<Set<string>>(new Set());
  const [gridSortKeys, setGridSortKeys] = useState<SortKey[]>([]);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [isGridError, setIsGridError] = useState(false);
  const [isGridOffline, setIsGridOffline] = useState(false);

  // Playground states for Foundations & Forms
  const [playbookTextWeight, setPlaybookTextWeight] = useState<"regular" | "medium" | "semibold" | "bold">("regular");
  const [playbookTextAlign, setPlaybookTextAlign] = useState<"left" | "center" | "right">("left");
  const [playbookTextTruncate, setPlaybookTextTruncate] = useState(false);
  const [playbookTextClamp, setPlaybookTextClamp] = useState(0);
  const [playbookTextColor, setPlaybookTextColor] = useState<any>("default");
  const [playbookTextAs, setPlaybookTextAs] = useState<any>("span");
  const [playbookSkeletonAnim, setPlaybookSkeletonAnim] = useState<"pulse" | "wave" | "none">("pulse");
  const [playbookFieldStatus, setPlaybookFieldStatus] = useState<any>("default");
  const [playbookFieldHelper, setPlaybookFieldHelper] = useState("Provide industry accreditation registration code.");
  const [playbookFieldError, setPlaybookFieldError] = useState("");

  const gridColumns: Column<Candidate>[] = [
    {
      key: "id",
      header: "ID",
      width: 100,
      pinned: "left",
      sortable: true,
      accessor: "id",
    },
    {
      key: "name",
      header: "Candidate Name",
      width: 180,
      pinned: "left",
      sortable: true,
      accessor: "name",
      meta: {
        cellClassName: "font-semibold text-primary",
      },
    },
    {
      key: "role",
      header: "Applied Role",
      width: 180,
      sortable: true,
      accessor: "role",
    },
    {
      key: "email",
      header: "Email Address",
      width: 220,
      accessor: "email",
    },
    {
      key: "status",
      header: "Status",
      width: 120,
      sortable: true,
      accessor: "status",
      render: (_, value) => {
        const variant = {
          Pending: "warning",
          Approved: "success",
          Reviewing: "info",
          Declined: "error",
        }[value as string] || "neutral";
        return <Badge variant={variant as any}>{value}</Badge>;
      },
    },
    {
      key: "rating",
      header: "Rating",
      width: 100,
      sortable: true,
      align: "center",
      accessor: "rating",
      render: (_, value) => <span className="font-medium text-amber-500">{"★".repeat(value)}</span>,
    },
    {
      key: "joinedDate",
      header: "Joined Date",
      width: 140,
      sortable: true,
      accessor: "joinedDate",
    },
  ];

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
                { id: "foundations", label: "Foundations & Forms", icon: "menu_book" },
                { id: "components", label: "Components & States", icon: "category" },
                { id: "states", label: "System States", icon: "sync" },
                { id: "responsive", label: "Responsive QA", icon: "devices" },
                { id: "grids", label: "Enterprise Grids", icon: "grid_on" },
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

        {/* Section 1.5: FOUNDATIONS & FORMS */}
        {activeViewSection === "foundations" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Typography & Skeletons Foundations</h2>
              <p className="type-body-sm text-muted">
                Inspect typographic scales, composable loading placeholders, state panels, and status-validated form field controls.
              </p>
            </div>

            {/* Typography Playground */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Centralized Text Scales</h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Text Variant Controls */}
                <Card variant="outline" className="p-6 space-y-6 h-fit lg:col-span-1">
                  <h4 className="type-card-title mb-4">Text Prop Controllers</h4>
                  <FormField label="Font weight">
                    <Select
                      options={[
                        { value: "regular", label: "Regular (weight-body)" },
                        { value: "medium", label: "Medium (weight-ui)" },
                        { value: "semibold", label: "Semibold (weight-heading)" },
                        { value: "bold", label: "Bold (weight-display)" },
                      ]}
                      value={playbookTextWeight}
                      onChange={(e) => setPlaybookTextWeight(e.target.value as any)}
                    />
                  </FormField>
                  <FormField label="Alignment">
                    <Select
                      options={[
                        { value: "left", label: "Left" },
                        { value: "center", label: "Center" },
                        { value: "right", label: "Right" },
                      ]}
                      value={playbookTextAlign}
                      onChange={(e) => setPlaybookTextAlign(e.target.value as any)}
                    />
                  </FormField>
                  <FormField label="Text color">
                    <Select
                      options={[
                        { value: "default", label: "Default" },
                        { value: "primary", label: "Primary" },
                        { value: "muted", label: "Muted" },
                        { value: "text", label: "Text Color" },
                        { value: "error", label: "Error Red" },
                        { value: "success", label: "Success Green" },
                        { value: "warning", label: "Warning Amber" },
                        { value: "info", label: "Info Blue" },
                      ]}
                      value={playbookTextColor}
                      onChange={(e) => setPlaybookTextColor(e.target.value as any)}
                    />
                  </FormField>
                  <FormField label="Render as HTML tag">
                    <Select
                      options={[
                        { value: "span", label: "span" },
                        { value: "p", label: "p" },
                        { value: "h1", label: "h1" },
                        { value: "h2", label: "h2" },
                        { value: "code", label: "code" },
                        { value: "a", label: "a (link)" },
                      ]}
                      value={playbookTextAs}
                      onChange={(e) => setPlaybookTextAs(e.target.value as any)}
                    />
                  </FormField>
                  <div className="flex flex-col gap-4 pt-2 border-t border-border/40">
                    <Toggle
                      label="Truncate single line"
                      checked={playbookTextTruncate}
                      onChange={setPlaybookTextTruncate}
                    />
                    <FormField label="Multi-line Clamp Limits" helper="Clamps description text after X lines.">
                      <Select
                        options={[
                          { value: "0", label: "No clamp (Default)" },
                          { value: "1", label: "1 line limit" },
                          { value: "2", label: "2 lines limit" },
                          { value: "3", label: "3 lines limit" },
                        ]}
                        value={String(playbookTextClamp)}
                        onChange={(e) => setPlaybookTextClamp(Number(e.target.value))}
                      />
                    </FormField>
                  </div>
                </Card>

                {/* Text Scale Preview */}
                <Card variant="outline" className="p-6 lg:col-span-3 divide-y divide-border/40 space-y-4">
                  {[
                    { tag: "Display", variant: "display" as const, sample: "Career Intelligence" },
                    { tag: "H1 / Hero Title", variant: "h1" as const, sample: "Verify Candidate Portfolio" },
                    { tag: "H2 / Section Title", variant: "h2" as const, sample: "Database Credentials Config" },
                    { tag: "H3 / Block Title", variant: "h3" as const, sample: "Accreditation Details" },
                    { tag: "Title", variant: "title" as const, sample: "Lead Software Architect" },
                    { tag: "Subtitle", variant: "subtitle" as const, sample: "Enterprise integrations layer" },
                    { tag: "Body Text", variant: "body" as const, sample: "Reducing cognitive load via standard component states, sensible default inputs, and progressive disclosure cards." },
                    { tag: "Body Small", variant: "body-sm" as const, sample: "Helper details mapping to aria-describedby nodes." },
                    { tag: "Caption Info", variant: "caption" as const, sample: "Last synced 5 minutes ago" },
                    { tag: "Label Text", variant: "label" as const, sample: "ORGANIZATION IDENTIFIER" },
                    { tag: "UI Links / Buttons", variant: "ui" as const, sample: "Review Details" },
                    { tag: "Badge Label", variant: "badge" as const, sample: "CONTRACTOR" },
                    { tag: "Overline Label", variant: "overline" as const, sample: "PREMIUM SERVICES" },
                    { tag: "Code block", variant: "code" as const, sample: "npm run dev --port=3000" },
                    { tag: "Hyperlink Style", variant: "link" as const, sample: "Read the API documentation" },
                  ].map((type) => (
                    <div key={type.tag} className="flex flex-col md:flex-row md:items-start py-4 first:pt-0 last:pb-0 gap-2 md:gap-8 text-left">
                      <div className="w-40 shrink-0">
                        <span className="type-badge text-muted block">{type.tag}</span>
                        <code className="text-[10px] text-primary font-mono select-all">variant="{type.variant}"</code>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <Text
                          as={playbookTextAs}
                          variant={type.variant}
                          weight={playbookTextWeight}
                          align={playbookTextAlign}
                          truncate={playbookTextTruncate}
                          clamp={playbookTextClamp === 0 ? undefined : playbookTextClamp}
                          color={playbookTextColor === "default" ? undefined : playbookTextColor}
                        >
                          {type.sample}
                        </Text>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>

            {/* Composable Skeleton Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h3 className="type-h3">Composable Loading Placeholders</h3>
                <Inline gap="sm">
                  <span className="type-label">Animation Shimmer:</span>
                  <Select
                    size="sm"
                    options={[
                      { value: "pulse", label: "Pulse Shimmer" },
                      { value: "wave", label: "Wave Shimmer" },
                      { value: "none", label: "Static" },
                    ]}
                    value={playbookSkeletonAnim}
                    onChange={(e) => setPlaybookSkeletonAnim(e.target.value as any)}
                  />
                </Inline>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primitive Skeletons */}
                <Card variant="outline" className="p-6 space-y-6 text-left">
                  <h4 className="type-card-title">Primitive Elements</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <SkeletonAvatar size={40} animation={playbookSkeletonAnim} />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton variant="text" animation={playbookSkeletonAnim} width="40%" />
                        <Skeleton variant="text" animation={playbookSkeletonAnim} width="70%" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="type-caption text-muted">SkeletonInput & SkeletonButton primitives:</span>
                      <SkeletonInput animation={playbookSkeletonAnim} />
                      <SkeletonButton animation={playbookSkeletonAnim} />
                    </div>
                  </div>
                </Card>

                {/* Compound Mockup Skeletons */}
                <Card variant="outline" className="p-6 space-y-6 lg:col-span-2 text-left">
                  <h4 className="type-card-title">Component Block Compositions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <span className="type-badge text-muted">SkeletonCard composition:</span>
                      <SkeletonCard animation={playbookSkeletonAnim} />
                    </div>
                    <div className="space-y-3">
                      <span className="type-badge text-muted">SkeletonList composition:</span>
                      <SkeletonList rows={3} animation={playbookSkeletonAnim} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Skeleton Table */}
              <Card variant="outline" className="p-6 text-left">
                <h4 className="type-card-title mb-4">SkeletonTable (Tabular Loading Mockup)</h4>
                <SkeletonTable rows={3} columns={5} animation={playbookSkeletonAnim} />
              </Card>
            </div>

            {/* Empty & Error State Preset Gallery */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Error & Empty State Preset Catalog</h3>
              
              {/* Empty state list */}
              <div className="space-y-3 text-left">
                <span className="type-badge text-muted">Empty State Preset Varieties</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {["search", "permissions", "offline", "favorites"].map((pr) => (
                    <Card key={pr} variant="outline" className="p-4 flex flex-col justify-between">
                      <EmptyState preset={pr as any} className="border-0 bg-transparent p-0" />
                      <div className="text-center pt-3 mt-3 border-t border-border/10">
                        <code className="text-xs text-primary font-mono">preset="{pr}"</code>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Error state list */}
              <div className="space-y-3 text-left pt-4">
                <span className="type-badge text-muted">Error State Preset Varieties</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["network", "server", "permission"].map((ty) => (
                    <Card key={ty} variant="outline" className="p-4 flex flex-col justify-between">
                      <ErrorState type={ty as any} onRetry={() => toast.info(`Retrying ${ty} connection.`)} className="border-0 bg-transparent p-0" />
                      <div className="text-center pt-3 mt-3 border-t border-border/10">
                        <code className="text-xs text-primary font-mono">type="{ty}"</code>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation & FormField Status Playground */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Interactive Field Status & Form Validation</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FormField Status Configuration */}
                <Card variant="outline" className="p-6 space-y-6 text-left">
                  <h4 className="type-card-title">FormField Controls</h4>
                  <FormField label="Choose active status">
                    <Select
                      options={[
                        { value: "default", label: "Default" },
                        { value: "success", label: "Success (Valid)" },
                        { value: "warning", label: "Warning Alert" },
                        { value: "info", label: "Information State" },
                        { value: "error", label: "Error (Invalid)" },
                      ]}
                      value={playbookFieldStatus}
                      onChange={(e) => setPlaybookFieldStatus(e.target.value as any)}
                    />
                  </FormField>
                  <FormField label="Helper / success text description">
                    <Input
                      value={playbookFieldHelper}
                      onChange={(e) => setPlaybookFieldHelper(e.target.value)}
                      placeholder="Type custom helper text..."
                      name="helperText"
                    />
                  </FormField>
                  <FormField label="Error label override" helper="Active when status is error or error exists.">
                    <Input
                      value={playbookFieldError}
                      onChange={(e) => setPlaybookFieldError(e.target.value)}
                      placeholder="Type validation error..."
                      name="validationError"
                    />
                  </FormField>
                </Card>

                {/* FormField Live Sandbox */}
                <Card variant="outline" className="p-6 lg:col-span-2 text-left flex flex-col justify-between">
                  <div>
                    <h4 className="type-card-title mb-2">Live Status Viewport</h4>
                    <p className="type-body-sm text-muted mb-4 font-normal">
                      FormField intercepts status and overlays border rings and Lucide indicator badges automatically.
                    </p>
                  </div>
                  <div className="py-6">
                    <FormField
                      label="Job registry passcode"
                      required
                      status={playbookFieldStatus === "default" ? undefined : playbookFieldStatus}
                      helper={playbookFieldHelper}
                      error={playbookFieldError}
                    >
                      <Input placeholder="Enter passcode..." name="passcodePlayground" />
                    </FormField>
                  </div>
                  <div className="pt-4 border-t border-border/40">
                    <code className="text-xs text-muted block font-mono">
                      &lt;FormField status="{playbookFieldStatus}" error="{playbookFieldError}"&gt;
                    </code>
                  </div>
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
                  <FormField label="Full name input" required helper="First and last names exactly as written in identity papers.">
                    <Input placeholder="Enter your full name..." name="fullname" />
                  </FormField>

                  <FormField label="Password creation" required error="Password must consist of at least 8 characters.">
                    <Input type="password" showVisibilityToggle placeholder="••••••••" name="password" />
                  </FormField>

                  <FormField label="Search inputs" helper="Accepts real-time queries.">
                    <Input icon="search" placeholder="Type here to search..." name="search" />
                  </FormField>
                </Card>

                <Card variant="outline" className="p-6 space-y-6">
                  <FormField label="Preferred industry" required>
                    <Select
                      options={selectOptions}
                      value={selectValue}
                      onChange={(e) => setSelectValue(e.target.value)}
                      name="industry"
                    />
                  </FormField>

                  <FormField label="Searchable combobox option" helper="Filters option lists on client query.">
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

            {/* Checkbox, RadioGroup & Toggle Switches */}
            <div className="space-y-6">
              <h3 className="type-h3 border-b border-border/40 pb-2">Checkboxes, Radio Groups & Toggles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Checkbox Card */}
                <Card variant="outline" className="p-6 space-y-6">
                  <h4 className="type-card-title">Checkbox Options & States</h4>
                  <div className="space-y-4">
                    <Checkbox
                      label="Standard checkbox"
                      checked={checkboxChecked}
                      onChange={(e) => setCheckboxChecked(e.target.checked)}
                      helper="Interactive default checkbox state."
                    />
                    <Checkbox
                      label="Indeterminate/mixed state"
                      checked={false}
                      indeterminate={checkboxIndeterminate}
                      onChange={() => setCheckboxIndeterminate(!checkboxIndeterminate)}
                      helper="Click to toggle indeterminate state."
                    />
                    <Checkbox
                      label="Valid checkbox state"
                      checked={true}
                      state="valid"
                      helper="Explicitly validated valid state."
                    />
                    <Checkbox
                      label="Error checkbox state"
                      error="You must agree to the Terms of service to continue."
                      required
                    />
                    <Checkbox
                      label="Disabled checkbox"
                      disabled
                      checked={true}
                    />
                  </div>
                </Card>

                {/* RadioGroup Card */}
                <Card variant="outline" className="p-6 space-y-6">
                  <h4 className="type-card-title">Radio Group (fieldset / legend)</h4>
                  <RadioGroup
                    label="Select organization plan"
                    value={radioValue}
                    onChange={setRadioValue}
                    helper="Roving focus: Arrow keys cycle and select."
                  >
                    <RadioItem value="free" label="Free tier" />
                    <RadioItem value="premium" label="Premium plan (selected)" />
                    <RadioItem value="enterprise" label="Enterprise custom" />
                    <RadioItem value="disabled-opt" label="Disabled option" disabled />
                  </RadioGroup>
                  <div className="pt-2 border-t border-border/40">
                    <RadioGroup
                      label="Validation states (error)"
                      defaultValue="err-1"
                      error="Please fix plan configuration mismatch."
                      state="error"
                    >
                      <RadioItem value="err-1" label="Mismatched option 1" />
                      <RadioItem value="err-2" label="Mismatched option 2" />
                    </RadioGroup>
                  </div>
                </Card>

                {/* Toggle Switches Card */}
                <Card variant="outline" className="p-6 space-y-6">
                  <h4 className="type-card-title">Switch Toggles (Immediate Effect)</h4>
                  <div className="space-y-6">
                    <Toggle
                      label="Standard toggle switch"
                      checked={toggleChecked}
                      onChange={setToggleChecked}
                      helper="Toggle status change applies immediately."
                    />
                    <div className="space-y-2">
                      <span className="type-label block text-muted">Sizes (with &gt;= 44px touch targets):</span>
                      <div className="flex flex-col gap-1">
                        <Toggle size="sm" checked={true} label="Small Switch (sm)" />
                        <Toggle size="md" checked={true} label="Medium Switch (md)" />
                        <Toggle size="lg" checked={true} label="Large Switch (lg)" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
                      <Toggle
                        label="Error validation toggle"
                        checked={false}
                        error="MFA check failed."
                        state="error"
                      />
                      <Toggle
                        label="Disabled toggle switch"
                        disabled
                        checked={true}
                      />
                    </div>
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
            <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Security authorization panel">
              <div className="space-y-4 text-left">
                <p className="type-body text-text">
                  To apply modifications to this organization profile configuration, confirm your security passcode below.
                </p>
                <FormField label="Identity key password">
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
                    title="No job applications active"
                    description="You haven't submitted any candidate profiles to organizations yet. Explore open recruiter listings to apply."
                    icon="work_outline"
                    actionLabel="Find opportunities"
                    onAction={() => toast.info("Navigating to Job Feed listing page.")}
                  />
                </div>
                <div>
                  <span className="type-badge text-muted block mb-3">Gateway Network Failure (ErrorState)</span>
                  <ErrorState
                    title="API server timeout"
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
                        <Button variant="primary" size="sm" className="w-full">Apply now</Button>
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

        {/* Section 4b: ENTERPRISE GRIDS */}
        {activeViewSection === "grids" && (
          <PageSection className="space-y-12">
            <div>
              <h2 className="type-h2 mb-2">Enterprise Grids & Tables</h2>
              <p className="type-body-sm text-muted">
                High-performance decoupled grid featuring column pinning, drag-resizing, multi-column sorting, bulk checkbox selection, and full roving cell keyboard navigation.
              </p>
            </div>

            {/* Grid Configuration Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Density and States Controls */}
              <Card variant="outline" className="p-6 space-y-6">
                <h4 className="type-card-title">Grid Configuration</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="type-label block text-muted">Density Settings:</span>
                    <div className="flex gap-2">
                      <Button
                        variant={gridDensity === "comfortable" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setGridDensity("comfortable")}
                      >
                        Comfortable
                      </Button>
                      <Button
                        variant={gridDensity === "compact" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setGridDensity("compact")}
                      >
                        Compact
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="type-label block text-muted">Simulate States:</span>
                    <div className="space-y-3">
                      <Toggle
                        label="Loading state"
                        checked={isGridLoading}
                        onChange={(checked) => {
                          setIsGridLoading(checked);
                          if (checked) {
                            setIsGridError(false);
                            setIsGridOffline(false);
                          }
                        }}
                      />
                      <Toggle
                        label="Error state"
                        checked={isGridError}
                        onChange={(checked) => {
                          setIsGridError(checked);
                          if (checked) {
                            setIsGridLoading(false);
                            setIsGridOffline(false);
                          }
                        }}
                      />
                      <Toggle
                        label="Offline state"
                        checked={isGridOffline}
                        onChange={(checked) => {
                          setIsGridOffline(checked);
                          if (checked) {
                            setIsGridLoading(false);
                            setIsGridError(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Columns Visibility Chooser */}
              <Card variant="outline" className="p-6 space-y-6">
                <h4 className="type-card-title">Column Chooser</h4>
                <div className="space-y-3">
                  {[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Candidate Name" },
                    { key: "role", label: "Applied Role" },
                    { key: "email", label: "Email Address" },
                    { key: "status", label: "Status" },
                    { key: "rating", label: "Rating" },
                    { key: "joinedDate", label: "Joined Date" },
                  ].map((col) => {
                    const isVisible = gridVisibleColumns.includes(col.key);
                    const isNameOrId = col.key === "name" || col.key === "id";
                    return (
                      <Checkbox
                        key={col.key}
                        label={col.label}
                        checked={isVisible}
                        disabled={isNameOrId}
                        onChange={(e) => {
                          if (isNameOrId) return;
                          if (e.target.checked) {
                            setGridVisibleColumns([...gridVisibleColumns, col.key]);
                          } else {
                            setGridVisibleColumns(gridVisibleColumns.filter((k) => k !== col.key));
                          }
                        }}
                        helper={isNameOrId ? "Pinned columns cannot be hidden" : undefined}
                      />
                    );
                  })}
                </div>
              </Card>

              {/* Selection Logger card */}
              <Card variant="outline" className="p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="type-card-title mb-2">Selection & Sorting Info</h4>
                  <p className="type-caption text-muted">
                    Tracks active user states from callbacks in real-time.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-surface-2 rounded-lg border border-border/40 text-xs font-mono space-y-2">
                    <div>
                      <span className="font-semibold text-primary block mb-0.5">Selected Count:</span>
                      {gridSelectedIds.size} rows selected
                    </div>
                    <div>
                      <span className="font-semibold text-primary block mb-0.5">Active Sort Keys:</span>
                      {gridSortKeys.length > 0
                        ? gridSortKeys.map((sk) => `${sk.key} (${sk.direction})`).join(", ")
                        : "None"}
                    </div>
                  </div>
                  {gridSelectedIds.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        toast.info(`Processing ${gridSelectedIds.size} applications`);
                        setGridSelectedIds(new Set());
                      }}
                    >
                      Process Selected Batch
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Grid component frame */}
            <div className="space-y-4">
              <h3 className="type-h3 border-b border-border/40 pb-2">Live Grid Sandbox</h3>
              <div className="p-1 bg-surface-2 border border-border/60 rounded-3xl overflow-hidden shadow-inner">
                <Table
                  columns={gridColumns}
                  data={mockCandidates}
                  getRowId={(r) => r.id}
                  state={{
                    density: gridDensity,
                    visibleColumns: gridVisibleColumns,
                    selectedRowIds: gridSelectedIds,
                    sortKeys: gridSortKeys,
                    columnWidths: {},
                    focusedCell: null,
                    filters: [],
                  }}
                  onStateChange={(nextState) => {
                    setGridDensity(nextState.density);
                    setGridVisibleColumns(nextState.visibleColumns);
                    setGridSelectedIds(nextState.selectedRowIds);
                    setGridSortKeys(nextState.sortKeys);
                  }}
                  features={{
                    selection: { enabled: true, multiple: true },
                    virtualization: { enabled: true, containerHeight: 400, overscan: 8 },
                    sorting: { enabled: true },
                  }}
                  slots={{
                    Loading: isGridLoading ? (
                      <div className="space-y-3 p-6 animate-pulse bg-surface-1">
                        <div className="h-6 bg-surface-2 rounded w-3/4" />
                        <div className="h-6 bg-surface-2 rounded w-5/6" />
                        <div className="h-6 bg-surface-2 rounded w-2/3" />
                      </div>
                    ) : undefined,
                    Error: isGridError ? (
                      <div className="flex flex-col items-center justify-center p-8 text-error bg-surface-1">
                        <span className="text-sm font-semibold mb-1">Data Handshake Timeout</span>
                        <span className="text-xs">Database sync error. Please try again.</span>
                      </div>
                    ) : undefined,
                    Offline: isGridOffline ? (
                      <div className="flex flex-col items-center justify-center p-8 text-muted bg-surface-1">
                        <span className="text-sm font-semibold mb-1">Internet Connection Disconnected</span>
                        <span className="text-xs">Verify local network and proxy settings.</span>
                      </div>
                    ) : undefined,
                  }}
                  actions={(row) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success(`Evaluating candidate: ${row.name}`)}
                    >
                      Evaluate
                    </Button>
                  )}
                />
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
                      { name: "Checkboxes & Indeterminate", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Checkbox.tsx" },
                      { name: "RadioGroup Primitives", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/RadioGroup.tsx" },
                      { name: "Switch Toggles", adoption: "100%", status: "success", tag: "Complete", loc: "src/shared/ui/Toggle.tsx" },
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
