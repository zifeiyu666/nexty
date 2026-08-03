"use client";

import { getActivity, type AdminActivityRecord } from "@/actions/activity/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 20;
const FEATURES = ["song", "lyrics", "story", "cover", "voice", "music_video", "wall_art", "share", "payment", "entitlement"];
const OUTCOMES = ["started", "succeeded", "failed", "abandoned", "timed_out"];

function outcomeVariant(outcome: string): "secondary" | "destructive" | "outline" {
  if (outcome === "failed" || outcome === "timed_out") return "destructive";
  if (outcome === "succeeded") return "secondary";
  return "outline";
}

export function ActivityClient({ initialData, initialTotalCount }: { initialData: AdminActivityRecord[]; initialTotalCount: number }) {
  const [items, setItems] = useState(initialData);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [query, setQuery] = useState("");
  const [feature, setFeature] = useState("");
  const [outcome, setOutcome] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [debouncedQuery] = useDebounce(query, 400);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    let active = true;
    getActivity({ pageIndex, pageSize: PAGE_SIZE, filter: debouncedQuery, feature: feature || undefined, outcome: outcome || undefined, dateFrom: dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined, dateTo: dateTo ? new Date(`${dateTo}T23:59:59.999`) : undefined })
      .then((result) => {
        if (!active) return;
        if (!result.success) {
          toast.error("Unable to load activity", { description: result.error });
          return;
        }
        setItems(result.data?.items ?? []);
        setTotalCount(result.data?.totalCount ?? 0);
      })
      .catch(() => toast.error("Unable to load activity"));
    return () => { active = false; };
  }, [debouncedQuery, feature, outcome, dateFrom, dateTo, pageIndex]);

  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2">
      <Input className="max-w-sm" placeholder="Search user, feature, resource ID..." value={query} onChange={(event) => { setQuery(event.target.value); setPageIndex(0); }} />
      <Select value={feature || "all"} onValueChange={(value) => { setFeature(value === "all" ? "" : value); setPageIndex(0); }}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Feature" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All features</SelectItem>{FEATURES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={outcome || "all"} onValueChange={(value) => { setOutcome(value === "all" ? "" : value); setPageIndex(0); }}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Outcome" /></SelectTrigger>
        <SelectContent><SelectItem value="all">All outcomes</SelectItem>{OUTCOMES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
      </Select>
      <Input className="w-[155px]" type="date" aria-label="From date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPageIndex(0); }} />
      <Input className="w-[155px]" type="date" aria-label="To date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPageIndex(0); }} />
    </div>
    <div className="relative max-h-[calc(100vh-240px)] overflow-auto rounded-md border">
      <Table>
        <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Feature</TableHead><TableHead>Action</TableHead><TableHead>Outcome</TableHead><TableHead>Resource</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
        <TableBody>{items.length ? items.map((item) => <TableRow key={item.id}>
          <TableCell className="whitespace-nowrap text-muted-foreground">{dayjs(item.occurredAt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
          <TableCell><div className="max-w-[220px]"><p className="truncate font-medium">{item.userName || "Anonymous"}</p><p className="truncate text-xs text-muted-foreground">{item.userEmail || item.userId || "—"}</p></div></TableCell>
          <TableCell><Badge variant="outline">{item.feature}</Badge></TableCell><TableCell>{item.action}</TableCell>
          <TableCell><Badge variant={outcomeVariant(item.outcome)}>{item.outcome}</Badge></TableCell>
          <TableCell className="max-w-[180px] truncate font-mono text-xs" title={item.resourceId ?? undefined}>{item.resourceType ? `${item.resourceType}: ${item.resourceId ?? "—"}` : "—"}</TableCell>
          <TableCell><Badge variant="outline">{item.source}</Badge></TableCell>
        </TableRow>) : <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No activity records found.</TableCell></TableRow>}</TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-end gap-3"><span className="text-sm text-muted-foreground">{totalCount} records · Page {pageIndex + 1} of {pageCount}</span><Button variant="outline" size="sm" disabled={pageIndex === 0} onClick={() => setPageIndex((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={pageIndex + 1 >= pageCount} onClick={() => setPageIndex((value) => value + 1)}>Next</Button></div>
  </div>;
}
