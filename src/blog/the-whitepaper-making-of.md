---
title: "Our AI editorial team cost less than $250. The hard part wasn’t writing the whitepaper"
slug: "the-whitepaper-making-of"
date: 2026-07-20
description: "Across 74 AI sessions and 186 million tokens, generating text turned out to be the easy part. Keeping editorial ownership human was harder."
draft: false
pillar: engineering
cover: "/assets/images/the_ship_of_theseus.png"
relatedTalks: []
tags:
  - post
  - agentic-ai
  - ai
  - software-engineering
  - writing
---

<figure>
  <img
    src="/assets/images/the_ship_of_theseus.png"
    alt="A sailing ship gradually transforming from weathered timber into a pristine rebuilt vessel, representing the Ship of Theseus problem in AI-assisted authorship."
    loading="lazy"
  >
  <figcaption>
    If every individual replacement is an improvement, at what point does the whole stop being yours?
  </figcaption>
</figure>

We were writing a whitepaper about how development teams can use agents without giving up ownership. It seemed logical to use agents in the writing process itself, with the same controls we recommend for software: persistent context, bounded roles, specialist reviews and a human approval boundary.

On paper, the setup looked responsible. Each chapter had a brief and a word budget, a writer skill was meant to preserve my voice from day one, and specialist agents reviewed the work from different perspectives. Yet the first Word export reached 41 pages.

Most individual suggestions made sense. One review asked for more consistency, another for more technical detail, and another for clearer organisational consequences. The problem only became visible when we stopped reviewing chapters and read the whitepaper as a whole: the agents had kept improving the section in front of them while the document became longer, less focused and less recognisably ours.

We responded with a substantial cut. The structure improved, but the edit exposed a second problem because much of the human tone had disappeared together with the surplus words. Human counter-readers saw what our automated checks had missed: a defensible whitepaper can still feel as though nobody is really willing to own it.

That left me with the question behind this article: how do you use agents to improve a whitepaper without outsourcing authorship? My conclusion is that you should build an editorial team rather than an AI writer. Agents can take on bounded editorial work, but humans still have to own the argument, judge the exceptions and decide what deserves to be published.

## An agent can improve every section and still make the paper worse

The whitepaper, *AI Assisted Development: The Rockstars Way*, explains how development teams can let coding agents do more while keeping ownership inside the team. Javier Rennola, Timo Koole and I applied the same idea to the writing process.

I used ChatGPT to explore the problem, test angles and challenge my position. The thesis itself came from experience: execution can move towards agents, but ownership cannot.

We made that intent persistent. Each chapter had a writer brief in `_meta/`. `AGENTS.md` described the audience, terminology, sources, word limits and editorial boundaries. The `roel-writing-style` skill was part of the setup from the start. It gave every agent the same description of my preference for a clear position, concrete consequences, tone of voice and less corporate filler. 

Specialist roles handled different questions:

- The **draft agent** produced or revised one bounded section using the `roel-writing-style` skill.
- The **content-checker** looked across chapters for repetition, style breaks and contradictions.
- The **developer persona** tested technical credibility and practical usefulness.
- The **engineering-manager persona** tested coherence, team value and organisational consequences.

Each role had a reason to request more context, another example or one more qualification. Generating those plausible suggestions cost almost nothing, but deciding whether they deserved space in the paper was where the real editorial work began.

## The 41-page cut fixed the length and damaged the voice

Our first export reached 41 pages. Across the eight core chapters, we cut 6,557 words down to 5,124. 

The cut was necessary, and the result was shorter, clearer and easier to navigate. It was also too clean. We removed duplication and background explanation, but also passages where the authors sounded like people who had done the work. Rough edges, doubts and specific consequences became competent AI prose, leaving the argument intact while weakening the sense that somebody genuinely stood behind it.

It started to feel like a [Ship of Theseus](https://en.wikipedia.org/wiki/Ship_of_Theseus) problem: how much can you replace before something stops being the same thing? If you replace every rough edge with a better AI suggestion, at what point does the document stop sounding like yours?

One change in Git history captures such a problem. After the trimming pass, chapter one stated that:
 >AI-assisted development only becomes reliable when you treat it as an engineering process.

Correct, but almost anyone could have written it. After the human review, we made the position explicitly ours:

 >We believe an agent is not a smart intern you ‘just ask to do something’. It is an executing force in the development process and therefore needs direction, context, boundaries and control.

The argument had not fundamentally changed. What changed was our willingness to put our own position into the text

That became clear through human counter-readers. They did more than check grammar or technical correctness. They asked uncomfortable questions: Does this still sound like you? Where is the experience behind this claim? Would you say this sentence out loud? Why should a reader trust this conclusion?

After that feedback, we added `ai-generated-text-triage`, a read-only inspection step for generic transitions, suspicious symmetry and other AI writing patterns. We also rewrote parts ourselves without AI, because not every weak passage needed a better prompt. Some needed an author back in the room. The counter-readers remained essential here: a style check can spot a pattern, but a person can tell you that the document no longer feels owned.

## What 186 million tokens actually bought

We reconstructed 74 recorded sessions across Codex, Copilot and Claude Code, together processing approximately 186.2 million tokens. Using standard API-equivalent pricing, that activity came to roughly $211, and in any case less than $250.

This is an order-of-magnitude price tag, not a bill. The tools partly ran through subscriptions, most Codex input was cached and token counts are not perfectly comparable across products.

![Cost and observability of the AI editorial team](/assets/images/ai-editorial-team-cost.svg)

Only 15.2 percent of tokens went to writing and editing. Review and feedback consumed 51.4 percent, publishing, export and synchronisation another 20 percent, and the remaining 13.4 percent covered other work. In other words, 71.4 percent of  token use went into reviewing, revising, publishing or synchronising content that already existed.

In practice, the agents behaved more like an editorial department than a writing machine. They compared versions, found inconsistencies, processed feedback, maintained artefacts and checked whether changes had landed everywhere. For less than $250, that is remarkable leverage, but it also corrects the usual AI-writing story: producing sentences was cheap; making them coherent, credible and recognisably ours took most of the system and all of the human judgement.

## Divide decision rights, not authorship percentages

People often ask what percentage was written by AI, but I think that is the wrong measure. An agent-assisted commit may change hundreds of sentences without changing the argument, while a human decision to remove a chapter may change the entire paper without adding a single word. Counting keystrokes confuses production with authorship, so our useful dividing line was decision rights.

![Decision rights between humans and the AI editorial team](/assets/images/human-agent-editorial-roles.svg)

Agents could draft, compare, challenge, inspect and implement approved changes. Humans owned the thesis, supplied lived experience, judged conflicting feedback, chose what to cut and approved publication.

Human counter-readers formed a second boundary. The editor-in-chief can become too close to both the text and the system, while a trusted reader can still say: this is technically sound, but I no longer hear you in it. A persona agent could produce similar criticism, but it could not replace the judgement of an independent human reader.

## Build your own AI editorial team

You do not need 74 sessions to apply this approach; start with five design choices.

### 1. Appoint a human editor-in-chief

Start by naming one person who owns the audience, thesis, scope and final publication decision, then write the position down in one sentence. Any addition that does not strengthen that position needs a very good reason to exist.

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

If two roles keep finding the same problem, improve the shared brief before adding another reviewer.

### 5. Separate inspection from modification

Review agents should produce findings first. A human accepts, combines or rejects them. Only then does an agent change the text. When review keeps growing, freeze the content: every remaining change must fix a blocker or remove more complexity than it adds.

Agents are very good at finding more work. Your workflow needs permission to stop.

## The whitepaper is the result and the warning

The same principle runs through the finished whitepaper: agents can expand execution, but humans remain accountable for what reaches the reader, user or production environment. In software, evidence and pull-request review form that ownership boundary. In writing, it is a persistent brief, explicit decision rights and humans willing to reject perfectly reasonable AI suggestions.

You can read [*AI Assisted Development: The Rockstars Way* in English](https://go.teamrockstars.nl/ai-assisted-development-handbook-engels) or [the Dutch edition](https://go.teamrockstars.nl/ai-assisted-development-handbook-nl). The paper contains the complete approach for work definition, context engineering, evidence bundles and human review.

The $250 price tag did not buy us a whitepaper; it bought access to an editorial team. That team still needed an editor, independent human readers and authors willing to put their name behind the result.
