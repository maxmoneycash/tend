"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { countyTribes, tribes } from "@/lib/tribes";

const LIST = Object.values(tribes);

function counties(id: string) {
  return Object.entries(countyTribes)
    .filter(([, ids]) => ids.includes(id as never))
    .map(([county]) => county);
}

/** A — cards: both tribes visible at once; strongest for the overlap case. */
export function TribeSelectorA() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LIST.map((t) => (
        <Card
          key={t.id}
          onClick={() => setSelected(t.id)}
          className={`cursor-pointer transition ${
            selected === t.id ? "ring-2 ring-primary border-primary" : ""
          }`}
        >
          <CardHeader>
            <CardDescription className="uppercase tracking-widest text-xs">
              {t.region}
            </CardDescription>
            <CardTitle className="font-display">{t.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {counties(t.id).map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** B — tabs: one tribe in focus at a time; calmer, more reading room. */
export function TribeSelectorB() {
  return (
    <Tabs defaultValue={LIST[0].id}>
      <TabsList className="w-full">
        {LIST.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="flex-1">
            {t.name.replace("Association of ", "")}
          </TabsTrigger>
        ))}
      </TabsList>
      {LIST.map((t) => (
        <TabsContent key={t.id} value={t.id}>
          <Card>
            <CardHeader>
              <CardDescription className="uppercase tracking-widest text-xs">
                {t.region}
              </CardDescription>
              <CardTitle className="font-display">{t.taxName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.blurb}
              </p>
              <Button>Begin the {t.taxName}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** C — radio list: densest; reads as a form, quickest to pick. */
export function TribeSelectorC() {
  const [selected, setSelected] = useState(LIST[0].id);
  return (
    <RadioGroup
      value={selected}
      onValueChange={(v) => setSelected(String(v) as typeof selected)}
      className="gap-2"
    >
      {LIST.map((t) => (
        <label key={t.id} htmlFor={`tribe-${t.id}`} className="cursor-pointer">
          <Item
            variant="outline"
            className={
              selected === t.id ? "border-primary ring-2 ring-primary" : ""
            }
          >
            <ItemMedia>
              <Avatar>
                <AvatarFallback>
                  {t.id === "ramaytush" ? "RO" : "MO"}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{t.name}</ItemTitle>
              <ItemDescription>
                {t.region} · {counties(t.id).join(", ")}
              </ItemDescription>
            </ItemContent>
            <RadioGroupItem id={`tribe-${t.id}`} value={t.id} />
          </Item>
        </label>
      ))}
    </RadioGroup>
  );
}
