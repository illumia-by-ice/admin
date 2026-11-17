import { cn } from "@/lib/utils";
import { humanize } from "@/lib/format";

const TONE: Record<string, string> = {
  // good
  ACTIVE: "green", COMPLETED: "green", PAID: "green", SUCCESS: "green", DELIVERED: "green", PROCESSED: "green", APPROVED: "green", PRODUCT_RELEASED: "green", DISBURSED: "green", CAPTURED: "green",
  // waiting on someone
  PENDING_APPROVAL: "amber", PENDING_REVIEW: "amber", PENDING: "amber", MANUAL_PAYOUT: "amber", AWAITING_RELEASE: "amber", SAVING: "blue", PROCESSING: "blue", PAYOUT_PROCESSING: "blue", SHIPPED: "blue", SENDING: "blue", PARTIAL: "blue",
  // problems
  OVERDUE: "red", DEFAULTED: "red", FAILED: "red", PAYOUT_FAILED: "red", REVERSED: "red", FROZEN: "red",
  // ended
  REJECTED: "gray", CANCELLED: "gray", CLOSED: "gray", WAIVED: "gray", RELEASED: "gray", IGNORED: "gray",
};

const CLASSES: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  blue: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  gray: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const tone = CLASSES[TONE[status ?? ""] ?? "gray"];
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", tone, className)}>{humanize(status)}</span>;
}
