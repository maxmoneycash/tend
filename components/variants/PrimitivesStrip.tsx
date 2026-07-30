"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PrimitivesStrip() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Begin pledge</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Cancel pledge</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>documented</Badge>
          <Badge variant="secondary">county</Badge>
          <Badge variant="outline">machine</Badge>
          <Badge variant="destructive">overdue</Badge>
          <Tooltip>
            <TooltipTrigger className="underline decoration-dotted text-sm">
              100% to the tribe
            </TooltipTrigger>
            <TooltipPositioner>
              <TooltipContent>
                Pledges are created on the tribe&apos;s own Stripe account.
                Tend takes nothing.
              </TooltipContent>
            </TooltipPositioner>
          </Tooltip>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>

        <Alert>
          <AlertTitle>Demo mode</AlertTitle>
          <AlertDescription>
            Sample data, sign-in bypassed. Connect Stripe &amp; Auth0 and this
            page goes live. (basecn Alert vs. the current hand-rolled banner.)
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch id="p-interval" />
            <Label htmlFor="p-interval">Yearly</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="p-consent" />
            <Label htmlFor="p-consent">Email me the tribe&apos;s updates</Label>
          </div>
          <div className="flex -space-x-2">
            {["RO", "MO", "ST"].map((x) => (
              <Avatar key={x} className="border-2 border-background">
                <AvatarFallback>{x}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Loading state (Skeleton):
          </p>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
