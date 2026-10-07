"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getReferralAdminData, updateReferralSettings } from "@/lib/api/referrals";

export default function ReferralsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: ["admin-referrals"], queryFn: getReferralAdminData });
  const [cashbackPercent, setCashbackPercent] = useState("5");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!query.data?.settings) return;
    setCashbackPercent(String(query.data.settings.cashback_percent));
    setEnabled(query.data.settings.enabled);
  }, [query.data?.settings]);

  const save = useMutation({
    mutationFn: updateReferralSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      toast({ title: "Referral policy saved", description: "The cashback rate is now active for future rewards." });
    },
    onError: (error: any) => toast({ title: "Unable to save", description: error?.response?.data?.message || error.message, variant: "destructive" }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = Number(cashbackPercent);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      toast({ title: "Invalid percentage", description: "Enter a value from 0 to 100.", variant: "destructive" });
      return;
    }
    save.mutate({ cashbackPercent: value, enabled });
  };

  const referrals = query.data?.referrals || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Refer and Earn</h1>
        <p className="text-muted-foreground">Configure cashback and review accepted invitations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cashback policy</CardTitle>
          <CardDescription>The percentage is locked into each reward when a referred user completes a successful payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex max-w-xl flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="cashback">Cashback percentage</Label>
              <div className="relative">
                <Input id="cashback" type="number" min="0" max="100" step="0.01" value={cashbackPercent} onChange={(e) => setCashbackPercent(e.target.value)} className="pr-10" />
                <span className="absolute right-3 top-2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="enabled">Referral rewards enabled</Label>
                <p className="text-sm text-muted-foreground">Disabling this stops new cashback; existing commissions remain unchanged.</p>
              </div>
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
            </div>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save policy"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Accepted referrals</CardTitle><CardDescription>{referrals.length} completed signup{referrals.length === 1 ? "" : "s"}</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Referrer</TableHead><TableHead>Referred user</TableHead><TableHead>Accepted</TableHead><TableHead className="text-right">Commission</TableHead></TableRow></TableHeader>
            <TableBody>
              {referrals.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><div className="font-medium">{item.referrer.first_name} {item.referrer.last_name}</div><div className="text-xs text-muted-foreground">{item.referrer.email}</div></TableCell>
                  <TableCell><div className="font-medium">{item.referee.first_name} {item.referee.last_name}</div><div className="text-xs text-muted-foreground">{item.referee.email}</div></TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-medium">₦{Number(item.commission_amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
              {!query.isLoading && referrals.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No accepted referrals yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
