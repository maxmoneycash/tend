import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pledge, pledgePage, styles, programs, programDetail, navbarStyles, productStyles, operations] = await Promise.all([
  readFile(new URL("../components/PledgeFlow.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/pledge/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/programs/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/programs/[id]/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../styles/navbar.css", import.meta.url), "utf8"),
  readFile(new URL("../styles/content-rewards-product.css", import.meta.url), "utf8"),
  readFile(new URL("../components/content-rewards/OperationsDashboard.tsx", import.meta.url), "utf8"),
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
  /className="cr-product-nav-spacer"/,
  "The Programs route must reserve the fixed navbar's top safe-area inset.",
);
assert.match(
  programDetail,
  /className="cr-product-nav-spacer"/,
  "The program detail route must reserve the fixed navbar's top safe-area inset.",
);
assert.match(
  productStyles,
  /\.cr-product-nav-spacer \{[\s\S]*?env\(safe-area-inset-top, 0px\)/,
  "The product navbar spacer must account for the device top safe area.",
);
assert.match(
  pledgePage,
  /paddingTop: "calc\(108px \+ env\(safe-area-inset-top, 0px\)\)"/,
  "The pledge route must reserve the fixed navbar's top safe-area inset.",
);
assert.match(
  operations,
  /aria-pressed=\{registerView === "donations"\}[\s\S]*?Search records[\s\S]*?Export CSV/,
  "The staff register must keep its view switcher, search, and export controls together.",
);
assert.match(
  productStyles,
  /@media \(max-width: 48rem\)[\s\S]*?\.cr-operations-controls \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);[\s\S]*?\.cr-operations-export \{ width: 100%; \}/,
  "Staff register controls must collapse to a full-width mobile layout.",
);

console.log("Mobile access source checks passed.");
