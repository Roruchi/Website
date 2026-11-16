---
name: rate-blog-post
description: Rate one or all roelvanbergen.nl blog posts against the repository's evidence-based editorial rubric, with passage-specific fixes and publication blockers. Review only unless editing is requested.
---

# Rate a blog post

Read the complete requested `src/blog/*.md` files, including HTML imports. For an unspecified target, rate all posts. Read the bundled [editorial rubric](references/rubric.md). When working in the website repository, historical scores in `specs/002-blog-quality-review/report.md` are calibration examples, not results to copy. All repository paths below are relative to the website checkout, not this skill's installation directory. If reviewing supplied text outside that checkout, apply the rubric and explicitly report unavailable comparison sources and repository checks; do not invent their results.

Compare voice with `the-lotus-on-stage-bccd43294de1.md`, the perfectionism series and `your-ai-agent-isnt-the-problem-your-engineering-discipline-is-634b706d776d.md`; compare technical specificity and caveats with `lint-the-spec-before-the-agent-writes-code.md`. These live in `src/blog/`. Do not force a personal reflection into an engineering tutorial or treat idea briefs as finished examples.

Use the five rubric dimensions, each 0–4: voice (V), arc and economy (A), concrete usefulness (C), trust (T), presentation and readiness (P). Sum to /20. Explain every deduction with a heading or short passage, its consequence and a specific fix. Retain strengths too. Scores are editorial judgments, not measurements or permission to publish; an unresolved factual or technical blocker outweighs a high total. Never invent autobiographical material to raise V.

Check current `scripts/content-validation.js`, `scripts/validate-content.js`, `scripts/content-workflow.js`, `src/blog/blog.11tydata.js`, `src/_data/content-taxonomy.js`, README content guidance, and `specs/001-publish-blog-crosspost/contracts/crosspost-workflow-contract.md`. Use the current implementation when historical spec prose differs. Check the read-only extractor `scripts/crosspost/extract-article.js` for draft eligibility; do not invoke publishing or mutate the ledger just to rate content.

Report metadata completeness (including optional relatedTalks and coverAlt), image existence and alternatives, descriptive links, heading hierarchy including imported HTML, internal destinations' actual published status, source attribution and crosspost dependencies. A validator pass does not prove link availability, accessible images, factual correctness or prose quality. Run `npm run check:content` from the repo and distinguish target findings from existing corpus warnings. Count body words approximately after stripping HTML and image markup; report the method and compare scope, never enforce a minimum or maximum.

Output:

- Target, review date, draft/published/idea-brief state, approximate words and reference posts used.
- V/A/C/T/P scores and total, with strengths and evidence for deductions. For batches, use one row per post and include every filename, with specific proposed fixes.
- Factual checks: verified source and date checked, author-only confirmation, hypothesis, or unverified claim. Mark unverifiable material explicitly; do not silently convert opinion or an imagined example into evidence.
- Separate publication blockers, recommended edits and optional improvements. Include validation outcomes and distinguish editorial readiness from deployment/crosspost eligibility.
- If editing was authorized: before/after scores, every substantive change and open author questions. Otherwise leave article files untouched.

Leave dates, publication status, external distribution flags and the crosspost ledger unchanged unless those actions are explicitly requested. Do not translate or rewrite comparison posts. External posting, credentials or new services are unnecessary for this review.
