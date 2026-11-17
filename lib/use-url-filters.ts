"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Filters kept in the URL, so the back button and shared links keep them.
 * Changing any filter other than `page` goes back to page 1.
 */
export function useUrlFilters<K extends string>() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const values = Object.fromEntries(sp.entries()) as Partial<Record<K | "page", string>>;
  const set = useCallback(
    (patch: Partial<Record<K | "page", string | undefined>>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch) as [string, string | undefined][]) {
        if (v === undefined || v === "" || v === "all") next.delete(k);
        else next.set(k, v);
      }
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname]
  );
  const page = Math.max(1, Number(values.page ?? 1) || 1);
  return { values, set, page };
}
