---
title: "Good Architects Build Playgrounds, Not Cages"
slug: "good-architects-build-playgrounds-not-cages"
date: 2026-11-06
description: "Architecture and governance can give teams the confidence to act independently. How clear boundaries create room for ownership and experimentation."
status: draft
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

During my Solution Architecture training, one question stayed with me: **can the right boundaries create more freedom than having none at all?** Architecture and governance are often experienced as restrictions on what a team can do. I think they can be a powerful enabler: knowing what matters and where your responsibility lies gives you a basis for making your own decisions.

![Children play in an open grassy meadow, with a low stone wall protecting the cliff edge above the sea.](/assets/images/governance-playground-cover.webp)

Imagine a grassy island high above the sea, with children running and playing across it. Along the cliff edge stands a wall. With that boundary around them, the children can give themselves over to their games; the whole space inside is theirs to explore. This is the scene G. K. Chesterton asks us to imagine in *Orthodoxy* (1908).

Now picture the same island without the wall. The grass still stretches to the edge, but beyond it is an unprotected drop into the sea. The children draw back and huddle in the centre. There is nothing left to stop them going wherever they want, yet they use less of the island than before. The wall had given them the confidence to play.

That image captures what interests me about governance. A boundary can feel limiting while also creating the conditions for people to act with confidence. When a team understands which risks it needs to account for and which choices it owns, there is room to experiment without having to renegotiate that responsibility every time.

## Isn't governance the enemy of creativity?

Architecture principles, security requirements and decisions that need documenting all ask something of a team. Add an architect questioning a technology choice, and it's understandable that governance can feel restrictive. Every new rule seems to take another decision out of your hands.

Sometimes that feeling is justified. If every choice needs approval, people have little room to try something themselves. Even a small change becomes a discussion about who is allowed to decide. Calling a team autonomous doesn't help much if it still has to ask permission at every step.

But removing the rules doesn't necessarily resolve that uncertainty. When nobody knows which decisions belong to the team, the same discussions keep coming back. Can we use this technology? Who owns security? Clear agreements can help people answer those questions themselves and take responsibility for the choices they make.

Governance also gives those choices direction. Architectural principles and quality expectations help a team weigh alternatives against what the organisation needs. The team can choose an implementation while understanding what it must protect and where its decisions affect others. That shared understanding is part of what makes autonomy workable.

## From control to confidence

At one of my customers, I was part of a team that kept spending hours fixing releases outside the agreed change window. We added a release checklist and more automated checks and balances to the process. That took away some autonomy: there were now gates we had to pass before releasing.

The team could release faster, though, because we spent less time fixing things on the spot. We gave up some freedom in how we released and gained time back from the repairs.

In that case, governance became tangible through the release process. The broader architectural question is which decisions a team can own and under what conditions. For releases, agreements about tests, security, monitoring and rollback can define that space. A technology choice or a change to a shared interface needs its own boundaries, with attention to the people and systems affected.

![Within agreed safeguards, the team deploys independently. A change outside the release boundary needs a conversation with the risk owner.](/assets/images/governance-release-mermaid.svg)

## What does that mean for an architect?

For me, part of the architect's job is helping a team understand the intent behind the boundaries. What are we trying to achieve? Which choices belong to the team, and where does it share responsibility with others? People need enough context to use their judgement, including when a new situation calls an existing agreement into question.

Architecture principles can make the boundaries visible. [Architecture Decision Records (ADRs), as described in arc42](https://docs.arc42.org/section-9/), preserve the context, reasoning and consequences of important decisions, so the next team doesn't have to guess why a choice was made. Quality attributes can turn "make it reliable" into an expectation people can discuss and check.

![Principles define boundaries, decision records explain why, and quality attributes make expectations checkable. Together they support independent team decisions.](/assets/images/governance-decisions-mermaid.svg)

This connects to what I wrote about [making implicit engineering knowledge explicit](/blog/your-ai-agent-isnt-the-problem-your-engineering-discipline-is-634b706d776d/). A boundary that only exists in someone's head is difficult to work within, whether you're a new developer or an AI agent.

We also need to revisit those agreements. A principle may have served a clear purpose when it was introduced, but does it still help the team make good decisions? Can people explain why it matters, or do they follow it because it has always been there? A playground with fences at every turn leaves very little room to play.

## Freedom within boundaries

Working out how much guidance a team needs takes attention. Too much control leaves little room for ownership; too little direction leaves people guessing. I think architecture asks us to stay involved in finding that balance: enough structure to help people move forward, with room for them to make their own choices.

At your next architecture discussion, bring a decision the team keeps referring back to you. Work through the intent and risks together, then agree on the boundaries within which the team can own that decision. Write down the reasoning and let the team act on it. If every choice still comes back to the architect, the work of enabling that team is unfinished.

**Which decision can your team now make for itself because of the governance you've put in place?**

---

*Source: G. K. Chesterton, [Orthodoxy (1908), Chapter IX: "Authority and the Adventurer"](https://www.gutenberg.org/cache/epub/130/pg130.html), on religious authority and liberty.*
