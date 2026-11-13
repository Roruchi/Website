const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sourceLastmod = require("./source-lastmod");

const temporary = fs.mkdtempSync(path.join(__dirname, "../.site-dates-"));
try {
  const file = path.join(temporary, "page.md");
  for (const [frontmatter, expected] of [
    ["title: Undated", ""],
    ["date: 2024-01-02", "2024-01-02"],
    ["date: 2024-01-02\nupdated: 2025-03-04", "2025-03-04"],
    ["date: Last Modified", ""],
    ['date: "2025-02-30"', ""],
    ["date: 2025-02-30", ""],
    ["updated: 2025-02-30\ndate: 2024-01-02", ""],
    ["date: 2025-02-29", ""],
    ["updated: 2025-02-30T12:00:00Z", ""],
    ["date: 2025-02-30T12:00:00Z", ""],
    ["date: 2024-02-29", "2024-02-29"],
    ["updated: 2024-02-29T23:30:00-02:00", "2024-03-01"],
    ['date: "2024-02-29T23:30:00-02:00"', "2024-03-01"],
    ['updated: "invalid"\ndate: 2024-01-02', ""],
  ]) {
    fs.writeFileSync(file, `---\n${frontmatter}\n---\nBody`);
    assert.equal(sourceLastmod(file), expected, frontmatter);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

function pond(initialReduced, observerAvailable = true) {
  const frames = new Map();
  const listeners = {};
  const media = { matches: initialReduced, addEventListener: (_, fn) => { listeners.motion = fn; } };
  let intersection;
  let nextFrame = 0;
  let paints = 0;
  let feeds = 0;
  const ctx = new Proxy({}, { get: (_, key) => key === "fillRect" ? () => paints++ : () => {} });
  const canvas = { style: {}, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0 }) };
  const container = { offsetWidth: 1200, offsetHeight: 800, appendChild() {}, addEventListener: (name, fn) => { listeners[name] = fn; } };
  const document = { hidden: false, readyState: "complete", body: { appendChild() {} },
    getElementById: () => container, createElementNS: () => ({ setAttribute() {} }),
    createElement: () => canvas, addEventListener: (name, fn) => { listeners[name] = fn; } };
  const window = { matchMedia: () => media, addEventListener() {}, dispatchEvent: () => feeds++ };
  if (observerAvailable) window.IntersectionObserver = true;
  const sandbox = { window, document, CustomEvent: function() {},
    IntersectionObserver: function(callback) { intersection = callback; this.observe = () => {}; },
    requestAnimationFrame: (fn) => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/assets/js/koi-pond.js"), "utf8"), sandbox);
  return { frames, listeners, media, document, visible: (value) => intersection([{ isIntersecting: value }]),
    tick: () => { const [id, callback] = frames.entries().next().value; frames.delete(id); callback(); },
    paints: () => paints, feeds: () => feeds };
}
for (const reduced of [false, true]) {
  const state = pond(reduced);
  assert.ok(state.paints() > 0, "Always paints an initial still frame");
  assert.equal(state.frames.size, 0, "Wait for visibility before animating");
  state.visible(true);
  assert.equal(state.frames.size, reduced ? 0 : 1);
  state.media.matches = false; state.listeners.motion();
  state.tick(); assert.equal(state.frames.size, 1, "One frame chain");
  state.visible(false); assert.equal(state.frames.size, 0, "Offscreen pauses");
  state.document.hidden = true; state.visible(true);
  assert.equal(state.frames.size, 0, "Hidden document stays paused");
  state.document.hidden = false; state.listeners.visibilitychange();
  assert.equal(state.frames.size, 1, "Visible document resumes");
  state.listeners.visibilitychange(); assert.equal(state.frames.size, 1, "No duplicate chain");
  state.media.matches = true; state.listeners.motion();
  assert.equal(state.frames.size, 0, "Live reduced-motion change cancels animation");
  state.listeners.mousedown({ clientX: 100, clientY: 100 });
  state.listeners.touchstart({ touches: [{ clientX: 100, clientY: 100 }] });
  assert.equal(state.feeds(), 2, "Mouse and touch retain feeding events");
}
assert.equal(pond(false, false).frames.size, 1, "Fallback animates without IntersectionObserver");
console.log("Source date and pond lifecycle tests passed.");
