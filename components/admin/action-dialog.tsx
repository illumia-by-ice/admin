"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/http";

export type Field =
  | { name: string; label: string; type: "reason"; required?: boolean; placeholder?: string; hint?: string }
  | { name: string; label: string; type: "text"; required?: boolean; placeholder?: string; hint?: string; minLength?: number }
  | { name: string; label: string; type: "amount"; required?: boolean; hint?: string }
  | { name: string; label: string; type: "checkbox"; hint?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean; hint?: string };

type Values = Record<string, string | number | boolean | undefined>;

/**
 * A button that opens a confirmation dialog with optional inputs (reason,
 * amount, reference…). Validates, shows the API's error inline, toasts on
 * success, and stays open on failure so nothing is lost.
 */
export function ActionDialog({
  label,
  title,
  description,
  confirmLabel,
  fields = [],
  destructive,
  variant,
  size = "sm",
  disabled,
  onConfirm,
  success,
}: {
  label: ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  fields?: Field[];
  destructive?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  disabled?: boolean;
  onConfirm: (values: Values) => Promise<unknown>;
  success?: string | ((result: unknown) => string);
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const set = (k: string, v: string | boolean) => setValues((s) => ({ ...s, [k]: v }));

  const validate = (): Values | string => {
    const out: Values = {};
    for (const f of fields) {
      const raw = values[f.name];
      if (f.type === "checkbox") {
        out[f.name] = Boolean(raw);
        continue;
      }
      const text = typeof raw === "string" ? raw.trim() : "";
      if (!text) {
        if (f.required) return `${f.label} is required`;
        continue;
      }
      if (f.type === "reason" && text.length < 3) return `${f.label} must be at least 3 characters`;
      if (f.type === "text" && f.minLength && text.length < f.minLength) return `${f.label} must be at least ${f.minLength} characters`;
      if (f.type === "amount") {
        const n = Number(text.replace(/[,₦\s]/g, ""));
        if (!Number.isFinite(n) || n <= 0) return `${f.label} must be a positive number`;
        out[f.name] = Math.round(n * 100) / 100;
        continue;
      }
      out[f.name] = text;
    }
    return out;
  };

  const submit = async () => {
    const v = validate();
    if (typeof v === "string") return setError(v);
    setBusy(true);
    setError(null);
    try {
      const result = await onConfirm(v);
      toast({ title: typeof success === "function" ? success(result) : success ?? "Done" });
      setOpen(false);
      setValues({});
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        setOpen(o);
        if (!o) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant ?? (destructive ? "destructive" : "default")} size={size} disabled={disabled}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription asChild><div>{description}</div></DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              {f.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={Boolean(values[f.name])} onCheckedChange={(c) => set(f.name, c === true)} /> {f.label}
                </label>
              ) : (
                <>
                  <Label htmlFor={f.name}>
                    {f.label}
                    {f.required ? "" : <span className="text-muted-foreground"> (optional)</span>}
                  </Label>
                  {f.type === "select" ? (
                    <Select value={(values[f.name] as string) ?? ""} onValueChange={(v) => set(f.name, v)}>
                      <SelectTrigger id={f.name}>
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent>
                        {f.options.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "reason" ? (
                    <Textarea id={f.name} rows={3} placeholder={f.placeholder} value={(values[f.name] as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} maxLength={500} />
                  ) : (
                    <Input
                      id={f.name}
                      inputMode={f.type === "amount" ? "decimal" : undefined}
                      placeholder={f.type === "amount" ? "₦0" : f.placeholder}
                      value={(values[f.name] as string) ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  )}
                </>
              )}
              {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={submit} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
