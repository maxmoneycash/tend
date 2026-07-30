"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** A — stat tiles: the classic three-up; scans instantly. */
export function StatsA() {
  const tiles = [
    { label: "Supporters", value: "12", sub: "active recurring pledges" },
    { label: "Recurring", value: "$372", sub: "per month, 100% yours" },
    { label: "Machine payments", value: "$175", sub: "paid by AI agents" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardHeader>
            <CardDescription>{t.label}</CardDescription>
            <CardTitle className="font-display text-4xl">{t.value}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {t.sub}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** B — goal progress: numbers with direction; motivating for small orgs. */
export function StatsB() {
  const rows = [
    { label: "Monthly recurring", value: 372, goal: 2500, display: "$372 of $2,500/mo goal" },
    { label: "Supporters", value: 12, goal: 100, display: "12 of 100-supporter goal" },
    { label: "Machine payers", value: 7, goal: 25, display: "7 of 25 agent fleets" },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Item key={r.label} variant="outline">
          <ItemContent>
            <ItemTitle>{r.label}</ItemTitle>
            <ItemDescription>{r.display}</ItemDescription>
            <Progress
              value={(r.value / r.goal) * 100}
              className="mt-2 w-full"
            >
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}

/** C — ledger table: densest; feels like the books, auditable at a glance. */
export function StatsC() {
  const rows = [
    { date: "Jul 28", who: "Recurring pledge", kind: "human", amount: "$25/mo" },
    { date: "Jul 26", who: "ci-runner @ acme-robotics", kind: "machine", amount: "$25/yr" },
    { date: "Jul 24", who: "Recurring pledge", kind: "human", amount: "$50/mo" },
    { date: "Jul 19", who: "fleet-7 @ mission-labs", kind: "machine", amount: "$25/yr" },
    { date: "Jul 12", who: "Recurring pledge", kind: "human", amount: "$250/yr" },
  ];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="text-muted-foreground">{r.date}</TableCell>
            <TableCell>{r.who}</TableCell>
            <TableCell>
              <Badge variant={r.kind === "machine" ? "outline" : "secondary"}>
                {r.kind}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {r.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
