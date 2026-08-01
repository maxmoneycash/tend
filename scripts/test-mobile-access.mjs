import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pledge, pledgePage, styles, programs, programDetail, navbarStyles] = await Promise.all([
  readFile(new URL("../components/PledgeFlow.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/pledge/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/programs/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/programs/[id]/page.tsx", import.meta.url), "utf8"),
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
  /@media \(max-width: 768px\)[\s\S]*?\.navbar \{[\s\S]*?env\(safe-area-inset-top, 0px\)/,
  "The fixed mobile navbar must account for the device top safe area.",
);
assert.match(
  programs,
  /paddingTop: "calc\(108px \+ env\(safe-area-inset-top, 0px\)\)"/,
  "The Programs route must reserve the fixed navbar's top safe-area inset.",
);
assert.match(
  programDetail,
  /paddingTop: "calc\(108px \+ env\(safe-area-inset-top, 0px\)\)"/,
  "The program detail route must reserve the fixed navbar's top safe-area inset.",
);
assert.match(
  pledgePage,
  /paddingTop: "calc\(108px \+ env\(safe-area-inset-top, 0px\)\)"/,
  "The pledge route must reserve the fixed navbar's top safe-area inset.",
);

console.log("Mobile access source checks passed.");
