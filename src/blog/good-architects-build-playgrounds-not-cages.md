---
title: "Good Architects Build Playgrounds, Not Cages"
slug: "good-architects-build-playgrounds-not-cages"
date: 2026-11-06
description: "Why good governance can enable creativity, giving teams the clarity, safety, and autonomy to make decisions and experiment."
status: draft
pillar: engineering
relatedTalks: []
tags:
  - post
  - software-engineering
  - soft-skills
  - philosophy
---

*Why governance doesn't have to restrict creativity. It can be what makes creativity possible.*

In 1908, G. K. Chesterton proposed a thought experiment in his book *Orthodoxy*.

Imagine children playing on a grassy island surrounded by steep cliffs. A wall protects the edge. Inside that boundary, the children run, play, and explore freely.

Now imagine removing the wall. There is nothing left to restrict their movement.

Yet in Chesterton's imagined scene, the children do not become more adventurous. They huddle in the centre, frightened of the unprotected drop.

They have fewer physical barriers, but feel less free to play.

Chesterton was writing about religious authority and liberty, not software architecture. And this wasn't an actual event. It's a philosophical illustration, not evidence that boundaries automatically make people more creative.

Still, it raises a question that stayed with me during my Solution Architecture training:

**Can the right boundaries create more freedom than having none at all?**

## Isn't governance the enemy of creativity?

In many organisations, governance is seen as something restrictive.

Architecture principles you have to comply with. Security requirements you have to meet. Decisions you have to document. An architect asking why you chose a particular technology.

Every new rule can feel like another piece of freedom taken away.

And sometimes, that feeling is justified.

When governance becomes a maze of approvals, bureaucracy, and instructions for every step, it really does get in the way. You end up building a cage.

But good governance should do something fundamentally different.

## From control to confidence

Imagine two software teams.

The first team has very few explicit architectural principles. Every significant decision triggers another discussion. Can we use this technology? Who owns security? Are we allowed to deploy independently?

Because the boundaries are unclear, the team repeatedly needs alignment or permission. On paper, it has freedom. In practice, uncertainty makes it hesitant.

The second team works within clear architectural principles. Security expectations are explicit, ownership is understood, and there are agreements about monitoring, quality, and rollback.

Within those boundaries, the team has autonomy.

It doesn't need approval for every technical choice. It knows which decisions it can make, which risks it can take, and when it needs to involve others.

**Governance doesn't just define what a team cannot do. Done well, it makes clear what a team can do without asking permission.**

That clarity can create room for experimentation and creativity.

Consider a practical example: a team is allowed to deploy whenever its automated tests, security checks, monitoring, and rollback strategy meet agreed standards. The team doesn't need a separate approval for every release, because the critical safeguards are already part of the delivery process.

This is not governance disappearing. It is governance making independent action possible.

Of course, it depends on the risks involved. A production change affecting sensitive customer data may need a different level of oversight from a reversible experiment. The point is not to remove judgement, but to place decision-making where it can happen responsibly.

## What does that mean for an architect?

This changes how I think about the architect's role.

An architect isn't there to build as many walls as possible.

The job is to help identify which boundaries are necessary, why they exist, and how much freedom teams should have within them.

That means asking a different question.

Not: *How do we make sure everyone follows our rules?*

But: *What agreements do teams need so they can make good decisions independently?*

Architecture principles, Architecture Decision Records (ADRs), and quality attributes become more than ways to exercise control. They become tools for enabling autonomy.

And just as importantly, we should regularly challenge the boundaries we've created.

Does this rule still protect something important? Does this approval step genuinely reduce risk? Or are we keeping a wall simply because it has always been there?

A playground surrounded by fences at every turn is just a maze.

## Freedom within boundaries

Good governance does not make every decision for you.

It creates an environment where you can make decisions confidently, without constantly worrying about crossing an invisible line.

That's one of the insights I find most interesting from my architecture training.

**The best governance isn't the governance that controls the most decisions. It's the governance that enables the most good decisions without intervention.**

So perhaps the question we should ask is:

*Are we using governance to build a safe playground, or have we accidentally built a cage?*

---

*Source: G. K. Chesterton, [Orthodoxy (1908), Chapter IX: "Authority and the Adventurer"](https://www.gutenberg.org/cache/epub/130/pg130.html). The playground scene is a thought experiment, and its application to software governance is my interpretation.*
