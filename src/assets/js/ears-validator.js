(function (global) {
  "use strict";

  const patterns = [
    {
      type: "complex",
      label: "Complex",
      regex: /^while\s+(.+?),\s*when\s+(.+?),\s*the\s+(.+?)\s+shall\s+(.+)$/i,
      groups: ["precondition", "trigger", "system", "response"],
    },
    {
      type: "unwanted-behaviour",
      label: "Unwanted behaviour",
      regex: /^if\s+(.+?),\s*then\s+the\s+(.+?)\s+shall\s+(.+)$/i,
      groups: ["trigger", "system", "response"],
    },
    {
      type: "state-driven",
      label: "State driven",
      regex: /^while\s+(.+?),\s*the\s+(.+?)\s+shall\s+(.+)$/i,
      groups: ["precondition", "system", "response"],
    },
    {
      type: "event-driven",
      label: "Event driven",
      regex: /^when\s+(.+?),\s*the\s+(.+?)\s+shall\s+(.+)$/i,
      groups: ["trigger", "system", "response"],
    },
    {
      type: "optional-feature",
      label: "Optional feature",
      regex: /^where\s+(.+?),\s*the\s+(.+?)\s+shall\s+(.+)$/i,
      groups: ["feature", "system", "response"],
    },
    {
      type: "ubiquitous",
      label: "Ubiquitous",
      regex: /^the\s+(.+?)\s+shall\s+(.+)$/i,
      groups: ["system", "response"],
    },
  ];

  const weakModality = /\b(could|might|should|may)\b/gi;
  const vagueTerms = /\b(quickly|efficiently|appropriately|where appropriate|as soon as possible|if necessary|normally)\b/gi;
  const quantitativeHint = /\b(ms|milliseconds?|seconds?|minutes?|hours?|percent|%|requests? per second|rps|mb|gb|kb|bytes?|retries|attempts?|concurrent|latency|throughput)\b/i;
  const number = /\b\d+(?:\.\d+)?\b/;

  function stripTerminalPunctuation(value) {
    return value.trim().replace(/[.!?]+$/, "").trim();
  }

  function uniqueMatches(regex, input) {
    regex.lastIndex = 0;
    return Array.from(new Set(Array.from(input.matchAll(regex), (match) => match[0].toLowerCase())));
  }

  function classify(requirement) {
    const normalized = stripTerminalPunctuation(requirement.replace(/\s+/g, " "));
    for (const pattern of patterns) {
      const match = normalized.match(pattern.regex);
      if (!match) continue;
      const clauses = {};
      pattern.groups.forEach((name, index) => {
        clauses[name] = match[index + 1].trim();
      });
      return { valid: true, type: pattern.type, label: pattern.label, clauses, normalized };
    }
    return { valid: false, type: null, label: null, clauses: {}, normalized };
  }

  function lint(requirement) {
    const value = String(requirement || "").trim();
    const findings = [];

    if (!value) {
      return {
        valid: false,
        classification: { valid: false, type: null, label: null, clauses: {}, normalized: "" },
        findings: [{ code: "empty", level: "error", message: "Enter a requirement to validate." }],
      };
    }

    const classification = classify(value);

    if (!classification.valid) {
      findings.push({
        code: "ears-structure",
        level: "error",
        message: "Requirement does not match a supported EARS pattern.",
      });
    }

    const modality = uniqueMatches(weakModality, value);
    if (modality.length) {
      findings.push({
        code: "weak-modality",
        level: "error",
        message: `Avoid weak modality: ${modality.join(", ")}. Use SHALL for normative EARS requirements.`,
      });
    }

    if (!/\bshall\b/i.test(value)) {
      findings.push({
        code: "missing-shall",
        level: "error",
        message: "Normative EARS requirements use SHALL between the system name and response.",
      });
    }

    const vague = uniqueMatches(vagueTerms, value);
    if (vague.length) {
      findings.push({
        code: "vague-language",
        level: "warning",
        message: `Vague language detected: ${vague.join(", ")}. Replace it with observable or measurable behaviour.`,
      });
    }

    if (quantitativeHint.test(value) && !number.test(value)) {
      findings.push({
        code: "missing-quantity",
        level: "warning",
        message: "The requirement mentions a quantitative concept but contains no numeric constraint.",
      });
    }

    if (classification.valid) {
      const emptyClause = Object.entries(classification.clauses).find(([, clause]) => !clause.trim());
      if (emptyClause) {
        findings.push({
          code: "empty-clause",
          level: "error",
          message: `The ${emptyClause[0]} clause is empty.`,
        });
      }
    }

    return {
      valid: !findings.some((finding) => finding.level === "error"),
      classification,
      findings,
    };
  }

  global.EARSValidator = { classify, lint, patterns };
})(typeof window !== "undefined" ? window : globalThis);
