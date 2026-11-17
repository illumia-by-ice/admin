"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/http";

export type SettingField =
  | { key: string; label: string; type: "number"; hint?: string; unit?: "naira" | "percent" | "days" | "count"; min?: number }
  | { key: string; label: string; type: "boolean"; hint?: string }
  | { key: string; label: string; type: "select"; hint?: string; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "list"; hint?: string }
  /** Per-term rates, e.g. { "MONTHLY:12": 2500 } edited as lines "MONTHLY:12 = 25". */
  | { key: string; label: string; type: "tenureMap"; hint?: string };

/** Keys may be dotted paths into nested settings ("lateFee.value"). */
export const getPath = (obj: Record<string, any>, path: string) => path.split(".").reduce<any>((o, k) => (o == null ? undefined : o[k]), obj);
export const setPath = (obj: Record<string, any>, path: string, v: unknown) => {
  const keys = path.split(".");
  let o = obj;
  keys.slice(0, -1).forEach((k) => (o = o[k] = typeof o[k] === "object" && o[k] !== null ? o[k] : {}));
  o[keys[keys.length - 1]] = v;
  return obj;
};
/** Deep merge for plain objects (arrays and values are replaced). */
export const deepMerge = (base: Record<string, any>, patch: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" ? deepMerge(base[k], v) : v;
  return out;
};

/**
 * Edits a flat settings object. Percent fields are shown as % and stored as
 * basis points; only changed fields are sent, with a reason for the audit log.
 */
export function SettingsForm({ fields, value, onSave, disabled, note }: { fields: SettingField[]; value: Record<string, any>; onSave: (patch: Record<string, unknown>, reason?: string) => Promise<unknown>; disabled?: boolean; note?: string }) {
  const toDisplay = (f: SettingField, v: any) =>
    f.type === "number" && f.unit === "percent"
      ? String((v ?? 0) / 100)
      : f.type === "list"
        ? (v ?? []).join(", ")
        : f.type === "tenureMap"
          ? Object.entries((v ?? {}) as Record<string, number>).map(([k, bps]) => `${k} = ${bps / 100}`).join("\n")
          : f.type === "number"
            ? String(v ?? "")
            : v;
  const initial = () => Object.fromEntries(fields.map((f) => [f.key, toDisplay(f, getPath(value, f.key))]));
  const [draft, setDraft] = useState<Record<string, any>>(initial);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDraft(initial()), [value]);

  const parse = (f: SettingField, raw: any): unknown => {
    if (f.type === "boolean" || f.type === "select") return raw;
    if (f.type === "list") return String(raw).split(/[\s,]+/).filter(Boolean).map(Number);
    if (f.type === "tenureMap") {
      const out: Record<string, number> = {};
      for (const line of String(raw).split("\n").map((l) => l.trim()).filter(Boolean)) {
        const m = line.match(/^(WEEKLY|MONTHLY):(\d{1,3})\s*=\s*([\d.]+)\s*%?$/i);
        if (!m) throw new Error(`${f.label}: write each line like “MONTHLY:12 = 25”`);
        out[`${m[1].toUpperCase()}:${m[2]}`] = Math.round(Number(m[3]) * 100);
      }
      return out;
    }
    const n = Number(String(raw).replace(/[,₦%\s]/g, ""));
    if (!Number.isFinite(n)) throw new Error(`${f.label} must be a number`);
    return f.unit === "percent" ? Math.round(n * 100) : n;
  };

  const changed = fields.filter((f) => JSON.stringify(draft[f.key]) !== JSON.stringify(toDisplay(f, getPath(value, f.key))));

  const save = async () => {
    setError(null);
    try {
      const patch: Record<string, unknown> = {};
      for (const f of changed) {
        const v = parse(f, draft[f.key]);
        if (f.type === "list" && (v as number[]).some((x) => !Number.isInteger(x) || x < 0)) throw new Error(`${f.label}: whole numbers only`);
        setPath(patch, f.key, v);
      }
      setBusy(true);
      await onSave(patch, reason.trim() || undefined);
      setReason("");
      toast({ title: "Settings saved" });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            {f.type === "boolean" ? (
              <label className="flex items-center justify-between gap-3 rounded-md border p-3">
                <span className="text-sm font-medium">{f.label}</span>
                <Switch checked={Boolean(draft[f.key])} disabled={disabled} onCheckedChange={(c) => setDraft((d) => ({ ...d, [f.key]: c }))} />
              </label>
            ) : (
              <>
                <Label htmlFor={f.key}>
                  {f.label}
                  {f.type === "number" && f.unit === "naira" ? " (₦)" : f.type === "number" && f.unit === "percent" ? " (%)" : f.type === "number" && f.unit === "days" ? " (days)" : ""}
                </Label>
                {f.type === "select" ? (
                  <Select value={draft[f.key]} disabled={disabled} onValueChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}>
                    <SelectTrigger id={f.key}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "tenureMap" ? (
                  <Textarea id={f.key} rows={3} disabled={disabled} placeholder="MONTHLY:12 = 25" value={draft[f.key] ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />
                ) : (
                  <Input id={f.key} disabled={disabled} inputMode={f.type === "number" ? "decimal" : undefined} value={draft[f.key] ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />
                )}
              </>
            )}
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
          </div>
        ))}
      </div>
      {!disabled && (
        <div className="space-y-3 border-t pt-4">
          {note && <p className="text-sm text-muted-foreground">{note}</p>}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for the change (kept in the audit log)</Label>
            <Textarea id="reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} />
          </div>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={busy || changed.length === 0}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save {changed.length ? `${changed.length} change${changed.length > 1 ? "s" : ""}` : ""}
            </Button>
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => setDraft(initial())} disabled={busy}>
                Discard
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
