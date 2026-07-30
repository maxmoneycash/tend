"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

/** A — one card: everything on one surface, no hidden steps. */
export function FlowA() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Find your land tax</CardTitle>
        <CardDescription>
          Address → tribe → amount, all in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field>
          <FieldLabel htmlFor="flow-a-addr">Street address</FieldLabel>
          <Input id="flow-a-addr" placeholder="123 Valencia St, San Francisco" />
          <FieldDescription>
            Resolved with the US Census geocoder — nothing stored.
          </FieldDescription>
        </Field>
        <div className="text-sm">
          → <strong>Ramaytush Ohlone land</strong>{" "}
          <Badge variant="secondary">San Francisco</Badge>
        </div>
        <Button className="w-full">Begin — $25/month</Button>
      </CardContent>
    </Card>
  );
}

/** B — accordion steps: a guided path; each step confirms the last. */
export function FlowB() {
  return (
    <Card>
      <CardContent className="pt-4">
        <Accordion defaultValue={["locate"]}>
          <AccordionItem value="locate">
            <AccordionTrigger>
              <span>
                <Badge className="mr-2">1</Badge> Locate — whose land am I on?
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <Input placeholder="Your street address" />
              <p className="text-sm text-muted-foreground">
                → Ramaytush Ohlone land (San Francisco County)
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="choose">
            <AccordionTrigger>
              <span>
                <Badge className="mr-2">2</Badge> Choose the tribe
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                One match here — in Santa Clara County this step shows both
                tribes, honestly.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="amount">
            <AccordionTrigger>
              <span>
                <Badge className="mr-2">3</Badge> Set the amount
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Sliding scale, then straight to Stripe Checkout.
              </p>
              <Button>Begin — $25/month</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
