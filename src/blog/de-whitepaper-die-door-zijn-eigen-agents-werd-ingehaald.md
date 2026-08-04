---
title: "How to write a whitepaper with AI agents: build an editorial team, not a writer"
slug: "de-whitepaper-die-door-zijn-eigen-agents-werd-ingehaald"
date: 2026-07-20
description: "Onze AI-redactie verwerkte 186 miljoen tokens in 74 sessies. Slechts 15 procent ging naar schrijven. Dit is hoe we agents inzetten zonder het auteurschap uit handen te geven."
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

Voor *AI Assisted Development: The Rockstars Way* wilden Javier Rennola, Timo Koole en ik beschrijven hoe teams coding agents verantwoord door hun deliveryflow krijgen. De whitepaper volgt het proces van intent en work definition tot context engineering, verificatie en pull-requestreview. Het voelde logisch om die principes ook tijdens het schrijven toe te passen.

We bouwden geen enkele AI-schrijver. ChatGPT hielp argumenten en praktijkvragen verkennen. Claude Code organiseerde schrijfwerk. Codex werkte over de repository heen. Copilot pakte afgebakende reparaties op. Content-checkers en persona-agents beoordeelden de tekst vanuit verschillende perspectieven.

Dat systeem werkte. De eerste Word-export telde 41 pagina's.

Ieder hoofdstuk was op zichzelf verdedigbaar. Er waren bronnen, voorbeelden, reviews en verbeteringen. Als geheel werd de whitepaper alleen steeds langer en minder herkenbaar als één verhaal. De agents verbeterden lokaal precies wat we vroegen, terwijl mijn eigen stem en centrale argument onder al die productie dreigden te verdwijnen.

Hoe zet je agents dan in om een whitepaper beter te maken, zonder het auteurschap aan het systeem over te dragen?

Mijn antwoord na dit project: bouw een editorial team, geen AI-schrijver. Geef agents verschillende redactionele verantwoordelijkheden, maar houd één mens verantwoordelijk voor richting, betekenis en de beslissing wat niet in het document thuishoort.

## Het schrijfproces begon niet met schrijven

De eerste gesprekken vonden plaats voordat er een repository was. Met ChatGPT onderzocht ik welke vraag de whitepaper moest beantwoorden, waar teams in de praktijk vastlopen en welk standpunt ik zelf wilde verdedigen.

Daar lag de eerste menselijke verantwoordelijkheid. Een agent kan snel een plausibele outline produceren, maar een outline is nog geen overtuiging. De centrale gedachte moest uit onze ervaring komen: uitvoering kan steeds verder naar agents verschuiven, terwijl eigenaarschap bij het team blijft. Een werkende build of een set groene tests is niet automatisch voldoende bewijs dat een verandering correct is. De reviewer moet kunnen begrijpen wat er is veranderd, waarom dat nodig was en welk bewijs de claim ondersteunt.

Pas daarna werd de intent onderhoudbaar gemaakt. De outline ging een repository in. Ieder hoofdstuk kreeg een eigen publicatiebestand en een schrijversbrief in `_meta/`. Een `AGENTS.md` legde onder meer de doelgroep, terminologie, woordbudgetten, bronnen en redactionele grenzen vast.

Voor softwareontwikkeling noemen we zoiets context engineering en harness engineering. Voor schrijven bleek hetzelfde principe te gelden. Een losse prompt draagt te weinig projectgeheugen. Een repository met expliciete afspraken maakt schrijfwerk reviewbaar, herhaalbaar en overdraagbaar.

## Eén agent werd een redactie

De volgende stap was specialisatie. We gebruikten niet één prompt die tegelijk moest schrijven, controleren, bekritiseren en inkorten. De verschillende taken kregen een eigen rol.

- **Draft-agents** maakten eerste versies en verwerkten gerichte opdrachten per hoofdstuk.
- **De content-checker** las over hoofdstukken heen en controleerde stijl, herhaling en consistentie.
- **De developer persona** vroeg of een technisch lezer de uitleg geloofwaardig, concreet en toepasbaar zou vinden.
- **De engineering-manager persona** keek naar samenhang, teamwaarde en de keuzes die een organisatie ermee kon maken.
- **Claude Code** organiseerde meerdere schrijftaken en reviewrondes.
- **Codex** verwerkte repositorybrede feedback, synchroniseerde wijzigingen en controleerde het resultaat.
- **Copilot** bleef bij afgebakende reparaties rond de pull-requestgrens.

Dat is ook waarom ik onderscheid maak tussen agents, skills, projectinstructies en scripts.

Een agent vertegenwoordigt een rol of beoordelingsperspectief. Een skill beschrijft een herhaalbare werkwijze. In dit project beschermde `roel-writing-style` mijn stem en controleerde `ai-generated-text-triage` tekst read-only op herkenbare patronen van generiek AI-proza. `AGENTS.md` bewaarde de afspraken die voor het hele project golden. Scripts controleerden deterministische eigenschappen, zoals links, woordbudgetten, exports en metadata.

Die onderdelen zijn niet onderling uitwisselbaar. Een persona is nuttig wanneer een tekst een andere professionele lens nodig heeft. Een skill is nuttig wanneer dezelfde taak vaker terugkomt. Een script is beter zodra een controle zonder interpretatie kan worden uitgevoerd.

## De whitepaper werd beter en dreigde tegelijk te mislukken

Meer gespecialiseerde agents leverden meer relevante feedback op. Ze vergrootten ook de hoeveelheid tekst, argumenten en lokale verbeteringen die een plek vroegen.

Daar zat de fout in onze aanpak: we hadden de productie goed georganiseerd, maar nog onvoldoende vastgelegd wie de samenhang bewaakte en wanneer een suggestie mocht worden afgewezen.

Ik had voor bijna ieder lokaal tekstprobleem een specialistische rol ontworpen. De beslissing of het geheel nog steeds mijn argument en stem droeg, kwam daardoor te laat in de cyclus terug bij mij. Precies die beslissing had vanaf het begin de vaste menselijke grens moeten zijn.

Een developer persona kon terecht om een extra technisch voorbeeld vragen. Een engineering-manager persona kon even terecht om meer organisatorische context vragen. De content-checker kon vervolgens constateren dat beide toevoegingen een nieuw begrip introduceerden dat elders uitleg nodig had. Iedere stap was logisch. Het document als geheel werd er niet automatisch beter van.

Managementfeedback dat delen van de tekst AI-generated aanvoelden maakte dat zichtbaar. Eén passage minder glad formuleren zou het onderliggende probleem laten staan. We pasten daarom het systeem aan. Er kwam een herbruikbare writer skill die mijn standpunt, ritme en voorkeur voor concrete consequenties beter beschermde. Daarnaast werd AI-proza eerst read-only geïnspecteerd voordat een agent wijzigingen mocht voorstellen.

De doorslaggevende verbetering was menselijker en eenvoudiger: feedback werd advies. Niet iedere correcte observatie verdiende een wijziging. Iemand moest bepalen welk probleem werkelijk het verhaal schaadde, welke nuance noodzakelijk was en welke toevoeging vooral meer tekst opleverde.

## Wat observability over het schrijfproces liet zien

Na afloop hebben we de beschikbare telemetry langs het opgenomen werkpad gelegd. Over Codex, Claude Code en Copilot vonden we 74 geregistreerde sessies en ongeveer 186,2 miljoen verwerkte tokens. Wanneer we Codex waarderen tegen de [standaardtarieven van GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol) en voor Claude Code en Copilot de API-equivalenten uit het dashboard gebruiken, komt dat uit op ongeveer 211 dollar. Ruim onder de 250 dollar.

Dat bedrag is een API-equivalent, geen factuur. De tools draaiden deels binnen abonnementen en 171,7 miljoen van de 184,2 miljoen Codex-inputtokens kwamen uit cache. Tokenmetingen tussen producten zijn bovendien niet volledig vergelijkbaar. De waarde van deze cijfers zit daarom vooral in de verdeling van het werk.

![Observability van de AI-redactie met sessies, tokens, kosten en werkverdeling](/assets/images/ai-editorial-team-cost.svg)

Slechts 15,2 procent van de Codex-tokens ging naar schrijven en redigeren. Review en feedbackverwerking waren samen goed voor 51,4 procent. Met publiceren, exporteren en synchroniseren erbij vond 71,4 procent van het tokengebruik plaats nadat er al tekst bestond.

Dat past niet bij het beeld van een chatbot die in één keer een whitepaper schrijft. Het systeem functioneerde vooral als een digitale redactie: tekst vergelijken, feedback verzamelen, wijzigingen doorvoeren, consistentie herstellen en het publicatieartefact onderhouden.

De overige projectcijfers vertellen hetzelfde verhaal:

- De eerste Word-export telde 41 pagina's.
- Er waren 51 non-merge commits.
- De acht kernhoofdstukken gingen van 6.557 naar 5.124 woorden.
- We verwijderden 1.433 woorden, 21,9 procent van de kerntekst.
- De menselijke inspanning lag naar schatting rond de 40 uur.

Ongeveer tachtig procent van de commits kwam met ondersteuning van agents tot stand. Dat percentage zegt iets over productie, niet over auteurschap. Eén menselijke beslissing om een hoofdstuk te schrappen kan inhoudelijk zwaarder wegen dan tientallen agent-assisted commits.

## De mens-agentverdeling gaat over beslissingsrecht

Ik zou de bijdrage daarom niet verdelen in een percentage mens en een percentage AI. De nuttige scheidslijn loopt tussen redactionele capaciteit en redactionele autoriteit.

Agents kunnen alternatieven produceren, patronen vinden, consistentie controleren en feedback vanuit meerdere rollen simuleren. Mensen bepalen de centrale these, brengen praktijkervaring in, beoordelen de relevantie van bronnen en beslissen welke kritiek werkelijk tot een wijziging leidt.

![Rolverdeling tussen de menselijke hoofdredacteur en het AI editorial team](/assets/images/human-agent-editorial-roles.svg)

De productie was sterk agent-driven. Richting en betekenis bleven human-owned. Ik zie dat als het ontwerpprincipe dat de samenwerking bruikbaar maakte: redactionele capaciteit kan opschalen, beslissingsrecht blijft menselijk.

## Bouw je eigen AI editorial team

Je hebt geen 74 sessies of tientallen miljoenen tokens nodig om deze aanpak te gebruiken. Begin kleiner en voeg alleen een rol toe wanneer die een aantoonbaar ander probleem oplost.

### 1. Benoem één menselijke editor-in-chief

Leg vast wie de doelgroep, centrale these en publicatiegrens bewaakt. Die persoon hoeft niet alle tekst zelf te schrijven, maar moet wel kunnen uitleggen waarom ieder belangrijk onderdeel in het document staat.

Voor onze whitepaper betekende dit dat mensen eigenaar bleven van:

- het standpunt dat uitvoering kan verschuiven, maar teamownership niet;
- praktijkervaringen en de relevantie van bronnen;
- het accepteren of afwijzen van feedback;
- de uiteindelijke samenhang, inkorting en publicatie.

Zonder deze rol gaat een agentsysteem optimaliseren op de meest recente opdracht of review. Dat levert activiteit op, maar geen stabiele redactionele richting.

### 2. Maak de opdracht persistent

Zet de belangrijkste afspraken in een projectbestand dat iedere agent leest. Voor een artikel of whitepaper bevat dat minimaal:

```text
Audience: senior developers, tech leads and engineering managers
Thesis: execution can shift to agents; ownership stays with the team
Required: concrete practices, limitations and evidence
Avoid: generic AI claims, invented experience and management filler
Word budget: defined per section
Stop rule: report conflicts instead of silently expanding scope
```

Een goede projectbrief voorkomt niet alle afwijkingen. Hij maakt ze wel zichtbaar en bespreekbaar. Dat is het verschil tussen opnieuw prompten en gericht reviewen.

### 3. Geef iedere agent één duidelijke lens

Begin bijvoorbeeld met drie rollen.

**Draft-agent**

> Schrijf één sectie op basis van de geaccepteerde outline en aangeleverde bronnotities. Voeg geen nieuwe claims toe. Markeer ontbrekend bewijs in plaats van het zelf aan te vullen.

**Content-checker**

> Lees het volledige document. Rapporteer stijlbreuken, herhaling, terminologieconflicten en argumenten die elkaar tegenspreken. Herschrijf nog niets.

**Developer persona**

> Beoordeel welke onderdelen een ervaren developer maandag kan toepassen. Markeer uitleg die technisch aannemelijk klinkt, maar geen concreet voorbeeld, grens of verificatiemethode bevat.

Voor een document dat ook team- of organisatiewaarde moet leveren, kun je een engineering-manager persona toevoegen:

> Beoordeel of de tekst helpt om verantwoordelijkheden, risico's en teamafspraken te organiseren. Markeer technische details die geen aantoonbare invloed hebben op delivery of ownership.

Het woord *persona* is hier minder belangrijk dan het contract. De rol heeft een afgebakende vraag, beperkte context en een voorspelbaar resultaat nodig.

### 4. Scheid inspecteren van wijzigen

Laat een reviewer eerst bevindingen opleveren. Laat daarna een mens bepalen welke bevindingen worden geaccepteerd. Pas dan mag een andere agent de geselecteerde wijzigingen uitvoeren.

Deze scheiding voorkomt dat een reviewer zijn eigen voorkeur direct als nieuwe waarheid in de tekst schrijft. Ze levert bovendien een bruikbaar auditspoor op: bevinding, beslissing, wijziging en verificatie.

Een eenvoudige cyclus is voldoende:

1. De mens bepaalt intent en scope.
2. Een agent produceert of onderzoekt.
3. Een checker of persona rapporteert bevindingen.
4. De mens accepteert, combineert of verwerpt die feedback.
5. Een agent verwerkt alleen de geselecteerde wijzigingen.
6. Een script of reviewer controleert het eindresultaat.

### 5. Meet werksoorten, niet alleen tokens

Een totaal aantal tokens is aantrekkelijk voor een prijskaartje, maar zegt weinig over waarde. Registreer daarom ook waarvoor een sessie werd gebruikt: onderzoek, schrijven, review, feedbackverwerking, export of onderhoud.

Onze 186 miljoen tokens werden pas interessant toen bleek dat slechts 15 procent naar schrijven ging. Zonder die classificatie was het vooral een groot getal geweest.

Leg daarnaast menselijke uren, reviewrondes, geaccepteerde feedback en verwijderde tekst vast. Daarmee kun je later beoordelen of de agents daadwerkelijk redactionele capaciteit toevoegden of vooral meer werk produceerden.

### 6. Ontwerp een stopregel

Agents stoppen niet vanzelf wanneer een argument voldoende is uitgewerkt. Leg daarom vooraf woordbudgetten, reviewmomenten en een content freeze vast. Bepaal ook wanneer een nieuwe suggestie alleen nog een blocker mag oplossen.

Onze eerste export van 41 pagina's was geen fout van één model. Het was het resultaat van een systeem waarin bijna iedere redelijke verbetering nog welkom was. Een betere generatieprompt had die prikkel niet weggenomen. We moesten explicieter beslissen wanneer de whitepaper klaar was.

## De belangrijkste schrijfskill was redactie

De agents maakten onderzoek, productie en review veel goedkoper. Voor minder dan drie uur professioneel schrijfwerk kregen we tientallen sessies aan specialistische ondersteuning. Ze namen het moeilijkste deel alleen niet over.

Een whitepaper heeft een standpunt nodig. Iemand moet beslissen welke praktijkervaring relevant is, welke bron voldoende sterk is, wanneer twee correcte perspectieven niet tegelijk in het verhaal passen en welke tekst ondanks alle moeite moet verdwijnen.

Dat is de rol van de menselijke editor-in-chief. Die persoon hoeft niet iedere zin beter te formuleren. Auteurschap gaat uiteindelijk over verantwoordelijkheid voor het geheel.

Agents zijn uitstekend in productie. Engineering begint waar je besluit welke productie niet nodig is.

Wil je zien welke aanpak we in de whitepaper zelf beschrijven? Lees [AI Assisted Development: The Rockstars Way in het Nederlands](https://go.teamrockstars.nl/ai-assisted-development-handbook-nl) of [de Engelse editie](https://go.teamrockstars.nl/ai-assisted-development-handbook-engels).

Op 18 augustus om 12.00 uur gaan we tijdens het [webinar over AI Assisted Development](https://events.teams.microsoft.com/event/449acad2-073e-47db-8982-04783bf26c38%409e8cdb6a-eda5-4cca-8b83-b40f0074d999) dieper in op work definition, context engineering, evidence bundles en pull-requestreviews. Daar is ook ruimte om vragen te stellen over de keuzes achter de whitepaper en de manier waarop we agents in de praktijk hebben ingezet.
