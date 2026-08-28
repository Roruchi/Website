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

With agentic coding, I keep running into the same problem: agents are very good at executing what we tell them. Unfortunately, that includes the parts we did not think through properly.

That gets more interesting once you start working with Specification-Driven Development. The specification is no longer just documentation for humans. It becomes input for an agent that can turn a few lines of prose into quite a lot of code.

Take this requirement:

```text
When authentication fails, the API could return an error quickly.
```

It sounds reasonable enough at first glance. But what does `could` mean? Is the response optional? What is `quickly`? And how do we verify afterwards that the agent implemented what we actually meant?

The Markdown is valid. The instruction is not.

That is what got me experimenting with prose validation inside the agentic coding flow.

## Give the requirement some structure

One of the things I use for this is EARS, the **Easy Approach to Requirements Syntax**.

EARS puts a small amount of structure around natural-language requirements without trying to turn them into a programming language. A requirement can describe behaviour that always applies, something triggered by an event, behaviour while a state is active, an optional feature, or an unwanted situation.

For an event-driven requirement, the shape is roughly:

```text
WHEN <trigger>,
THE <system>
SHALL <response>
```

So the authentication example becomes:

```text
When authentication fails,
the API SHALL return HTTP 401 within 200 ms.
```

It is still plain English, but we have stopped delegating several engineering decisions to the implementation agent.

There is a trigger. There is an explicit system response. `SHALL` makes the intent normative, and `200 ms` gives us something we can actually verify.

EARS does not tell us whether 200 ms is the right requirement. Someone still has to make that decision. That is kind of the point: I want us to make it before the agent starts writing code.

## Make the constraint executable

Writing “use EARS” in `AGENTS.md` helps, but an agent can still ignore it.

My first instinct was that this would need another agent or some clever semantic validation. It did not. Most of the problems I wanted to catch were boring enough for a linter.

I ended up using Vale with an OpenSpec-aware EARS rule. It checks the requirement statement after each `### Requirement:` heading against the EARS forms I accept. Weak modality and vague language are separate rules instead of one giant regex pretending to understand English.

You can try the authentication example yourself and inspect the actual rules in the **[EARS Requirement Playground](https://roelvanbergen.nl/labs/ears/)**.

The weak-modality rule is deliberately boring:

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

Another rule catches vague terms such as `quickly`, `efficiently` and `as soon as possible`.

That is really the whole idea. Known smells become deterministic and cheap to detect. No extra model call needed.

## Fail during propose, not after implementation

The placement matters more than the rules themselves.

I wired Vale into the **OpenSpec propose flow**, directly after the agent generates the specification. If prose validation fails, the agent gets the findings, updates the specification and runs the check again. Propose is not done while those errors remain.

That means our original authentication requirement fails while it is still a few lines of Markdown, not after an agent has already built something around `could` and `quickly`.

This is the part I like most about the experiment. The feedback happens while the agent is still defining the work.

I have a working use case now, but I am deliberately not claiming this produces better software yet. I still want to see which rules survive real usage, where the false positives are, and whether this actually reduces corrections later in apply and review.

What I do know is that agentic coding makes ambiguity scale surprisingly well.

We already put linters, tests and static analysis around generated code because we do not blindly trust the output. I think the input deserves the same treatment.

**If the specification is executable input, ambiguity is a defect. Catch it before the agent turns it into code.**
