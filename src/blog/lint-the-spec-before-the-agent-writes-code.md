---
title: "Lint the spec before the agent writes code"
slug: "lint-the-spec-before-the-agent-writes-code"
date: 2026-08-28
description: "Use Vale and EARS as a deterministic quality gate in OpenSpec propose before coding agents turn ambiguous specifications into code."
status: draft
pillar: engineering
relatedTalks: []
tags:
  - post
  - agentic-ai
  - ai-agent
  - software-engineering
  - software-development
---

# Lint the spec before the agent writes code

With agentic coding, I keep running into the same problem: agents are very good at executing what we tell them, including the parts we did not think through properly.

That becomes especially interesting with Specification-Driven Development. A specification is no longer just documentation. It becomes input for an agent that may generate a significant amount of code from it.

Consider this requirement:

```text
When authentication fails, the API could return an error quickly.
```

It reads reasonably well. But for an agent it leaves several decisions open.

What does `could` mean? Is returning the error optional? What does `quickly` mean? And how do we verify afterwards that the requirement was implemented correctly?

The Markdown is valid. The instruction is not.

So I started experimenting with **prose validation inside the agentic coding flow**.

## Structuring requirements with EARS

One part of the experiment is EARS, the **Easy Approach to Requirements Syntax**.

EARS gently constrains natural-language requirements using a small number of patterns. Requirements can, for example, describe behaviour that always applies, behaviour triggered by an event, behaviour while the system is in a particular state, or responses to unwanted situations.

An event-driven requirement follows this pattern:

```text
WHEN <trigger>,
THE <system>
SHALL <response>
```

Our authentication requirement can therefore become:

```text
When authentication fails,
the API SHALL return HTTP 401 within 200 ms.
```

The difference looks small, but we have stopped delegating several engineering decisions to the implementation agent.

There is now a trigger, a system response and explicit modality. The `200 ms` constraint also gives us something measurable.

EARS does not tell us whether 200 ms is the right requirement. That remains an engineering decision.

It helps make sure we actually make that decision before implementation.

## Actually validating EARS with Vale

Writing “use EARS” in `AGENTS.md` is useful, but an agent can still ignore it.

I wanted the constraint to be executable.

Vale lets you define custom prose rules in YAML. For this experiment I ended up with an OpenSpec-aware EARS rule that checks the requirement statement after each `### Requirement:` heading against the EARS forms we accept. Weak modality and vague language remain separate rules instead of being folded into one giant regular expression.

You can try the authentication example yourself, see which EARS clauses are detected, and inspect the actual Vale rules inline in the **[EARS Requirement Playground](https://roelvanbergen.nl/labs/ears/)**.

For example, weak modality stays deliberately simple:

```yaml
# Requirements/WeakModality.yml
extends: existence
message: "Avoid weak requirement modality: '%s'."
level: error
ignorecase: true
tokens:
  - '\bcould\b'
  - '\bmight\b'
```

A separate rule flags vague language such as `quickly`, `efficiently` or `as soon as possible`.

The repository config then enables the requirement rules for the specification Markdown. The point is not to add another AI review step. It is to make known specification smells deterministic and cheap to detect.

## Put the feedback in propose

The placement is important.

I wired Vale into the **OpenSpec propose flow**, immediately after the agent generates the specification.

Conceptually, the extension is this small:

```markdown
After generating the specification:

1. Run Vale against the generated specs.
2. If prose validation fails, inspect the findings.
3. Update the specification.
4. Run Vale again.
5. Do not complete propose while errors remain.
```

So the agent itself gets feedback while it is still defining the work.

Our original authentication requirement now fails before implementation because of `could` and `quickly`. The agent has to tighten the specification first.

That is exactly where I want the failure.

## A quality gate for agent input

We put linters, tests and static analysis around the output of coding agents because we do not blindly trust generated code.

Why would we blindly trust the prose we use to generate it?

As coding agents become more autonomous, specification quality stops being a documentation problem. It becomes part of the control system.

**If the specification is executable input, ambiguity is a defect. Catch it before the agent turns it into code.**
