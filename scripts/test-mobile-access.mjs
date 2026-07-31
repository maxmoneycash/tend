import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pledge, styles, navbarStyles] = await Promise.all([
  readFile(new URL("../components/PledgeFlow.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../styles/navbar.css", import.meta.url), "utf8"),
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
assert.match(
  navbarStyles,
  /\.nav-hamburger:active,\s*\.mobile-menu-close:active \{\s*background: rgba\(10, 10, 10, 0\.12\);/,
  "Mobile menu buttons must show a shared pressed state.",
);

console.log("Mobile access source checks passed.");
