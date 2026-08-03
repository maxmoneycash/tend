import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  shouldPlayProgramVideo,
  syncProgramVideo,
} from "../lib/program-video-policy.mjs";

class FakeVideo {
  attributes = new Map<string, string>();
  loadCount = 0;
  paused = true;
  pauseCount = 0;
  playCount = 0;

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string) {
    return this.attributes.has(name);
  }

  load() {
    this.loadCount += 1;
  }

  pause() {
    this.paused = true;
    this.pauseCount += 1;
  }

  play() {
    this.paused = false;
    this.playCount += 1;
    return Promise.resolve();
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

const conditions = {
  dataSaver: false,
  documentVisible: true,
  inViewport: true,
  reducedMotion: false,
};

assert.equal(shouldPlayProgramVideo(conditions), true);
assert.equal(
  shouldPlayProgramVideo({ ...conditions, reducedMotion: true }),
  false,
);
assert.equal(
  shouldPlayProgramVideo({ ...conditions, dataSaver: true }),
  false,
);
assert.equal(
  shouldPlayProgramVideo({ ...conditions, inViewport: false }),
  false,
);
assert.equal(
  shouldPlayProgramVideo({ ...conditions, documentVisible: false }),
  false,
);

const src = "/videos/ramaytush.mp4";
const visibleVideo = new FakeVideo();
syncProgramVideo(visibleVideo, src, conditions);
assert.equal(visibleVideo.getAttribute("src"), src);
assert.equal(visibleVideo.paused, false);
assert.equal(visibleVideo.playCount, 1);

for (const blockedConditions of [
  { ...conditions, reducedMotion: true },
  { ...conditions, dataSaver: true },
]) {
  const blockedVideo = new FakeVideo();
  syncProgramVideo(blockedVideo, src, blockedConditions);
  assert.equal(blockedVideo.getAttribute("src"), null);
  assert.equal(blockedVideo.paused, true);
  assert.equal(blockedVideo.playCount, 0);

  blockedVideo.setAttribute("src", src);
  blockedVideo.paused = false;
  syncProgramVideo(blockedVideo, src, blockedConditions);
  assert.equal(blockedVideo.getAttribute("src"), null);
  assert.equal(blockedVideo.paused, true);
  assert.equal(blockedVideo.loadCount, 1);
}

for (const hiddenConditions of [
  { ...conditions, inViewport: false },
  { ...conditions, documentVisible: false },
]) {
  const hiddenVideo = new FakeVideo();
  syncProgramVideo(hiddenVideo, src, hiddenConditions);
  assert.equal(hiddenVideo.getAttribute("src"), null);
  assert.equal(hiddenVideo.paused, true);
  assert.equal(hiddenVideo.playCount, 0);
}

const [cardSource, heroSource, videoSource] = await Promise.all(
  [
    "components/programs/ProgramCard.tsx",
    "components/programs/ProgramOfficialHero.tsx",
    "components/programs/ProgramVideo.tsx",
  ].map((file) => readFile(file, "utf8")),
);

for (const source of [cardSource, heroSource]) {
  assert.match(source, /<ProgramVideo/);
  assert.match(source, /poster=\{`\/videos\/\$\{program\.id\}-poster\.jpg`\}/);
  assert.match(source, /src=\{`\/videos\/\$\{program\.id\}\.mp4`\}/);
}

assert.doesNotMatch(videoSource, /\bautoPlay\b/);
assert.doesNotMatch(videoSource, /motion-reduce:hidden/);
assert.match(videoSource, /poster=\{poster\}/);
assert.match(videoSource, /preload="none"/);
assert.match(videoSource, /video\.pause\(\)/);
assert.doesNotMatch(videoSource, /<video[\s\S]*?\ssrc=/);

console.log(
  "PASS program media: posters render before MP4 loading. Playback requires a visible page and viewport, with reduced motion and data saver turned off.",
);
