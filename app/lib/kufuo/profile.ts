export function normalizeLinkedinUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const candidate = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const hostname = candidate.hostname.toLowerCase().replace(/^www\./, "");
    if (candidate.protocol !== "https:" || (hostname !== "linkedin.com" && !hostname.endsWith(".linkedin.com"))) {
      return null;
    }
    candidate.hash = "";
    return candidate.toString();
  } catch {
    return null;
  }
}

export function profileStrength(values: {
  fullName?: string | null;
  headline?: string | null;
  city?: string | null;
  bio?: string | null;
  skills?: string[];
  industries?: string[];
  languages?: string[];
  lookingFor?: string | null;
  commitment?: string | null;
  startupStage?: string | null;
  workingStyle?: string | null;
  decisionStyle?: string | null;
  equityApproach?: string | null;
  linkedinUrl?: string | null;
}) {
  const checks = [
    values.fullName,
    values.headline,
    values.city,
    values.bio,
    values.skills?.length,
    values.industries?.length,
    values.languages?.length,
    values.lookingFor,
    values.commitment,
    values.startupStage,
    values.workingStyle,
    values.decisionStyle,
    values.equityApproach,
    values.linkedinUrl,
  ];
  return Math.max(20, Math.round((checks.filter(Boolean).length / checks.length) * 100));
}
