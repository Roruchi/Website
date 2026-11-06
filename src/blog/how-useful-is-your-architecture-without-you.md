---
title: "How useful is your architecture without you?"
slug: "how-useful-is-your-architecture-without-you"
date: 2026-10-21
description: "As agents and colleagues reuse our architecture, missing context matters more. Who still needs to be heard before we trust the picture?"
status: draft
pillar: engineering
relatedTalks: []
tags:
  - post
  - agentic-ai
  - software-engineering
  - zen
---

An architecture diagram can make perfect sense while its author is in the room. Give it to a colleague, or an agent investigating a different question, and you may discover how much of that understanding depended on the explanation that came with it.

We choose what to include in a diagram. What happens when someone starts making decisions from what we left out?

> Imagine a young monk sent to fetch water from a spring outside the monastery. In the library, he finds two maps. One shows the path heading east. The other points west.
>
> He takes them to his teacher.
>
> “Which one is right?”
>
> “I don’t know.”
>
> “But you’ve lived here for thirty years.”
>
> “And I get my water from the kitchen.”
>
> The teacher gets up and picks up two buckets.
>
> “Come on. Let’s ask the gardener.”

I recognise that gardener from my own work. I was involved in a migration to a container platform. Decisions had been documented and technical requirements collected. Our team had not yet been involved.

We only understood how urgent the migration was when we put deadlines from different sources next to each other. Reading them together revealed the pressure we were under.

The decisions existed, but their consequences had not been fully understood by the people who would have to work with them. Nobody had spoken to the gardener yet.

That is where I want agents to help with architecture work. A diagram, a decision record or a set of requirements can become input for a new question. An agent can help compare those sources and surface dependencies or inconsistencies that deserve attention.

It still needs to be clear what those sources describe. Is this the current situation or an intended design? Does a recorded decision describe something that has actually been implemented? If conflicting sources affect the analysis, I want the agent to ask before drawing a picture that makes the conflict disappear.

A convincing answer deserves the same scrutiny. Does the conclusion follow from the sources? Are those sources relevant to this question? Who can tell us what they are missing?

The teacher has enough confidence to admit that thirty years at the monastery have not taught him this particular path. That willingness to say “I don’t know” is something I recognise in Zen practice. As architects, we can understand the wider landscape and still need someone who walks one small part of it every day.

An agent can misread the material too. But if a new colleague would struggle with the same documents, we also have work to do. How much have we made understandable? Whose knowledge have we never asked for?

For me, the promise of agents is the opportunity to make those gaps easier to see. Less time spent gathering information could leave more attention for the conversations that change a decision, especially with the people who will live with its consequences.

We still have to use that attention. Filling the saved time with more documents does little if nobody understands the architecture any better.

The teacher could have spent another afternoon studying the maps. He went to the gardener.

Who do we need to speak to before we record the next decision?
