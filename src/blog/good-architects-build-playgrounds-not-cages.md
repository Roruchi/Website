---
title: "Good Architects Build Playgrounds, Not Cages"
slug: "good-architects-build-playgrounds-not-cages"
date: 2026-11-16
description: "Architecture and governance can give teams the confidence to act independently. How clear boundaries create room for ownership and experimentation."
status: published
pillar: engineering
cover: "/assets/images/governance-playground-cover.webp"
coverAlt: "Children play in an open grassy meadow, with a low stone wall protecting the cliff edge above the sea."
relatedTalks: []
tags:
  - post
  - software-engineering
  - soft-skills
  - philosophy
---

During my Solution Architecture training, one question stayed with me: **can the right boundaries create more freedom than having none at all?** We often talk about architecture and governance in terms of what a team is allowed to do. I think there's more to it. Knowing why a boundary exists, and which choices are yours to make within it, can give you the confidence to try something yourself.

![Children play in an open grassy meadow, with a low stone wall protecting the cliff edge above the sea.](/assets/images/governance-playground-cover.webp)

Imagine a grassy island high above the sea, with children running and playing across it. Along the cliff edge stands a wall. With that boundary around them, the children can give themselves over to their games; the whole space inside is theirs to explore. This is the scene G. K. Chesterton asks us to imagine in *Orthodoxy* (1908).

Now picture the same island without the wall. The grass still stretches to the edge, but beyond it is an unprotected drop into the sea. The children draw back and huddle in the centre. There is nothing left to stop them going wherever they want, yet they use less of the island than before. The wall had given them the confidence to play.

That's what interests me about governance. The boundary that seems to limit a team can also give it room to work. Once people understand which risks they need to account for and which choices they own, they can explore an idea without first having to ask whether they're allowed to.

## Isn't governance the enemy of creativity?

It's easy to see why governance gets a different reputation. A team wants to try a technology, but there are architectural principles to consider, security requirements to meet and a decision to document. An architect wants to know why this particular choice makes sense. Before the team has tried anything, there's already work to do to explain it.

Some of that work helps people think a choice through. But if every choice needs approval, even a small change becomes a discussion about who is allowed to decide. Calling a team autonomous doesn't help much when it still has to ask permission at every step.

Removing the rules can leave the team with much the same uncertainty. Can we use this technology? Who owns security? Clear agreements help people answer those questions and understand what the organisation needs from their choices. That gives the team direction when it weighs alternatives, including where a choice affects other teams.

## From control to confidence

At one of my customers, I was part of a team that kept spending hours fixing releases outside the agreed change window. People were frustrated at getting calls at five in the afternoon because it was unclear what was working and what wasn't during a release. We needed to know what to do and what to check.

We added a release checklist and more automated checks and balances. That took away some autonomy: there were now gates we had to pass before releasing. Being told what to do and check can feel constrictive, but here it helped. We could release faster because we spent less time figuring out what was working and fixing things on the spot.

What does a team need to know so it can take a decision and carry the responsibility for it? For releases, that may mean agreements about tests, security, monitoring and rollback. For a technology choice or a shared interface, it means understanding who else will have to live with the consequences.

![Within agreed safeguards, the team deploys independently. A change outside the release boundary needs a conversation with the risk owner.](/assets/images/governance-release-mermaid.svg)

## What does that mean for an architect?

For me, an architect needs to work out those boundaries with the team. If I decide every constraint myself and then explain it to everyone else, how much ownership am I really leaving them? The people working within an agreement need a voice in shaping it and room to challenge it when it no longer fits.

This is where architectural principles and decision records become useful in everyday work. A principle gives the team a boundary to work within. An [Architecture Decision Record (ADR), as described in arc42](https://docs.arc42.org/section-9/), lets someone joining later understand why a choice was made and what consequences were accepted. Quality attributes help with another familiar problem: turning "make it reliable" into an expectation people can discuss and check.

This connects to what I wrote about [making implicit engineering knowledge explicit](/blog/your-ai-agent-isnt-the-problem-your-engineering-discipline-is-634b706d776d/). A boundary that only exists in someone's head is difficult to work within, whether you're a new developer or an AI agent.

If people can only explain a principle with "that's how we've always done it", I think we owe them another look at it. A playground with fences at every turn leaves very little room to play.

## Freedom within boundaries

Working out how much guidance a team needs takes attention. I think architecture asks us to stay involved in finding that balance: enough structure to help people move forward, with room for them to make their own choices.

At your next architecture discussion, bring a decision the team keeps referring back to you. Work through the intent and risks together, then agree on the boundaries within which the team can own that decision. Write down the reasoning and let the team act on it. If every choice still comes back to the architect, the work of enabling that team is unfinished.

**Which decision can your team now make for itself because of the governance you've put in place?**

---

*Source: G. K. Chesterton, [Orthodoxy (1908), Chapter IX: "Authority and the Adventurer"](https://www.gutenberg.org/cache/epub/130/pg130.html), on religious authority and liberty.*
