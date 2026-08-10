---
title: "Agent-Ready Before Autonomous"
slug: "agent-ready-before-autonomous"
date: 2026-07-20
description: "Why teams need clearer intent, context, guardrails, verification, and feedback loops before increasing agent autonomy."
status: draft
pillar: engineering
relatedTalks: []
tags:
  - post
  - agentic-ai
  - ai
  - software-development
  - software-engineering
---

> Editorial status: idea brief. Coordinate publication with the whitepaper and the paused AI-SDLC proposition.

## Possible hook

Most teams ask how much autonomy an agent should get.

A better first question is whether the engineering system is ready to support any autonomy at all.

## Core idea

Agent readiness is not a tool installation or a maturity score. It is the degree to which a team can make work explicit, bound execution, produce verification evidence, and learn from failures without relying on one experienced person to fill every gap.

The assessment should follow the whole lifecycle:

1. Idea
2. Intent
3. Work definition
4. Development
5. Verification
6. Delivery
7. Observability
8. Incident analysis
9. Learning loop

## Greenfield and brownfield are different

A greenfield team can design agent-friendly boundaries and feedback loops early.

A brownfield team may first need to understand the system it already has: hidden domain rules, weak tests, unclear ownership, production risk, and a codebase shaped by years of local decisions.

In a gigantic ball of mud, the first useful agent may be an investigator, not an autonomous implementer.

## What a readiness scan should reveal

For each lifecycle phase:

- what humans currently infer;
- which context is durable and trustworthy;
- where ownership is clear or missing;
- which actions are safe to automate;
- which quality gates produce real evidence;
- where production credentials or permissions create risk;
- how failures become learning rather than repeated review comments.

## Working conclusion

Autonomy should be earned by the surrounding engineering system.

Do not start by asking which agent can do the most. Start by making one workflow explicit enough that an agent can contribute without turning uncertainty into fast, plausible output.

## Boundaries

- Do not turn the article into a vendor or tool ranking.
- Keep the advice grounded in customer domain, data quality, risk, and existing engineering practices.
- Avoid a universal maturity ladder that treats every organization as the same.
- Connect to the whitepaper without reproducing its entire framework.
