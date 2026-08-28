# Vale EARS rules for OpenSpec

A small experimental Vale ruleset for tightening OpenSpec requirements before an implementation agent receives them.

## Rules

- `EARS.yml` validates the first non-empty statement after each `### Requirement:` heading against a constrained EARS grammar.
- `WeakModality.yml` flags weak normative terms such as `could`, `might`, `should`, and `may`.
- `VagueTerms.yml` flags common non-verifiable wording such as `quickly` and `as soon as possible`.

## Supported EARS forms

```text
The <system> SHALL <response>
While <state>, the <system> SHALL <response>
When <trigger>, the <system> SHALL <response>
Where <feature>, the <system> SHALL <response>
If <trigger>, then the <system> SHALL <response>
While <state>, when <trigger>, the <system> SHALL <response>
```

The EARS rule is deliberately OpenSpec-aware rather than applied to every sentence containing `SHALL`. This prevents scenario steps and explanatory prose from being mistaken for requirement statements.

## Example configuration

Place the rules under your Vale `StylesPath`, for example:

```text
.vale/
  styles/
    Requirements/
      EARS.yml
      WeakModality.yml
      VagueTerms.yml
```

Then enable them only for OpenSpec Markdown:

```ini
StylesPath = .vale/styles
MinAlertLevel = warning

[openspec/**/*.md]
BasedOnStyles = Requirements
```

Run:

```bash
vale openspec/changes
```

## Scope and limitations

This is an experimental quality gate, not a general natural-language requirements parser. It deliberately supports the common EARS forms used by the accompanying agentic-coding experiment. A failing rule means the requirement needs human or agent attention, not that the validator can determine whether the engineering decision itself is correct.

Reference: https://alistairmavin.com/ears/
