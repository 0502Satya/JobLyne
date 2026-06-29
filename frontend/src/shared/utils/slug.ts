export function generateJobSlug(job: { id: string; title?: string; company_name?: string; location?: string }) {
  const clean = (str?: string) =>
    (str ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  
  const titleSlug = clean(job.title);
  const companySlug = clean(job.company_name);
  const locationSlug = clean(job.location);
  
  const parts = [titleSlug, companySlug, locationSlug].filter(Boolean);
  
  return parts.length > 0 ? `${parts.join("-")}-${job.id}` : job.id;
}

export function extractJobId(slugOrId: string) {
  const parts = slugOrId.split("-");
  if (parts.length >= 5) {
    const potentialUuid = parts.slice(-5).join("-");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(potentialUuid)) {
      return potentialUuid;
    }
  }
  return slugOrId;
}
