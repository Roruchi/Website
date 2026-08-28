---
title: "EARS Requirement Playground"
description: "Test EARS requirement structure, weak modality, and vague language before an agent turns a specification into code."
permalink: "/labs/ears/"
eleventyExcludeFromCollections: true
layout: base.njk
---

<link rel="stylesheet" href="/assets/css/ears-playground.css">

<section class="page-hero ears-hero">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
    <div class="eyebrow mb-6">Agentic engineering lab</div>
    <h1>EARS Requirement Playground</h1>
    <p class="page-lead">A small deterministic validator for the prose you are about to hand to a coding agent. It checks EARS structure, weak modality, and common vague terms.</p>
  </div>
</section>

<section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 ears-playground" data-ears-playground>
  <div class="ears-grid">
    <div class="ears-card">
      <div class="eyebrow mb-3">Requirement</div>
      <label for="ears-requirement"><strong>Try a requirement</strong></label>
      <textarea id="ears-requirement" data-ears-input>When authentication fails, the API could return an error quickly.</textarea>
      <div class="ears-actions ears-example-actions">
        <button type="button" class="button-primary" data-ears-validate>Validate</button>
        <button type="button" data-ears-valid-example>Load valid example</button>
        <button type="button" data-ears-invalid-example>Load invalid example</button>
      </div>
    </div>

    <div class="ears-card" aria-live="polite">
      <div class="eyebrow mb-3">Result</div>
      <p class="ears-status" data-ears-status></p>
      <p><strong>Pattern:</strong> <span data-ears-pattern></span></p>
      <div class="ears-clauses" data-ears-clauses></div>
      <h2 class="text-xl font-semibold mt-6">Findings</h2>
      <ul class="ears-findings" data-ears-findings></ul>
    </div>
  </div>

  <div class="ears-card">
    <div class="eyebrow mb-3">Accepted EARS shapes</div>
    <div class="ears-patterns">
      <code>The &lt;system&gt; SHALL &lt;response&gt;</code>
      <code>While &lt;state&gt;, the &lt;system&gt; SHALL &lt;response&gt;</code>
      <code>When &lt;trigger&gt;, the &lt;system&gt; SHALL &lt;response&gt;</code>
      <code>Where &lt;feature&gt;, the &lt;system&gt; SHALL &lt;response&gt;</code>
      <code>If &lt;trigger&gt;, then the &lt;system&gt; SHALL &lt;response&gt;</code>
      <code>While &lt;state&gt;, when &lt;trigger&gt;, the &lt;system&gt; SHALL &lt;response&gt;</code>
    </div>
  </div>

  <div class="ears-card">
    <div class="eyebrow mb-3">Use it with Vale</div>
    <p>The browser playground explains the grammar. The Vale rules are aimed at OpenSpec: the EARS rule checks the first requirement statement after each <code>### Requirement:</code> heading, while modality and vague-language checks remain separate.</p>

    <div class="ears-actions ears-rule-actions" role="group" aria-label="Inspect Vale rules">
      <button type="button" class="ears-rule-button is-active" data-ears-rule="/assets/downloads/vale-ears/EARS.yml" data-ears-rule-name="EARS.yml" aria-pressed="true">EARS.yml</button>
      <button type="button" class="ears-rule-button" data-ears-rule="/assets/downloads/vale-ears/WeakModality.yml" data-ears-rule-name="WeakModality.yml" aria-pressed="false">WeakModality.yml</button>
      <button type="button" class="ears-rule-button" data-ears-rule="/assets/downloads/vale-ears/VagueTerms.yml" data-ears-rule-name="VagueTerms.yml" aria-pressed="false">VagueTerms.yml</button>
    </div>

    <div class="ears-code-panel" data-ears-rule-panel>
      <div class="ears-code-header">
        <strong data-ears-rule-title>EARS.yml</strong>
        <a data-ears-rule-raw href="/assets/downloads/vale-ears/EARS.yml" target="_blank" rel="noopener">Open raw</a>
      </div>
      <pre tabindex="0"><code data-ears-rule-code>Loading rule…</code></pre>
      <p class="ears-code-error" data-ears-rule-error hidden>Could not load this rule. Use “Open raw” instead.</p>
    </div>

    <p class="mt-4">This is intentionally a constrained validator, not a claim that every English requirement can or should be expressed as EARS. The useful boundary here is narrower: catch known ambiguity before a coding agent starts implementation.</p>
  </div>

  <div class="ears-card">
    <div class="eyebrow mb-3">Reference</div>
    <p>EARS was created by Alistair Mavin to gently constrain natural-language requirements through a small set of ordered clauses. Vale provides a script extension point using Tengo for rules that need logic beyond simple token matching.</p>
    <div class="ears-actions ears-reference-actions">
      <a href="https://alistairmavin.com/ears/" target="_blank" rel="noopener">EARS reference</a>
      <a href="https://vale.sh/features/extensible" target="_blank" rel="noopener">Vale extensibility</a>
    </div>
  </div>
</section>

<script src="/assets/js/ears-validator.js"></script>
<script src="/assets/js/ears-playground.js"></script>
