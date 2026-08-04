---
title: "Our AI editorial team cost less than $250. The whitepaper still nearly failed"
slug: "de-whitepaper-die-door-zijn-eigen-agents-werd-ingehaald"
date: 2026-07-20
description: "We used 74 AI sessions and 186 million tokens to create a whitepaper. The hard part was not generating text. It was protecting authorship."
status: draft
pillar: engineering
relatedTalks: []
tags:
  - post
  - agentic-ai
  - ai
  - software-engineering
  - writing
---

We were writing a whitepaper about keeping humans accountable while agents perform more of the work. So, naturally, we used agents to help write it.

The first Word export was 41 pages.

That should have been a warning. We had chapter briefs, word budgets, specialist reviewers and a writer skill protecting my voice from day one.

Every chapter was defensible. The whitepaper as a whole was becoming worse.

The agents could improve whatever appeared in front of them. They could not decide which ideas deserved to survive. After a substantial cut, the structure was tighter, but much of the human tone had disappeared with the surplus words. Human readers noticed before our automated checks did.

That changed the question for me. How do you use agents to write a whitepaper without outsourcing authorship?

My answer is to build an editorial team, not an AI writer. Give agents bounded editorial jobs. Keep humans in charge of the argument, the exceptions and the final decision to publish.

## An agent can improve every section and still make the paper worse

The whitepaper, *AI Assisted Development: The Rockstars Way*, explains how development teams can let coding agents do more while keeping ownership inside the team. Javier Rennola, Timo Koole and I applied the same idea to the writing process.

I used ChatGPT to explore the problem, test angles and challenge my position. The thesis itself came from experience: execution can move towards agents, but ownership cannot.

We made that intent persistent. Each chapter had a writer brief in `_meta/`. `AGENTS.md` described the audience, terminology, sources, word limits and editorial boundaries. The `roel-writing-style` skill was part of the setup from the start. It gave every agent the same description of my preference for a clear position, concrete consequences and less corporate filler.

Specialist roles handled different questions:

- The **draft agent** produced or revised one bounded section.
- The **content-checker** looked across chapters for repetition, style breaks and contradictions.
- The **developer persona** tested technical credibility and practical usefulness.
- The **engineering-manager persona** tested coherence, team value and organisational consequences.

Each role had a reason to request more context, another example or one more qualification. Every suggestion could be correct while the document lost its point.

AI feedback is cheap. Accepting it is expensive.

## The 41-page cut fixed the length and damaged the voice

Our first export reached 41 pages. Across the eight core chapters, we cut 6,557 words down to 5,124. That removed 1,433 words, or 21.9 percent of the core text.

The cut was necessary. The result was shorter, clearer and easier to navigate. It was also too clean.

We removed duplication and background explanation, but also passages where the authors sounded like people who had done the work. Rough edges, doubts and specific consequences became competent AI prose. The argument survived. The sense that somebody stood behind it did not.

That became clear through human counter-readers. They did more than check grammar or technical correctness. They asked uncomfortable questions: Does this still sound like you? Where is the experience behind this claim? Would you say this sentence out loud? Why should a reader trust this conclusion?

After that feedback, we added `ai-generated-text-triage`, a read-only inspection step for generic transitions, suspicious symmetry and other AI writing patterns. We also rewrote parts ourselves without AI. Not every weak passage needed a better prompt. Some needed an author back in the room.

The human counter-readers remained essential. A style check can spot a pattern. A person can tell you that the document no longer feels owned.

## What 186 million tokens actually bought

We reconstructed 74 recorded sessions across Codex, Copilot and Claude Code, together processing approximately 186.2 million tokens. Using standard API-equivalent pricing, that activity came to roughly $211, and in any case less than $250.

This is an order-of-magnitude price tag, not a bill. The tools partly ran through subscriptions, most Codex input was cached and token counts are not perfectly comparable across products.

![Cost and observability of the AI editorial team](https://raw.githubusercontent.com/Roruchi/Website/aece3b3cdc14d2b99d7ad4403768f407c8cdbf6a/src/assets/images/ai-editorial-team-cost.svg)

Only 15.2 percent of Codex tokens went to writing and editing.

Review and feedback implementation consumed 51.4 percent. Add publishing, export and synchronisation, and 71.4 percent of token use happened after text already existed.

The agents were an editorial department: comparing versions, finding inconsistencies, processing feedback, maintaining artefacts and checking whether changes had landed everywhere.

For less than $250, that is remarkable leverage. It also corrects the usual AI-writing story. Producing sentences was cheap. Making them coherent, credible and recognisably ours took most of the system and all of the human judgement.

## Divide decision rights, not authorship percentages

People often ask what percentage was written by AI. I think that is the wrong measure.

An agent-assisted commit may change hundreds of sentences without changing the argument. A human decision to remove a chapter may change the entire paper without adding a single word. Counting keystrokes confuses production with authorship.

Our useful dividing line was decision rights.

![Decision rights between humans and the AI editorial team](https://raw.githubusercontent.com/Roruchi/Website/aece3b3cdc14d2b99d7ad4403768f407c8cdbf6a/src/assets/images/human-agent-editorial-roles.svg)

Agents could draft, compare, challenge, inspect and implement approved changes. Humans owned the thesis, supplied lived experience, judged conflicting feedback, chose what to cut and approved publication.

Human counter-readers formed a second boundary. The editor-in-chief can become too close to both the text and the system. A trusted reader can still say: this is technically sound, but I no longer hear you in it.

No persona agent gave us that intervention at the right moment.

## Build your own AI editorial team

You do not need 74 sessions. Start with five design choices.

### 1. Appoint a human editor-in-chief

Name one person who owns the audience, thesis, scope and final publication decision. Write the position down in one sentence. If an addition does not strengthen it, the addition needs a very good reason to exist.

### 2. Add at least one human counter-reader

Do this early and again after the biggest cut. Ask them to review for trust, voice and relevance.

A useful brief is: *Mark the point where you stop hearing an author and start hearing a system.*

### 3. Make the brief persistent

Store the audience, thesis, terminology, sources, word budget and stop rule with the document. Add a writer skill when voice matters across sessions. It will not make prose human, but it makes deviations easier to see.

### 4. Give agents one lens each

Use bounded contracts instead of a room full of vague personas.

- **Draft:** “Write this section from the accepted outline. Mark missing evidence. Do not invent it.”
- **Content-checker:** “Report repetition, contradictions and style breaks across the document. Do not rewrite.”
- **Developer:** “Flag claims that sound plausible but lack an example, boundary or verification method.”
- **Engineering manager:** “Flag advice that ignores team ownership, risk or delivery consequences.”

If two roles keep finding the same problem, improve the shared brief. Do not add a third reviewer.

### 5. Separate inspection from modification

Review agents should produce findings first. A human accepts, combines or rejects them. Only then does an agent change the text. When review keeps growing, freeze the content: every remaining change must fix a blocker or remove more complexity than it adds.

Agents are very good at finding more work. Your workflow needs permission to stop.

## The whitepaper is the proof and the warning

The same principle runs through the finished whitepaper: agents can expand execution, but humans remain accountable for what reaches the reader, user or production environment. In software, evidence and pull-request review form that ownership boundary. In writing, it is a persistent brief, explicit decision rights and humans willing to reject perfectly reasonable AI suggestions.

You can read [*AI Assisted Development: The Rockstars Way* in English](https://go.teamrockstars.nl/ai-assisted-development-handbook-engels) or [download the Dutch edition](https://go.teamrockstars.nl/ai-assisted-development-handbook-nl). The paper contains the complete approach for work definition, context engineering, evidence bundles and human review.

On 18 August at 12:00, we will unpack what worked, what nearly failed and how to apply the model inside a real delivery team in the [AI Assisted Development webinar](https://events.teams.microsoft.com/event/449acad2-073e-47db-8982-04783bf26c38%409e8cdb6a-eda5-4cca-8b83-b40f0074d999).

The $250 price tag did not buy us a whitepaper. It bought access to an editorial team. That team still needed an editor, independent human readers and authors willing to put their name behind the result.
