import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [layout, navbar, pledge, streamPanel] = await Promise.all([
  readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/layout/Navbar.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/PledgeFlow.tsx", import.meta.url), "utf8"),
  readFile(
    new URL("../components/stream/StreamPanel.tsx", import.meta.url),
    "utf8",
  ),
]);

assert.match(
  navbar,
  /href="#main-content"[^>]*>\s*Skip to main content/s,
  "The first navigation action must skip to the main content landmark.",
);
assert.match(
  layout,
  /<main id="main-content"[^>]*tabIndex=\{-1\}/s,
  "The skip-link target must remain programmatically focusable.",
);
assert.match(
  navbar,
  /closeButtonRef\.current\?\.focus\(\)/,
  "Opening the mobile menu must move focus into the dialog.",
);
assert.match(
  navbar,
  /previouslyFocused\.focus\(\)/,
  "Closing the mobile menu must restore the prior focus.",
);
assert.match(
  pledge,
  /locationRecoveryRef\.current = body\.address[\s\S]*?document\.activeElement/,
  "Location lookup must remember the address field or county button that started it.",
);
assert.match(
  pledge,
  /if \(locationError && busyAction === null\)[\s\S]*?locationRecoveryRef\.current\?\.focus\(\)/,
  "A location failure must return focus to its triggering control.",
);
assert.match(
  pledge,
<<<<<<< HEAD
=======
  /if \(located && !locationError && !checkoutError && busyAction === null\)[\s\S]*?locationResultsRef\.current\?\.focus\(\)/,
  "A successful location lookup must move focus to its new results.",
);
assert.match(
  pledge,
  /<section[\s\S]*?ref=\{locationResultsRef\}[\s\S]*?aria-labelledby="pledge-program-results-title"[\s\S]*?tabIndex=\{-1\}[\s\S]*?<h3 id="pledge-program-results-title" className="sr-only">\s*Program results\s*<\/h3>/,
  "Program results must be a labelled, programmatically focusable landmark.",
);
assert.match(
  pledge,
>>>>>>> round2/willow
  /if \(checkoutError && busyAction === null\)[\s\S]*?checkoutButtonRef\.current\?\.focus\(\)/,
  "A checkout failure must move focus to its retry action.",
);
assert.match(
  pledge,
  /aria-describedby=\{\s*checkoutError \? "pledge-checkout-error" : undefined\s*\}/s,
  "The checkout retry action must describe its error.",
);
assert.match(
  pledge,
  /id="pledge-checkout-error"[\s\S]*?role="alert"/,
  "The checkout error must remain an assertive live-region message.",
);
assert.match(
  streamPanel,
  /if \(error && !busy\)[\s\S]*?checkoutButtonRef\.current\?\.focus\(\)/,
  "A program checkout failure must move focus to its retry action.",
);
assert.match(
  streamPanel,
  /aria-describedby=\{error \? "stream-checkout-error" : undefined\}/,
  "The program checkout retry action must describe its error.",
);
assert.match(
  streamPanel,
  /id="stream-checkout-error"[\s\S]*?role="alert"/,
  "The program checkout error must remain an assertive live-region message.",
);

console.log("Keyboard recovery source checks passed.");
