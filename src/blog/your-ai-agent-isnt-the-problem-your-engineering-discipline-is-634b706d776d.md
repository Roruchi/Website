---
title: 'Your AI Agent Isn’t the Problem. Your Engineering Discipline Is.'
date: 2026-06-15
description: 'AI coding agents expose the implicit knowledge your team has been expecting humans to infer.'
pillar: engineering
cover: 'https://cdn-images-1.medium.com/max/1024/1*1qMawn9TQItqbuMipCCWBw.png'
originalUrl: 'https://medium.com/@roel.v.bergen/your-ai-agent-isnt-the-problem-your-engineering-discipline-is-634b706d776d'
draft: false
tags:
  - post
  - software-development
  - agentic-ai
  - ai
  - software-engineering
---

<p><em>AI coding agents expose the implicit knowledge your team has been expecting humans to infer.</em></p>

<figure>
  <img alt="A city map representing a software repository, with roads, districts, and hidden infrastructure" src="https://cdn-images-1.medium.com/max/1024/1*1qMawn9TQItqbuMipCCWBw.png" />
  <figcaption>What if our repositories are similar to city architecture and infrastructure?</figcaption>
</figure>

Your AI agent did exactly what you asked. That might be the problem.

A software system is like a city. From above, it can look structured: roads, districts, services, routes. But the real system also runs below the surface, through hidden infrastructure: old decisions, domain rules, fragile shortcuts, review habits, and production scars.

For years, experienced developers have been able to navigate that city by memory.

Then an AI agent enters the workflow, and suddenly the missing map becomes the problem.

## Humans fill in the gaps

A good developer does not just read a ticket. They interpret it. They connect it to previous decisions, remember past incidents, and understand which shortcuts are safe and which are not.

In city terms: they know which roads are safe, which bridges are fragile, and which route looks shorter but usually causes trouble later.

That judgment is valuable. But much of it is never written down. It is inferred, corrected, and carried by experienced people. As long as those people keep filling in the gaps, the system appears to work.

I see this in my own work. Two teams share the same product and repository. Smart people, good intentions, real delivery pressure - and still, some engineering practices exist more in people's heads than in the system itself.

For humans, that can work.

Until you start adding agents.

## Agents expose the invisible

AI agents also fill in gaps, but only with the context available to them.

They do not know about the architectural decision that never made it into the repository. They cannot see the domain rule hidden in an old ticket. They do not remember the shortcut everyone avoids because it caused a production incident six months ago. In other words: they enter the city with an incomplete map.

So when we give an agent a vague task in a codebase full of implicit rules, we are not delegating engineering.

We are delegating guessing.

And when the result is fast, plausible, and wrong, the uncomfortable question is not only, "Why did the AI fail?"

> It is also, "What did our team never make explicit?"

If the agent crosses an architectural boundary, where is that boundary described? If it passes the tests but misses the intent, what are those tests actually protecting? If it keeps making the same review mistake, why does that expectation still live only in a reviewer's head?

<figure>
  <img alt="An AI agent navigating the hidden infrastructure beneath a software system" src="https://cdn-images-1.medium.com/max/1024/1*9v9jUB9ZLvUlQ0Xt1aUsIQ.png" />
  <figcaption>Once agents enter the game, they also work with the hidden infrastructure.</figcaption>
</figure>

## Autonomy is designed, not granted

The answer is not to document everything. That usually creates a different problem: documentation nobody reads and diagrams nobody trusts.

The better answer is to improve the environment around the agent.

Teams often talk about autonomy as if it were a switch. Do we trust the agent or not? Can it change code or not?

But autonomy is not something you grant. It is something you design.

Like junior developers, agents become more useful when the environment helps them succeed: clear intent, visible boundaries, and fast feedback.

If you want an agent to operate with more autonomy, improve the system it works in:

- Make one architectural boundary explicit.
- Add one missing test.
- Capture one recurring domain rule.
- Turn a repeated review comment into an automated check.

Then observe where the agent still struggles and improve the environment again. That is how you start mapping the city. Not by documenting every street upfront, but by making the dangerous crossings, fragile bridges, and important routes visible where they matter.

That is the real engineering work: not prompting your way around a weak system, but strengthening the system itself.

## The payoff

The biggest benefit is not that AI agents perform better. It is that humans do too.

When important context becomes easier to find, new developers onboard faster, reviews become easier, and senior engineers spend less time acting as city guides for a city that was never properly mapped.

That is why the agent is just the mirror. The real improvement is the system around it.

Because if your process only works when the right senior developer happens to be in the room, you do not have engineering discipline. You have luck. And luck does not scale.

AI agents do not remove the need for engineering discipline. They increase the cost of ignoring it.

Developers often ask which AI tool to use. The more important question is how to use these tools without turning a codebase into a slot machine.

My advice:

> Do not only evaluate the agent. Evaluate the engineering system around it.

Ask your team what important knowledge you are still expecting humans to infer. Then pick one small part of that knowledge and make it explicit this week. Map one missing piece of the city.

Because your AI agent is **not** here to save your engineering process.

It is here to reveal it.

<figure>
  <img alt="A completed city map showing the visible structure and hidden infrastructure of an engineering system" src="https://cdn-images-1.medium.com/max/1024/1*Llvu2wu6JnpgTAhzjdrnaQ.png" />
</figure>
