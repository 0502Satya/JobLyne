# JobLyne Deployment Checklist & Runbook

This document serves as the operational guide for deploying the JobLyne multi-sided platform into staging and production environments.

---

## 1. Pre-Deployment Checks

### Configuration & Environment Schema Validation
- [ ] Confirm all mandatory production environment variables are configured in the release management console:
  - `SECRET_KEY` (must be a cryptographically secure random string, minimum 32 chars)
  - `DATABASE_URL` (production PostgreSQL URI)
  - `JWT_SECRET` (SimpleJWT HMAC secret key)
  - `ALLOWED_HOSTS` (strictly configured domains; no development wildcards)
  - `CORS_ALLOWED_ORIGINS` (explicit origin URLs)
  - `CSRF_TRUSTED_ORIGINS` (explicit trusted subdomains)
  - `REDIS_URL` (Redis database connection string)
- [ ] Ensure that `DEBUG` is set to `False` in the target environment.

### Security & Audits
- [ ] Verify dependency security audit status:
  - Python: `pip-audit -r backend/requirements.txt` runs cleanly.
  - Node.js: `npm audit --audit-level=high` has zero high/critical alerts.

---

## 2. Release & Database Migrations

- [ ] Lock database tables to prevent concurrent migrations from running.
- [ ] Run backend migrations:
  ```bash
  python manage.py migrate --plan   # Review the planned migrations
  python manage.py migrate          # Execute the migration
  ```
- [ ] Run roles and permission seeding:
  ```bash
  python manage.py shell -c "from apps.users.admin_views import seed_roles_and_permissions; seed_roles_and_permissions()"
  ```

---

## 3. Container & Resource Building

### Backend Service
- [ ] Build and tag backend Docker image:
  ```bash
  docker build -t joblyne-backend:latest ./backend
  ```
- [ ] Verify image runs as a non-root system user (`appuser` with UID `10001`).

### Frontend Service
- [ ] Build and tag Next.js standalone container:
  ```bash
  docker build -t joblyne-frontend:latest ./frontend
  ```
- [ ] Verify Alpine image runs as a non-root system user (`nextjs` with UID `1001`).

---

## 4. Health Checks & Post-Deployment Validation

- [ ] Check service availability via liveness and readiness endpoints:
  - Backend: `GET /api/health/` (should return 200 OK)
  - Frontend: `GET /` (should load the landing page structure)
- [ ] Check system logs for startup errors:
  - `docker logs joblyne-backend` (ensure structured JSON logs show no ImproperlyConfigured exception)

---

## 5. Rollback Procedures

If health checks fail or an unhandled exception rate spike occurs:
1. **Revert Containers**: Immediately roll back the orchestrator (Kubernetes/ECS) container tag to the last stable release SHA.
2. **Revert Migrations**: If database changes are backward-incompatible, execute a database restore from the pre-deployment snapshot.
