# 🌐 JobLyne (SkillSync)

JobLyne (SkillSync) is a high-performance, multi-sided career platform and skill-matching engine built using a modern **Next.js** frontend and a robust **Django REST Framework** backend. It features subdomain routing (e.g., `recruiter.localhost:3000`, `company.localhost:3000`), secure JSON Web Token (JWT) credentials, Google OAuth integration, transactional ORM database operations, and real-time OTP validation.

---

## 📂 Project Architecture

- **`frontend/`**: A modern Next.js single-page web app using App Router, React Server Actions, and Tailwind CSS. Employs advanced cookie exchange mechanisms with the backend API.
- **`backend/`**: A robust Django REST Framework application orchestrating 8 domain schemas (Identity, Talent Marketplace, LMS, Commerce, Wallet, Advertising, Taxonomy, and Communication).
- **`database/`**: SQL schemas, migration matrices, and setup assets.
- **`storage/`**: Media assets, uploads, and static delivery pools.
- **`worker/`**: Scalable task queue workers and data processor workflows.

---

## 🛠️ Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **PostgreSQL**: Local instance or a cloud database connection (e.g., [Neon.tech](https://neon.tech))

---

## 🚀 Getting Started

### 1. Repository Setup
```bash
git clone https://github.com/0502Satya/Skillsynk.git
cd Skillsynk
```

---

### 🐍 2. Backend API Setup (Django)

1. **Navigate to backend and build virtual environment:**
   ```powershell
   cd backend
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

3. **Install exact backend requirements:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables Config:**
   Copy the example config to `.env` and fill in the target variables:
   ```bash
   copy .env.example .env
   ```
   *Required variables:*
   - `SECRET_KEY`: Django cryptographic key.
   - `DATABASE_URL`: Connection string to your PostgreSQL instance.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth sign-in credentials.
   - `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD`: SMTP email delivery.

5. **Run Migrations & Seed Mock Data:**
   ```bash
   python manage.py migrate
   python seed_jobs.py
   ```

6. **Fire up the REST Server:**
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

---

### 💻 3. Frontend Web Setup (Next.js)

1. **Navigate to the frontend folder:**
   ```bash
   cd ../frontend
   ```

2. **Install node dependencies:**
   *Note: If module resolution warnings surface, run with `--force` parameters:*
   ```bash
   npm ci --force
   ```

3. **Windows Tailwind CSS Compilation Hotfix:**
   Tailwind CSS v4 relies on lightningcss. On Windows systems where pre-built binaries are skipped, you must explicitly install the native MSVC compiler wrapper:
   ```bash
   npm install lightningcss-win32-x64-msvc
   ```

4. **Environment Variables Config:**
   Copy the example config to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   *Required variables:*
   - `NEXT_PUBLIC_API_URL`: Local API endpoint (defaults to `http://127.0.0.1:8000`).
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth consumer key for client-side authentication.

5. **Launch development server (Turbopack):**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Integration Scripts

The backend includes test scripts to verify platform health:
- **General Auth Signups**: Run `.\venv\Scripts\python test_api.py` to verify candidate registration and OTP initialization workflows.
- **Enterprise Company Flow**: Run `.\venv\Scripts\python verify_company_profile.py` to run an end-to-end verification (Sign-up -> Direct database verification simulation -> Session login -> Read Profile -> Profile edit PATCH operations).

---

## 🔒 Security & Best Practices

- **Strict Environment Governance**: Never check `.env` or `.env.local` files into version control. Ensure all new keys are mapped into both the relevant settings config and their corresponding `.env.example` templates.
- **Cookie Security**: Next.js Server Actions manage cookie storage using `httpOnly`, `secure` (in production), and `sameSite: "lax"` policies to prevent Cross-Site Scripting (XSS) vulnerability risks.

