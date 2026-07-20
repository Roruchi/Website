---
title: "Waiting for Agents"
slug: "waiting-for-agents"
date: 2026-07-20
description: "Agent execution can be fast while human attention fragments. This explores the hidden cost of waiting, checking, and autonomous rabbit holes."
status: draft
pillar: engineering
relatedTalks: []
tags:
  - post
  - agentic-ai
  - ai-agent
  - flow
  - software-engineering
---

> Editorial status: idea brief. Ground the final article in actual session or observability data.

## Possible hook

The agent is still running, so I open another task.

Ten minutes later, three agents are waiting for decisions, I have forgotten the first task's intent, and none of the work is actually reviewable.

Execution became parallel. My attention did not.

## Core tension

Agentic tools reduce implementation time, but they introduce a different kind of waiting:

- waiting for a long-running task;
- repeatedly checking progress;
- switching to another task too early;
- returning to a diff after losing its context;
- discovering that an autonomous agent followed a plausible rabbit hole;
- becoming the coordination bottleneck for too many parallel workers.

The problem is not simply latency. It is fragmented supervision.

## Questions to explore

- When is parallel agent work genuinely faster?
- How much context must a human reload before reviewing each result?
- At what point does another agent increase work in progress instead of throughput?
- Which progress updates help, and which merely create notification noise?
- How should stop conditions interrupt an attractive but irrelevant rabbit hole?
- Can observability show useful work, rework, waiting, and discarded output separately?

## Practical model

### Bound the run

Give the agent a concrete outcome, allowed actions, validation commands, and stop conditions.

### Create reviewable checkpoints

Prefer evidence-bearing milestones over continuous status narration.

### Limit work in progress

Do not start another agent only because the current one takes time. Start it when the review and decision capacity also exists.

### Preserve intent

Keep the task definition and important decisions near the resulting diff so review does not depend on memory.

### Measure the system

Track elapsed time, active agent time, human attention, retries, discarded work, and final review effort where possible.

## Closing direction

The next productivity bottleneck may not be code generation. It may be the human ability to direct, interrupt, and review several fast systems without losing the thread.
