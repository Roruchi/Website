const assert = require("node:assert/strict");

require("../src/assets/js/ears-validator.js");

const { classify, lint } = global.EARSValidator;

const cases = [
  ["The API SHALL return HTTP 200.", "ubiquitous"],
  ["While maintenance mode is active, the API SHALL reject writes.", "state-driven"],
  ["When authentication fails, the API SHALL return HTTP 401 within 200 ms.", "event-driven"],
  ["Where SSO is enabled, the portal SHALL show the SSO button.", "optional-feature"],
  ["If authentication fails, then the API SHALL return HTTP 401.", "unwanted-behaviour"],
  ["While the session is active, when the token expires, the API SHALL return HTTP 401.", "complex"],
];

for (const [requirement, expectedType] of cases) {
  const result = classify(requirement);
  assert.equal(result.valid, true, requirement);
  assert.equal(result.type, expectedType, requirement);
}

const invalid = lint("When authentication fails, the API could return an error quickly.");
assert.equal(invalid.valid, false);
assert.ok(invalid.findings.some((finding) => finding.code === "ears-structure"));
assert.ok(invalid.findings.some((finding) => finding.code === "weak-modality"));
assert.ok(invalid.findings.some((finding) => finding.code === "vague-language"));

const valid = lint("When authentication fails, the API SHALL return HTTP 401 within 200 ms.");
assert.equal(valid.valid, true);
assert.equal(valid.classification.type, "event-driven");
assert.equal(valid.classification.clauses.trigger, "authentication fails");
assert.equal(valid.classification.clauses.system, "API");
assert.equal(valid.classification.clauses.response, "return HTTP 401 within 200 ms");

console.log(`EARS validator: ${cases.length + 2} cases passed.`);
