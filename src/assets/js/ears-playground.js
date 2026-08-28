(function () {
  "use strict";

  const root = document.querySelector("[data-ears-playground]");
  if (!root || !window.EARSValidator) return;

  const input = root.querySelector("[data-ears-input]");
  const validateButton = root.querySelector("[data-ears-validate]");
  const validButton = root.querySelector("[data-ears-valid-example]");
  const invalidButton = root.querySelector("[data-ears-invalid-example]");
  const resultCard = root.querySelector("[data-ears-result-card]");
  const status = root.querySelector("[data-ears-status]");
  const pattern = root.querySelector("[data-ears-pattern]");
  const clauses = root.querySelector("[data-ears-clauses]");
  const findings = root.querySelector("[data-ears-findings]");
  const ruleButtons = Array.from(root.querySelectorAll("[data-ears-rule]"));
  const ruleTitle = root.querySelector("[data-ears-rule-title]");
  const ruleCode = root.querySelector("[data-ears-rule-code]");
  const ruleRaw = root.querySelector("[data-ears-rule-raw]");
  const ruleError = root.querySelector("[data-ears-rule-error]");

  const examples = {
    invalid: "When authentication fails, the API could return an error quickly.",
    valid: "When authentication fails, the API SHALL return HTTP 401 within 200 ms.",
  };

  const ruleCache = new Map();

  function render() {
    const result = window.EARSValidator.lint(input.value);
    const classification = result.classification;
    const state = result.valid ? "valid" : "invalid";

    status.textContent = result.valid ? "Pass" : "Needs work";
    status.dataset.state = state;
    if (resultCard) resultCard.dataset.state = state;

    pattern.textContent = classification.valid
      ? classification.label + " requirement"
      : "No accepted EARS pattern matched";

    clauses.replaceChildren();
    if (classification.valid) {
      Object.entries(classification.clauses).forEach(([name, value]) => {
        const row = document.createElement("div");
        row.className = "ears-clause";

        const label = document.createElement("strong");
        label.textContent = name.replace(/-/g, " ");

        const content = document.createElement("span");
        content.textContent = value;

        row.append(label, content);
        clauses.append(row);
      });
    } else {
      const empty = document.createElement("p");
      empty.className = "ears-structure-hint";
      empty.textContent = "Fix the structure first, then the playground can identify the clauses.";
      clauses.append(empty);
    }

    findings.replaceChildren();
    if (!result.findings.length) {
      const item = document.createElement("li");
      item.className = "ears-finding ears-finding-ok";
      item.textContent = "No structural, modality, or vague-language findings.";
      findings.append(item);
    } else {
      result.findings.forEach((finding) => {
        const item = document.createElement("li");
        item.className = "ears-finding " + (finding.level === "error" ? "ears-finding-error" : "ears-finding-warning");
        const prefix = finding.level === "error" ? "Error: " : "Warning: ";
        item.textContent = prefix + finding.message;
        findings.append(item);
      });
    }
  }

  async function loadRule(button) {
    if (!button || !ruleCode) return;

    const source = button.dataset.earsRule;
    const name = button.dataset.earsRuleName || "Vale rule";

    ruleButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });

    ruleTitle.textContent = name;
    ruleRaw.href = source;
    ruleCode.textContent = "Loading rule…";
    ruleError.hidden = true;

    try {
      let text = ruleCache.get(source);
      if (!text) {
        const response = await fetch(source, { cache: "no-cache" });
        if (!response.ok) throw new Error("Rule request failed");
        text = await response.text();
        ruleCache.set(source, text);
      }
      ruleCode.textContent = text.trimEnd();
    } catch (error) {
      ruleCode.textContent = "";
      ruleError.hidden = false;
    }
  }

  validateButton.addEventListener("click", render);
  validButton.addEventListener("click", function () {
    input.value = examples.valid;
    render();
    input.focus();
  });
  invalidButton.addEventListener("click", function () {
    input.value = examples.invalid;
    render();
    input.focus();
  });

  ruleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      loadRule(button);
    });
  });

  input.addEventListener("input", render);
  render();
  loadRule(ruleButtons.find((button) => button.classList.contains("is-active")) || ruleButtons[0]);
})();
