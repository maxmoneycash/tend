import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pledge, styles] = await Promise.all([
  readFile(new URL("../components/PledgeFlow.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

assert.match(
  pledge,
  /<section className="pledge-flow"/,
  "The pledge journey must keep the mobile action rules in scope.",
);
assert.match(
  styles,
  /@media \(max-width: 39\.99rem\)[\s\S]*?\.pledge-flow \.pledge-primary-button,[\s\S]*?\.pledge-flow \.pledge-checkout-button \{[\s\S]*?white-space: normal;/,
  "Primary pledge actions must wrap instead of clipping at phone widths.",
);
assert.match(
  styles,
  /\.pledge-flow :is\(\.pledge-primary-button, \.pledge-checkout-button\) svg \{\s*flex: 0 0 auto;/,
  "Wrapped pledge actions must keep their direction and progress icons visible.",
);

console.log("Mobile access source checks passed.");
