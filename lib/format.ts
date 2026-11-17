/** Money from the API is integer kobo. */
export const formatNaira = (kobo: number | string | bigint | null | undefined, opts: { kobo?: boolean } = {}) => {
  if (kobo === null || kobo === undefined || kobo === "") return "—";
  const n = Number(kobo) / 100;
  const hasKobo = opts.kobo ?? !Number.isInteger(n);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: hasKobo ? 2 : 0, maximumFractionDigits: 2 })}`;
};

/** Basis points as a percentage: 1500 → "15%". */
export const formatBps = (bps: number | null | undefined) => (bps === null || bps === undefined ? "—" : `${(bps / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}%`);

const LAGOS = { timeZone: "Africa/Lagos" } as const;

export const formatDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-NG", { ...LAGOS, day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleString("en-NG", { ...LAGOS, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

/** PENDING_APPROVAL → "Pending approval" */
export const humanize = (s: string | null | undefined) => (s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ") : "—");

export const fullName = (u: { first_name?: string | null; last_name?: string | null; email?: string | null } | null | undefined) =>
  u ? [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email || "—" : "—";
