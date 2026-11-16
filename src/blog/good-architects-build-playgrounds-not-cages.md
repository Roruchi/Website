---
title: "Good Architects Build Playgrounds, Not Cages"
slug: "good-architects-build-playgrounds-not-cages"
date: 2026-11-06
description: "Clear boundaries can give software teams room to experiment. How architects can use governance to enable decisions instead of collecting approvals."
status: draft
pillar: engineering
cover: "/assets/images/governance-playground.svg"
coverAlt: "A shared boundary around tests, security, monitoring and rollback leaves room for teams to experiment and deploy independently."
relatedTalks: []
tags:
  - post
  - software-engineering
  - soft-skills
  - philosophy
---

*Why governance doesn't have to restrict creativity. It can be what makes creativity possible.*

During my Solution Architecture training, one question stayed with me: **can the right boundaries create more freedom than having none at all?**

In 1908, G. K. Chesterton proposed a thought experiment in his book *Orthodoxy*.

Imagine children playing on a grassy island surrounded by steep cliffs. A wall protects the edge. Inside that boundary, the children run, play, and explore freely.

Now imagine removing the wall. There is nothing left to restrict their movement.

Yet in Chesterton's imagined scene, the children do not become more adventurous. They huddle in the centre, frightened of the unprotected drop.

They have fewer physical barriers, but feel less free to play.

Chesterton was writing about religious authority and liberty, not software architecture. And this wasn't an actual event. It's a philosophical illustration, not evidence that boundaries automatically make people more creative.

I find it a useful way to think about governance. The wall matters because of the freedom it leaves inside.

## Isn't governance the enemy of creativity?

In many organisations, governance is seen as something restrictive.

Architecture principles you have to comply with. Security requirements you have to meet. Decisions you have to document. An architect asking why you chose a particular technology.

Every new rule can feel like another piece of freedom taken away. Sometimes, that feeling is justified. A maze of approvals and instructions for every step really does get in the way. You end up building a cage.

But I think governance earns its place when it helps teams act independently.

## From control to confidence

Imagine two software teams. This is an illustration, not a comparison of measured team outcomes.

The first team has very few explicit architectural principles. Every significant decision triggers another discussion. Can we use this technology? Who owns security? Are we allowed to deploy independently?

Because the boundaries are unclear, the team repeatedly needs alignment or permission. On paper, it has freedom. In practice, uncertainty makes it hesitant.

The second team works within clear architectural principles. Security expectations are explicit, ownership is understood, and there are agreements about monitoring, quality, and rollback.

Within those boundaries, the team has autonomy.

It doesn't need approval for every technical choice. It knows which decisions it can make, which risks it can take, and when it needs to involve others.

**Governance doesn't just define what a team cannot do. Done well, it makes clear what a team can do without asking permission.**

Consider a possible release agreement: a team can deploy independently when its automated tests and security checks pass, monitoring is in place, and it has a rollback strategy that meets agreed standards. A change outside those boundaries needs a conversation with the people who own the affected risk.

The agreement needs to name those people and make the standards available to the team. Otherwise, "you have autonomy" can still mean "ask around until someone says yes."

![Tests, security, monitoring and rollback form a shared boundary. Inside it, teams can experiment, choose an implementation and deploy independently.](/assets/images/governance-playground.svg)

The team still has technical choices to make. It can try a different implementation without renegotiating the entire release process. The safeguards define where it can act independently and where it needs help.

This is not governance disappearing. It is governance making independent action possible.

Of course, it depends on the risks involved. A production change affecting sensitive customer data may need a different level of oversight from a reversible experiment. The point is not to remove judgement, but to place decision-making where it can happen responsibly.

## What does that mean for an architect?

This changes how I think about the architect's role.

An architect isn't there to build as many walls as possible.

The job is to help identify which boundaries are necessary, why they exist, and how much freedom teams should have within them.

That means asking a different question.

Not: *How do we make sure everyone follows our rules?*

But: *What agreements do teams need so they can make good decisions independently?*

Architecture principles can make the boundaries visible. Architecture Decision Records (ADRs) can preserve the reasons behind a decision, so the next team doesn't have to guess. Quality attributes can turn "make it reliable" into an expectation people can discuss and check.

This connects to what I wrote about [making implicit engineering knowledge explicit](/blog/your-ai-agent-isnt-the-problem-your-engineering-discipline-is-634b706d776d/). A boundary that only exists in someone's head is difficult to work within, whether you're a new developer or an AI agent.

And just as importantly, we should regularly challenge the boundaries we've created.

Does this rule still protect something important? Does this approval step genuinely reduce risk? Or are we keeping a wall simply because it has always been there?

A playground surrounded by fences at every turn is just a maze.

## Freedom within boundaries

Good governance does not make every decision for you.

It creates an environment where you can make decisions confidently, without constantly worrying about crossing an invisible line.

**The best governance isn't the governance that controls the most decisions. It's the governance that enables the most good decisions without intervention.**

That also means resisting the urge to solve uncertainty by adding another rule. I recognise the tension from [finding a balance between control and letting go](/blog/my-journey-with-perfectionism-finding-balance-104b4b4a1ce6/): too much control leaves no room to grow, but no guidance isn't much help either.

At your next architecture discussion, pick one recurring approval. What risk does it protect against? Could a clear agreement let the team make that decision itself? If it still needs review, make clear who should be involved and why.

Then ask:

*Are we using governance to build a safe playground, or have we accidentally built a cage?*

---

*Source: G. K. Chesterton, [Orthodoxy (1908), Chapter IX: "Authority and the Adventurer"](https://www.gutenberg.org/cache/epub/130/pg130.html). The playground scene is a thought experiment, and its application to software governance is my interpretation.*
