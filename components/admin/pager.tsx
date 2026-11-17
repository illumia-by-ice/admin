import { Button } from "@/components/ui/button";

export function Pager({ page, totalPages, total, onPage }: { page: number; totalPages?: number; total?: number; onPage: (p: number) => void }) {
  const last = Math.max(1, totalPages ?? 1);
  return (
    <div className="flex items-center justify-between gap-2 pt-4 text-sm text-muted-foreground">
      <span>{total !== undefined ? `${total.toLocaleString()} total` : ""}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {last}
        </span>
        <Button variant="outline" size="sm" disabled={page >= last} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
