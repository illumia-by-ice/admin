import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/http";

/** Loading / error / empty handling for a query, so every page behaves the same. */
export function QueryState({ isLoading, error, isEmpty, empty, onRetry, children }: { isLoading: boolean; error: unknown; isEmpty?: boolean; empty?: ReactNode; onRetry?: () => void; children: ReactNode }) {
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">{errorMessage(error)}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  if (isEmpty)
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <Inbox className="h-6 w-6" />
        <p className="text-sm">{empty ?? "Nothing here yet."}</p>
      </div>
    );
  return <>{children}</>;
}
