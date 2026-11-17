"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { humanize } from "@/lib/format";

/** A select whose "all" option clears the filter. */
export function FilterSelect({ value, onChange, options, allLabel, className, labels }: { value?: string; onChange: (v: string | undefined) => void; options: readonly string[]; allLabel: string; className?: string; labels?: Record<string, string> }) {
  return (
    <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger className={className ?? "w-[180px]"}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {labels?.[o] ?? humanize(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
