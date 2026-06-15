# 💻 JobLyne Next.js Frontend

The frontend of JobLyne is built with **Next.js 15 (App Router)**, **React 19**, and **Tailwind CSS v4**. It implements subdomain routing for recruiters and employers and connects to the Django REST API backend.

---

## 🛠️ Tech Stack & Features

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks & Server Action handlers
- **Authentication**: Google OAuth 2.0 & JWT-based authentication
- **Features**:
  - **Three-Column Candidate Profile**: With left Scrollspy navigation, right SVG completeness indicator, and central forms.
  - **Dedicated Resume Preview**: Located at `/dashboard/resume-preview`, styled specifically for A4 standard printing and automatic PDF rendering when `?print=true` is present.
  - **Subdomain Routing Middleware**: Subdomains map to `/recruiter`, `/company`, or candidate dashboards natively.

---

## 🚀 Getting Started

### 1. Installation

1. Install npm packages:
   ```bash
   npm install
   ```

2. **Windows compilation wrapper** (Tailwind CSS v4 uses `lightningcss` which requires a native MSVC wrapper on Windows):
   ```bash
   npm install lightningcss-win32-x64-msvc
   ```

---

### 2. Environment Variables

Create `.env.local` inside this directory:
```bash
copy .env.example .env.local
```

Fill in the required variables:
- `NEXT_PUBLIC_API_URL`: Backend REST API base URL (defaults to `http://127.0.0.1:8000`).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: OAuth credentials for client side login.
- `JWT_SECRET`: The symmetric JWT signing key (must match Django settings). Generate using:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

---

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified) in your browser.

---

### 4. Build for Production

```bash
npm run build
```

This compiles TypeScript definitions and checks static page generation constraints.
