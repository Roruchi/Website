---
title: "Good Architects Build Playgrounds, Not Cages"
slug: "good-architects-build-playgrounds-not-cages"
date: 2026-11-06
description: "Clear boundaries can give software teams room to experiment. How architects can use governance to enable decisions instead of collecting approvals."
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

During my Solution Architecture training, one question stayed with me: **can the right boundaries create more freedom than having none at all?** Governance often means giving up some autonomy. There are rules to follow and decisions you can no longer make on your own. Yet I've also been in a team where adding a release process helped us release faster. That tension is what interests me.

![Children play in an open grassy meadow, with a low stone wall protecting the cliff edge above the sea.](/assets/images/governance-playground-cover.webp)

In *Orthodoxy* (1908), G. K. Chesterton imagines children playing on a grassy island surrounded by steep cliffs. A wall protects the edge, leaving them free to explore the space inside. When the wall is removed, they huddle in the centre, afraid of falling. Removing the boundary has made their world smaller.

I keep coming back to that image when I think about architecture. We spend a lot of time discussing which boundaries a team needs. I think we should spend just as much time asking whether people have room to work within them.

## Isn't governance the enemy of creativity?

Architecture principles, security requirements and decisions that need documenting all ask something of a team. Add an architect questioning a technology choice, and it's understandable that governance can feel restrictive. Every new rule seems to take another decision out of your hands.

Sometimes that feeling is justified. If every choice needs approval, people have little room to try something themselves. Even a small change becomes a discussion about who is allowed to decide. Calling a team autonomous doesn't help much if it still has to ask permission at every step.

But removing the rules doesn't necessarily resolve that uncertainty. When nobody knows which decisions belong to the team, the same discussions keep coming back. Can we use this technology? Who owns security? Are we allowed to deploy independently? Clear agreements can help people answer those questions themselves.

## From control to confidence

At one of my customers, I was part of a team that kept spending hours fixing releases outside the agreed change window. We added a release checklist and more automated checks and balances to the process. That took away some autonomy: there were now gates we had to pass before releasing.

The team could release faster, though, because we spent less time fixing things on the spot. We gave up some freedom in how we released and gained time back from the repairs.

That experience gives me a concrete way to think about governance. A gate can be useful when it helps a team deal with a recurring problem. Whether it does that matters more to me than whether the process looks complete on paper.

For a team that wants to deploy independently, agreements about tests, security, monitoring and rollback can make the release boundary clear. People need to know what they can decide themselves and who to involve when a change falls outside those agreements. The checks and level of oversight depend on the risks involved; a change affecting sensitive customer data needs different consideration from a reversible experiment.

![Within agreed safeguards, the team deploys independently. A change outside the release boundary needs a conversation with the risk owner.](/assets/images/governance-release-mermaid.svg)

Within that boundary, the team still has technical choices to make. It can try a different implementation without renegotiating the entire release process. That's the room I want governance to leave open.

## What does that mean for an architect?

For me, part of the architect's job is helping a team work out which boundaries it needs and why. What agreements would let people make good decisions independently? Where do they need help, and where are we asking them to wait for approval they could do without?

Architecture principles can make the boundaries visible. Architecture Decision Records (ADRs) can preserve the reasons behind a decision, so the next team doesn't have to guess. Quality attributes can turn "make it reliable" into an expectation people can discuss and check.

![Principles define boundaries, decision records explain why, and quality attributes make expectations checkable. Together they support independent team decisions.](/assets/images/governance-decisions-mermaid.svg)

This connects to what I wrote about [making implicit engineering knowledge explicit](/blog/your-ai-agent-isnt-the-problem-your-engineering-discipline-is-634b706d776d/). A boundary that only exists in someone's head is difficult to work within, whether you're a new developer or an AI agent.

We also need to revisit those agreements. A rule may have addressed a real problem when it was introduced, but does it still help? Does this approval reduce risk, or are we keeping it because it has always been there? A playground with fences at every turn leaves very little room to play.

## Freedom within boundaries

I recognise this tension from [finding a balance between control and letting go](/blog/my-journey-with-perfectionism-finding-balance-104b4b4a1ce6/). When mentoring interns, I sometimes gave too little guidance and other times held on too tightly. Working out how much support someone needs takes attention. I think architecture asks something similar of us: enough structure to help people move forward, with room for them to make their own choices.

At your next team or architecture discussion, pick one release gate or recurring approval and look at what it actually does. What problem was it introduced to solve? Does it still help the team? Agree on one change to try, whether that's automating a check, making an agreement clearer or removing an approval that no longer serves a purpose. Then come back to it together and see whether it helped.

Which boundary in your team gives you room to work, and which one would you change? I'd like to hear your experience. You can [send me a message on LinkedIn](https://www.linkedin.com/in/roelvanbergen/).

---

*Source: G. K. Chesterton, [Orthodoxy (1908), Chapter IX: "Authority and the Adventurer"](https://www.gutenberg.org/cache/epub/130/pg130.html), on religious authority and liberty.*
