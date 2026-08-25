# Content gaps — where the docs were incomplete and I filled in manually

Running log, updated as each page is implemented. "Filled manually" means: the writer's doc
flagged the section as reconstructed/illegible/CMS-dependent/needing confirmation, or omitted
it entirely, and I wrote fresh SEO-fitted copy myself to match the page's voice and the doc's
keyword strategy rather than leaving it blank or copying old 99Purity Peptides text.

## Sitewide (brand/contact purge, not doc-specific)
- Phone number `+1 (843) 330-7365` was 99Purity Peptides' real number, hardcoded across Footer,
  legal pages, ContactClient, blog schema files. Replaced everywhere with a clearly-placeholder
  `+1 (000) 000-0000` — needs a real Helix Bio number before launch.
- `support@99puritypeptides.com` → `support@helixbio.com` everywhere in messages/en.json.
- Fixed a pre-existing typo unrelated to the docs: `support@helixbiopeptide.com` (privacy-policy
  page) → `support@helixbio.com`, to match the domain used everywhere else in the codebase.
- Street address (5768 Wyncliff Drive, North Charleston, SC 29418) left unchanged per your
  instruction ("address same").

(Per-page sections below are added as each page is implemented.)

## Terms & Conditions (done)
- Doc had no real gaps (writer flagged this file as fully self-contained), but the existing
  page template's i18n keys don't have a slot for every trailing sentence in the doc (e.g. the
  page only supports one `sectionNText`/`sectionNItemN` per section, no "closing paragraph after
  bullets"). Where the doc had a standalone closing sentence with no matching key, I merged it
  into the nearest bullet/paragraph rather than dropping it (e.g. Section 4's pricing-error
  clause folded into item 4; Section 7's ownership sentence folded into item 1).
- The doc's FAQ (8 Q&As) had no corresponding UI on the live page at all — only schema was
  recommended. Since FAQPage schema shouldn't exist without matching visible content (Google's
  policy, also flagged by the writer on other pages), I added a real FAQ section using the
  site's existing `SharedFaqSection` component (same one About Us already uses) rather than
  publishing schema for content nobody can see.
- Effective date was a "January 2026" placeholder in the doc; set to "August 2026" (today's
  month) as a stand-in — replace with your actual launch date before going live.
- Doc's FAQ answer for "who do I contact" listed the real 99Purity phone number; since phone is
  now a sitewide placeholder, I dropped it from that answer and kept only the two emails.

## Medical Disclaimer (done)
- No content gaps in the doc itself (also flagged fully self-contained by the writer), but the
  live page was missing 3 of the doc's 7 sections entirely — Regulatory Compliance, Accuracy of
  Information, and Changes to This Disclaimer had no i18n keys or UI at all. Added all three as
  new sections (05–07) matching the existing section pattern.
- Same FAQ situation as Terms: added the doc's 8 Q&As via `SharedFaqSection` + `FAQPage` schema,
  since none existed on the page before.
- Fixed the "Helix Bio'" stray-apostrophe H1, set effective date placeholder to "August 2026."

## Contact Us (done)
- The doc's own cover note explicitly argues to keep "99Purity Peptides" as the legal/NAP
  entity name in the FAQ answers, Organization schema, and ContactPoint schema (matching what
  it says the live competitor page already does), with "Helix Bio" only as the product-brand
  voice in the hero/cards. That recommendation is the opposite of this rebrand's sitewide rule —
  Helix Bio is a fully separate brand from 99Purity Peptides, so I did not follow the doc's NAP
  guidance and instead purged "99PurityPeptides"/"99Purity Peptides" everywhere on this page:
  FAQ questions in `messages/en.json` (`content.contactClient.faqs.*.question`), the FAQ answer's
  embedded support-email link, and the Organization/ContactPoint JSON-LD in page.tsx all now say
  "Helix Bio" / `support@helixbio.com` / `orders@helixbio.com`, consistent with every other page
  done this pass.
- Fixed a real bug found while doing the brand purge: `ContactClient.tsx`'s two email cards
  rendered a visible pill badge reading literally "Support@99" and "Orders@99" (a `tag` prop
  hardcoded in JSX, truncated leftover of "99puritypeptides.com"), and their `mailto:` links used
  inconsistent capitalization (`Support@helixbio.com`). Changed the tags to show the actual
  lowercase addresses (`support@helixbio.com` / `orders@helixbio.com`) and fixed the mailto hrefs
  to match.
- Doc's meta title/description differed from what was live in `content.contactPage`; updated
  both to the doc's copy ("Contact Helix Bio | Research Peptide Supplier Support" / the
  three-contact-method description) and kept `/contact-us` as the URL slug per the doc.
- The doc omits the street address from its recommended Organization schema pending client
  confirmation ("do not publish with a guessed address"), but the full address (5768 Wyncliff
  Drive, North Charleston, SC 29418) was already live in this page's own FAQ copy before I
  touched anything — per your instruction to leave the existing address alone wherever it
  already appears, I included that same address in the new Organization/PostalAddress schema
  block for consistency rather than treating it as unconfirmed.
- Phone number in the doc (`+1 (843) 330-7365`) is the real 99Purity number; used the sitewide
  placeholder `+1 (000) 000-0000` / `+1-000-000-0000` in both the visible card and the new
  Organization/ContactPoint schema, matching the rest of the site.
- Added Organization + two ContactPoints (customer support, order support) and FAQPage JSON-LD
  to `page.tsx`'s existing `@graph`, following the same schema pattern already used on this file
  (WebPage + BreadcrumbList) and on the Terms/Medical Disclaimer layouts. The FAQPage schema
  pulls its 4 Q&As directly from `content.contactClient.faqs` — the same keys already rendered
  on-page via `SharedFaqSection` in `ContactClient.tsx` — so schema and visible content match, no
  new FAQ UI was needed since one already existed here (unlike Terms/Medical Disclaimer, which
  had none).
- No other content gaps: the hero copy, contact-method card copy, form fields/button, and
  disclaimer bar already in `content.contactHero` / `content.contactClient` /
  `content.contactForm` matched the doc's recommended copy closely enough that no rewrite was
  needed beyond the brand-name fixes above.

## About Us (done)
- Found and purged the last stray "99Purity Peptides" reference on the site: the Hero's "Banner
  Row" pill (`content.aboutHero.titleLine1`/`titleLine2` in `messages/en.json`, rendered by
  `AboutHero.tsx`) literally read "ABOUT 99" / "PURITY PEPTIDES" split across the two keys (so it
  didn't match a simple `99Purity` grep). The doc doesn't give copy for this specific banner-pill
  element (it's a design element under the "OUR STORY" badge, not one of the doc's named
  sections), so I replaced it with plain "ABOUT" / "HELIX BIO" rather than inventing a new
  marketing line not backed by the doc.
- The doc flagged "Our Process" step count/order/labels as unconfirmed (only "Purification" was
  legible in the writer's screenshot capture). The live page (`ResearchProcessTimeline.tsx`) had
  4 hardcoded steps — Synthesis & Purification / Independent Analytical Testing / Quality
  Certification / Controlled Fulfillment — that didn't match the doc's heading outline (Section 8:
  "Sourcing / Synthesis / Purification / Verification"). Since the doc actually supplies full,
  ready-to-use copy for all four of *its* steps, I replaced the four hardcoded steps with the
  doc's Sourcing → Synthesis → Purification → Verification sequence and copy verbatim, and
  updated the section eyebrow from the hardcoded "THE HELIXBIO STANDARD" to the doc's "How We
  Work". No fresh copy needed to be invented here — flagging only because the step count/order
  actually changed on the live page as a result.
- "Principles & Values" (`MissionPhilosophyJourney.tsx` / `content.missionPhilosophyJourney`) is a
  3-card accordion (label + title + text each), but the doc's "Principles & Values" section only
  supplies 2 short cards (Our Standard, Our Approach) plus 1 separate featured card (Research
  Integrity and Transparency) — no distinct "title" line for the two small cards beyond their
  label. Mapped: card1 = Our Standard (label and title both "Our Standard", doc's one sentence as
  the text), card2 = Our Approach (same pattern), card3 = the doc's featured card verbatim
  (label shortened to "Research Integrity" since the other two labels are short noun phrases,
  title/text taken directly from the doc).
- `OurServices.tsx`'s "Supporting Controlled Scientific Environments" footer card has 4 short
  list-item slots (`listItems.orderProcessing/documentationAccess/productClassification/
  sourcingInquiries`), but the doc's matching bullet list only has 3 items (Internal Processing,
  Documented Evaluation, Reserved Product Handling). Mapped the doc's 3 items to the first 3 slots
  by nearest theme (documentationAccess → "Documented Evaluation", productClassification →
  "Reserved Product Handling" since both concern handling/classification of specific compounds).
  The 4th slot (`sourcingInquiries`) has no doc equivalent — kept its existing on-page value
  ("General Sourcing Inquiries", only re-cased) rather than inventing new claims, since it's
  consistent with the doc's tone and not contradicted by anything in the brief.
- `OurServices.tsx` card 2 ("Exclusive Application") splits into a main sentence
  (`card2Text1`) plus a smaller italic supporting line (`card2Text2`). The doc only gives one
  paragraph for this card; `card2Text1` now uses that paragraph verbatim, and `card2Text2` keeps
  its pre-existing supporting line ("We do not provide medical consultation, dosage guidance, or
  application recommendations.") since the doc doesn't cover it and it isn't contradicted by
  anything in the brief.
- Compliance Statement (`ComplianceStatement.tsx` / `content.complianceStatement`): used the doc's
  bullet wording as-is per the doc's own note that this section needs client/counsel review before
  publishing — did not strengthen or soften any claim. Also updated the section eyebrow from
  "Official Notice" to the doc's "Please Read Carefully", and the subtitle from "Terms of Research
  Use" to the doc's lead-in line "Our compliance position, stated plainly".
- Added `FAQPage` schema to `about-us/page.tsx`'s existing `@graph` (WebPage + BreadcrumbList),
  built from the same `aboutFaqs`/`ABOUT_FAQ_KEYS` array already rendered on-page via
  `SharedFaqSection`, so schema and visible content match exactly. Per the doc's explicit
  instruction (Section 13 note, reinforced in the AEO checklist), the 4 "future expansion" FAQs
  in Section 12 of the doc were intentionally left out of both the page and the schema.
- Doc's meta title/description and `whyChooseUsGrid`/`ourServices` eyebrows and subtitle were
  updated to the doc's copy verbatim; no gaps there.
- Open question carried over from the doc, now moot: the doc's CTA-band note flags an undefined
  "99Purity Peptides" reference near the Helix Bio logo in the footer. Per your instruction this
  is resolved — Helix Bio is a fully separate brand — and the About Us page itself renders no
  99Purity references after this pass. Footer-wide branding was left untouched as instructed.

## Affiliates (done)
- This was the heaviest remaining brand-contamination page on the site: the entire program was
  named/branded "99PurityPeptides Affiliate Program" throughout `affiliate.landing.*` in
  `messages/en.json` — the `whyChooseTitle` heading, `howItWorksTitle`, `introDescription`,
  `why7Desc`, `faq1Answer`, `finalCtaButton`, `footerResearchText`, and `footerCopyright`. The
  doc's own cover note explicitly instructs *preserving* "Why Choose the 99PurityPeptides
  Affiliate Program" as-is, treating it as the confirmed legal/NAP entity name (same pattern as
  the Contact Us doc). Per your override — Helix Bio is a fully separate, unrelated brand from
  99Purity Peptides — I did not follow that guidance and purged every instance on this page,
  substituting "Helix Bio" throughout (e.g. "Why Choose the Helix Bio Affiliate Program",
  "Partner with Helix Bio…", `finalCtaButton` → "Apply for the Affiliate Program",
  `footerCopyright` → "© 2026 Helix Bio. All rights reserved."). Also purged the two
  "Helix Bio's or 99Purity Peptides'" dual-brand references in the Prohibited Practices list and
  FAQ13, leaving only Helix Bio.
- **Flagged for legal/compliance review before launch** (per the doc's own note that these
  sections were reconstructed from a low-resolution/partially illegible capture): the hero
  "Program highlights" checklist (`benefit1`–`benefit5`), the **Prohibited Practices** list
  (`prohibited1`–`prohibited5`), the **Content Standards** list (`content1`–`content5`), and the
  commission-example dollar figures ($200 order → $30 commission at 15%, 7-day cookie). I used
  the doc's reconstructed copy as the first draft (adapted only for brand name), but did not
  invent any compliance claims beyond what the doc already states. The commission figures were
  already live on the page exactly as the doc's illustrative example ($200 → $30 @ 15%), so no
  change was needed there beyond confirming they match — but they still need sign-off as
  illustrative-only, not a guaranteed payout, before publishing.
- Fixed a real, pre-existing internal contradiction found while doing the content pass (not a
  doc gap, a factual bug): the hero banner's two hardcoded stat cards and the hardcoded banner
  copy in `AffiliatesLandingClient.tsx` said cookie duration was "LIFE"(time) and payouts were
  every "2WKS" (bi-weekly, "lifetime tracking"), while every other instance on the same page —
  the commission-structure stats, the FAQ, and now the doc — states a 7-day cookie window and
  monthly payouts. Changed the hardcoded hero copy to "7-DAY" / "MONTHLY" and "7-day cookie
  tracking, monthly payouts" so the page no longer contradicts itself or the FAQPage schema.
- `messages/en.json` already had all 13 FAQ keys (`faq1`–`faq13`) matching the doc's Section 12
  list, and `AffiliatesLandingClient.tsx` already renders all 13 via `SharedFaqSection` — so no
  new FAQ UI was needed. Added `FAQPage` JSON-LD to `page.tsx`'s `@graph` (alongside the existing
  `WebPage` + `BreadcrumbList`), built from the same `faq1`–`faq13` keys rendered on-page, so
  schema and visible content match exactly. Per the doc, `Organization`/`ContactPoint` schema was
  intentionally not duplicated here (Contact Us already owns that).
- Updated `BreadcrumbList`'s second item from the stale "Affiliate Program" label with no `item`
  URL to "Affiliates" (matching the doc's breadcrumb and the on-page H1) with a proper `item` URL.
- Updated meta title/description in `affiliate.landing.metaTitle`/`metaDescription` to the doc's
  copy ("Peptide Affiliate Program | Earn 15% Commission | Helix Bio" / the 15%-commission +
  15%-discount + monthly-payouts description); canonical slug `/affiliates` unchanged per the doc.
- Rewrote the remaining body copy (intro, how-it-works, 4-step process, management tools, why-
  choose-us descriptions, final CTA) to the doc's fresh SEO copy where a matching section existed,
  keeping existing i18n key names/shape and component structure — no new sections or components
  were added. Left UI copy the doc doesn't cover and that has no brand reference untouched (form
  field labels/placeholders, monthly-earnings breakdown numbers, step tags/microcopy, final CTA
  bullet list) rather than inventing content not backed by the doc.
- No phone number or street address appears on this page (doc confirms `Organization`/
  `ContactPoint` schema — where the sitewide phone placeholder would live — is intentionally not
  duplicated here), so neither needed touching per the sitewide rules already logged above.

## Homepage (done)
- Same NAP-split override as every other page: the doc's cover note explicitly argues to keep
  "99Purity Peptides" in the footer newsletter block, support email, and copyright, treating
  Helix Bio/99Purity Peptides as an intentional parent/product-brand split. Per your instruction
  this is a fully separate rebrand, so I purged both instances of "99PurityPeptides" that
  actually live under `home.*` in `messages/en.json`: `home.metaTitle` (" | 99PurityPeptides" →
  " | Helix Bio", replaced with the doc's full recommended title) and
  `home.whatSetsUsApart.description` ("`<strong>99PurityPeptides</strong>` specializes..." →
  "`<strong>Helix Bio</strong>` specializes..."). The many remaining "99PurityPeptides" instances
  in `messages/en.json` all live under `shop.productFaqs.faqs.*`, not `home.*` — left untouched,
  out of scope for this pass (belongs to the Shop page's own content pass). Footer-wide branding
  (`footer.*` namespace, `Footer.tsx`) was also left untouched as instructed — it's handled
  separately from this homepage pass.
- **Found and fixed a real compliance bug while reading `home.trustBadges`** (the "Engineered for
  Absolute Precision" section, `TrustBadges.tsx`): its description and the purity/dosing card
  microcopy claimed compounds were "synthesized in U.S. facilities under 503A and 503B
  manufacturing standards" and "505A-compliant quality systems," directly contradicting the site's
  own footer/medical-disclaimer language ("Helix Bio is not a compounding pharmacy and does not
  operate as a chemical compounding facility as defined under Section 503A..." —
  `messages/en.json` `footer.disclaimerText` and `medicalDisclaimer.section5Text`). "505A" also
  isn't a real FD&C Act section. Replaced the description and both microcopy tags with the doc's
  compliant Precision-section language (documented purity standard, HPLC-verified, mass-spectrometry-
  confirmed dosing) — no manufacturing-standard claims. Card titles ("99.1%+ Verified Purity,"
  "Exact Milligram Dosing") already matched the doc's two H3s exactly, so only descriptions/
  microcopy changed.
- **Found and fixed a real content bug in the FAQPage JSON-LD** in `page.tsx`: one of the 5
  hardcoded schema questions read "What is Helix Bio and how do peptides relate to it?" with an
  answer describing "Helix Bio" as "the practice of optimizing physical appearance through
  controllable factors" — leftover copy from an unrelated looksmaxxing-vertical template, not
  this brand. This whole 5-question block has been replaced (see below), so the bug is resolved
  by the rewrite rather than patched individually.
- **FAQ section expanded from 5 (schema-only) to 10 (schema + visible content), per your
  instruction.** `home.faqSection.items` in `messages/en.json` already had exactly 10 keys before
  I touched it, but their questions didn't match the doc's 10-question list (e.g. it had a
  "batch-to-batch consistency" question the doc doesn't ask, and none of the doc's Q1/Q2/Q3/Q4/Q9/
  Q10 wording). Rewrote all 10 question/answer pairs to the doc's exact Section 12 text, and
  renamed the one key with no doc equivalent (`batchConsistency`) to `supplierLegitimacy` to carry
  the doc's Q10 ("How can I tell if a research peptide supplier is legitimate?") — updated the
  `FAQ_KEYS` order in `FaqSection.tsx` to match. Replaced `page.tsx`'s FAQPage JSON-LD (previously
  only 5 entries, one of them the bug above) with all 10, verbatim-matching the new on-page
  content, so schema and visible FAQ stay in sync per Google's policy. Per your instruction, used
  the doc's own answer for Q10 despite the writer's caveat that it was reconstructed from a
  cut-off capture — flagging it here as the one FAQ answer that still needs a live-page
  confirmation pass before launch (the other 9 weren't flagged by the writer).
- Updated `home.metaTitle`/`home.metaDescription` to the doc's exact copy (54-char title / 149-char
  description). Canonical stays at `/` per the doc (no slug change recommended for the homepage).
- `page.tsx`'s `Organization` JSON-LD had no email or phone at all; added
  `support@helixbio.com` (brand-purged per your override, doc's version said
  `support@99puritypeptides.com`) and the sitewide phone placeholder `+1-000-000-0000`, matching
  the `Organization`/`ContactPoint` pattern already used on Contact Us. `WebPage`, `BreadcrumbList`,
  and `WebSite`/`SearchAction` were left structurally as-is (the doc doesn't call for removing the
  existing single-item `BreadcrumbList` even though it recommends never adding one to a homepage,
  and doesn't mention `WebSite`/`SearchAction` at all). No `Product` schema added, per the doc's
  explicit deferral pending live CMS product data.
- **Hero (`Hero.tsx`, fully hardcoded JSX, not i18n-driven):** the H1 already read "Discover
  Premium Research Peptides" — an exact match to the doc's H1, no change needed there. Updated the
  subtitle paragraph and hero image alt text to the doc's copy. Updated the three stat cards in
  the floating trust bar to the doc's Section 9 trust-bar table: card 1 label changed from
  "Satisfied Researchers" to "Research orders fulfilled in the USA" (value "10 k+" restyled to
  "10K+" to match the doc's formatting); card 2 was repurposed from a "99.9% / Verified Purity"
  stat to "COA / Certificate of analysis included with every batch" per the doc (purity is already
  covered elsewhere on the page, e.g. TrustBadges); card 3 label changed to "Independently tested
  for purity and identity." **Open question:** the doc calls for a hero CTA button labeled "Shop
  Research Peptides," but the live Hero's floating action bar has a Calculator link, a newsletter
  input, and a "Search Peptides" button that opens a search modal rather than linking to /shop —
  there's no direct hero-level link to the shop. Left the action bar's structure/behavior alone
  (redesigning it felt out of scope for a content-and-schema pass), but flagging this gap for a
  product decision: either relabel/relink the existing search button, or add a dedicated shop CTA.
- **"Our Best Sellers" (`home.bestSeller`, `BestSellerSection.tsx`):** updated the section
  description to the doc's copy. `eyebrow`/`title`/`ctaText` already matched the doc ("Most
  Popular" eyebrow wasn't specified by the doc but wasn't contradicted either; title "Our Best
  Sellers." and CTA "View All Products" were already exact matches). Left the CMS-driven product
  cards and the `FALLBACK_PRODUCTS` array untouched — the doc explicitly declines to guess product
  names/prices from its low-resolution capture, and the existing fallback data (TB-500, BPC-157,
  Semaglutide, GHK-Cu) already matches compounds named elsewhere in the doc's keyword strategy, so
  no fabrication was needed.
- **"Vitality Collection" (`home.difference`, `DifferenceSection.tsx`) — the biggest structural
  gap found this pass.** The doc names a full H2 section here ("Vitality Collection," with a
  description paragraph, an image alt text, and two proof stats: 10,000+ vials fulfilled / 99%+
  guaranteed purity), but the live component rendered no heading or description at all — it only
  showed a small floating badge ("Why choose HelixBio?") over an image plus a hardcoded 4-stat
  grid, and `useTranslations('home.difference')` was imported but never actually called (the
  `titleLine1`/`titleLine2`/`description`/`vialAlt`/`ctaText` keys existed in `messages/en.json`
  but were dead, unused values — a real wiring bug, not intentional minimalism). Fixed by: (1)
  updating `home.difference.titleLine1`/`titleLine2`/`description`/`vialAlt` to the doc's Vitality
  Collection copy (trimmed the doc's "...shown in the capture" aside, which was a reference to the
  writer's screenshot, not real content); (2) adding the missing H2 + description block to
  `DifferenceSection.tsx`'s JSX and wiring the image `alt` to `t('vialAlt')`; (3) updating the
  first two of the four hardcoded `STATS` entries (`Vials Fulfilled` / `Guaranteed Purity`) to the
  doc's exact proof-stat wording. Left the other two stats (`10+ Years Experience`, `24/7
  Dedicated Support`) untouched — the doc's proof-stats table only names two, but doesn't say
  remove any that already exist, and these aren't contradicted by anything in the brief. Also
  fixed the floating badge text "Why choose HelixBio?" → "Why choose Helix Bio?" for spacing
  consistency with the rest of the pass (not a 99Purity issue, just a missing space).
- **"Research Categories" (`home.categories`, `CategoriesSection.tsx`):** updated the section
  description to the doc's copy; `titleLine1`/`titleLine2`("RESEARCH"/"CATEGORIES.") and
  `exploreCursor` ("EXPLORE") already matched. **Open question / gap the doc itself can't close:**
  the doc's 8 category cards map specific compound names onto each card (GLP-1 & Metabolic =
  Semaglutide/Tirzepatide, Healing & Recovery = BPC-157/TB-500, etc.), but this section's category
  names and count come entirely from live CMS data (`getVisibleCategories()`), not from i18n — the
  `home.categories.items.*` keys (`recovery`, `receptorAgonist`, `metabolic`, `growthFactor`,
  `cognitiveFunction`, `cellularHealth`, `bioregulators`, `essentials`) are dead/unused legacy
  content that no component actually reads (confirmed via grep — nothing references
  `categories.items`). Per the instruction not to touch CMS data-fetching or invent category
  names, I did not rename or reorder categories; I only updated the generic per-card fallback
  description (`DEFAULT_DESC` in `CategoriesSection.tsx`, shown under every card since no
  category-specific description exists) from a generic marketing line to compound-agnostic,
  research-application-focused copy. Whoever owns the CMS category records should confirm the 8
  live category names against the doc's list and rename/reorder them there if a closer match is
  wanted — that's a CMS content task, not a code change.
- **"Engineered for Absolute Precision" (`home.trustBadges`, `TrustBadges.tsx`):** `eyebrow` ("The
  Helix Bio Standard"), `titleLine1`/`titleLine2` ("ENGINEERED FOR" / "ABSOLUTE PRECISION"), and
  both card titles ("99.1%+ Verified Purity," "Exact Milligram Dosing") already matched the doc
  exactly. Updated `description` and the purity/dosing card copy per the compliance fix above.
  Left the third card ("Lyophilized Stability") untouched — it's not one of the doc's two named
  H3s, but nothing in it contradicts the doc or makes a false regulatory claim, so no fabricated
  content was needed to keep it.
- **"What Sets Us Apart" (`home.whatSetsUsApart`, `WhatSetsUsApart.tsx`):** besides the brand-name
  fix in the intro `description`, rewrote all four item descriptions (Verified Purity Standards,
  Mass Spectrometry Validation, Comprehensive Documentation, Research-Only Positioning) to the
  doc's shorter, more direct Section 9 copy. All four titles already matched the doc's H3s exactly.
- **"30% Off for Our Heroes" (`home.militaryDiscount`, `MilitaryDiscountSection.tsx`):** updated
  `description` to the doc's copy (adds "first responders" alongside military/veterans, matching
  the doc's eligibility language). `titleLine1`/`titleLine2` ("30% OFF" / "FOR OUR HEROES") already
  matched the doc's H2 exactly. Left the verification form, its field labels, and the
  privacy-notice copy untouched — not covered by the doc and not contradicted by anything in it.
  The `JourneySection.tsx` steps 2 and 3 headings ("Validating identity and mass with 3rd-Party
  Testing," "Securing compounds via Cold-Chain Packaging") already matched the doc's two H3s under
  this section verbatim — no change needed there.
- **"Transparency You Can Trust" (`home.whyChooseUs`, `WhyChooseUs.tsx`):** rewrote all three item
  descriptions (HPLC-Verified Purity, MS Identity Confirmation, Complete COA Documentation) to the
  doc's Section 9 copy. Titles already matched the doc's three H3s (near-exactly — "HPLC-Verified
  Purity" vs. doc's "HPLC Verified Purity," "MS Identity Confirmation" vs. doc's "MS-Identity
  Confirmation" — cosmetic hyphenation differences only, left as-is rather than touching working
  heading text over a hyphen). Left the `tag` fields (e.g. "Trusted & Verified," "Test It Free")
  untouched — the doc doesn't cover them and they aren't contradicted by anything in the brief.
- **"Latest Peptide Research Resources" (`home.blogSection`, `BlogSection.tsx`):** updated
  `subtitle` to the doc's section intro line. `titleLine1`/`titleLine2` ("Latest Peptide" /
  "Research Resources") already matched the doc's H2 exactly. Left the CMS/data-driven blog post
  cards (`BLOG_POSTS` from `@/data/blog-posts`) and the "Peptide Calculator" resource card
  reference untouched — the doc explicitly declines to reconstruct exact live blog titles/URLs
  from its partial capture, so no fabricated card copy was added; only the static wrapper text
  around the cards was touched.
- No changes needed to `ImageSliderSection.tsx` (pure image carousel, no copy, no brand text) or to
  `BestSellerSection.tsx`'s/`BlogSection.tsx`'s CMS data-fetching logic. `MerchandiseSection.tsx` is
  commented out in `page.tsx` (`{/* <MerchandiseSection /> */}`) and not part of the doc's heading
  outline, so it was left untouched — it isn't rendered on the live homepage. `AboutTeaser.tsx`,
  `BlogTeaser.tsx`, `CoaSection.tsx`, `FeaturedProductsSection.tsx`, `Newsletter.tsx`, and
  `ParallaxImageSection.tsx` are likewise not imported anywhere in `page.tsx` — confirmed dead
  homepage components with their own unused `home.*` i18n keys (e.g. `home.newsletter`,
  `home.coaSection`, `home.aboutTeaser`) — left untouched as out of scope, since editing content
  nobody sees would be wasted/misleading work.
- No phone number appears anywhere in the homepage's visible copy (it only shows up in the new
  Organization schema, using the sitewide placeholder as noted above); no street address appears
  on this page at all, so neither needed the "leave existing address alone" treatment used on
  other pages.

## Shop (done)
- **Brand relationship override, same as Contact Us/Affiliates/Homepage.** The doc's own cover
  note flags "Helix Bio vs 99Purity Peptides" on this page as still needing client confirmation
  and, unlike some of the other docs, doesn't even argue for keeping the old name — it just
  hedges. Per your instruction this is now confirmed: Helix Bio is a fully separate brand. Purged
  every "99PurityPeptides"/"99Purity Peptides" instance, all of which lived in
  `shop.shopClient.faqs.*` in `messages/en.json` (8 instances across 5 FAQ answers, plus one
  `orders@99puritypeptides.com` email inside the old "bulk discounts" answer) — resolved as part
  of the full FAQ rewrite below, not a separate find/replace pass.
- **FAQ content fully rewritten to match the doc's 20 Q&As, replacing the old FAQ set almost
  entirely.** The page already had exactly 20 FAQ keys in `shop.shopClient.faqs`
  (`SHOP_FAQ_KEYS` in `ShopClient.tsx`) in a topic order that lined up with the doc's 20 questions
  19 times out of 20 — but the *content* was old 99Purity Peptides copy (different product
  claims, cGMP language, per-mg pricing structure, `orders@99puritypeptides.com`) that needed
  replacing outright, not just a brand-name swap. Replaced all 20 question/answer pairs with the
  doc's Section 12 copy verbatim. The one key that had no doc equivalent — `bulkDiscounts`
  ("Do you offer bulk discounts for laboratory peptide purchases?") — was renamed to
  `orderDocumentation` to carry the doc's Q11 ("What documentation comes with laboratory peptide
  purchases?"), the same pattern used for the Homepage's `batchConsistency` → `supplierLegitimacy`
  rename. Updated `SHOP_FAQ_KEYS` in `ShopClient.tsx` to match. `faqDescription` updated to the
  doc's exact intro line ("Common questions about research peptides, ordering, and site
  standards.").
- **Added `FAQPage` JSON-LD to `page.tsx`'s `@graph`** (previously WebPage, CollectionPage,
  BreadcrumbList, WebSite, Organization only — no FAQ schema existed). Pulls all 20 Q&As
  server-side via `getTranslations('shop.shopClient')` using the same `SHOP_FAQ_KEYS` array/order
  as the client component, so the schema matches the visible on-page FAQ (rendered via
  `SharedFaqSection` in `ShopClient.tsx`) exactly, per Google's FAQPage policy. Kept `WebPage` and
  `WebSite` in the graph even though the doc's Section 13 only lists CollectionPage, BreadcrumbList,
  Organization, and FAQPage as "safe to ship now" — the doc doesn't say to remove existing schema
  types, and WebPage/WebSite aren't contradicted by anything in the brief. Did **not** add
  Product/Offer schema, per the doc's explicit instruction that it's deferred until real,
  non-empty product/pricing data exists.
- **Trust-bar third stat badge** (the doc's flagged gap #3): the live component
  (`ShopClient.tsx`) rendered a literal `503A/B` / "COMPLIANT FACILITIES" badge — not illegible in
  code (unlike the writer's screenshot), but a real compliance bug: 503A/503B are FDA
  compounding-pharmacy registration categories for human-use compounding, and the site's own
  Medical Disclaimer (`footer.disclaimerText`, `medicalDisclaimer.section5Text`) explicitly states
  Helix Bio is *not* a 503A/503B compounding facility — so this badge directly contradicted the
  site's own compliance language, exactly the risk the doc's cover note warned about. Replaced
  with `100%` / "BATCHES COA-VERIFIED" — a claim already backed by the FAQ ("Yes. Every batch is
  verified through third-party HPLC and mass spectrometry testing...") and consistent with the
  RUO/lab-testing framing used everywhere else on the site, per the doc's instruction to use "a
  specific COA-on-file count... rather than an ambiguous alphanumeric code."
- Also corrected the second stat badge's label for accuracy while in the same stats grid: it read
  "30K+ / BATCHES TESTED", but the doc's trust-bar table defines the 30K+ figure as "Vials shipped
  to U.S. research labs" — a different metric (batches tested vs. vials shipped). Since the number
  itself wasn't flagged as wrong, only relabeled it to "VIALS SHIPPED TO U.S. LABS" to match the
  doc's stated meaning; left the first badge (`99%` / "PURITY GUARANTEE") unchanged since it
  already matches the doc's "Average batch purity, confirmed by third-party COA" in substance.
- **Empty-state copy** (doc's flagged gap #2): `shop.shopClient.noProductsFound` /
  `noProductsFoundDescription` (rendered via `EmptyState` in `ShopClient.tsx` when the CMS-driven
  product grid is empty) previously read generic "No products found" / "Try adjusting your
  filters to find what you're looking for." Replaced with the doc's copy: title "No peptides match
  your current filters" and description "No peptides match your current filters right now. Try
  clearing your filters, or check back shortly — our catalog restocks regularly and every batch is
  COA-verified before it's listed." Also re-cased the button copy from "Clear all filters" to the
  doc's "Clear All Filters". Did not touch the CMS product-fetching logic itself — the doc is
  explicit that a shop page with zero live products can't rank regardless of copy, and getting
  real inventory live is a pre-launch dependency outside this content pass's scope.
- **Hero copy** (hardcoded plain JSX in `ShopClient.tsx`, not i18n — same pattern as the
  homepage's `Hero.tsx`): H1 changed from "SHOP NOW" to "Shop Research Peptides" (doc's H1;
  the `uppercase` CSS class already renders it in caps, so casing in the JSX source doesn't need
  to match the visual style) and the subtitle line changed from "Exceeding Standards In Pure
  Synthetic Peptides" to the doc's hero paragraph. Also updated the hero banner image's `alt` text
  to the doc's recommended alt copy ("Helix Bio research peptide vials with certificate of
  analysis, USA laboratory supply") — it previously read the generic "Research Facility".
- **Meta title/description** in `page.tsx` (hardcoded JS strings, per the existing pattern —
  left them as-is rather than moving to i18n, matching how this file already worked) updated to
  the doc's exact copy: "Research Peptides Shop | Lab-Verified Purity | Helix Bio" (56 chars) /
  "Shop research peptides online with verified COA on every batch, 99% purity, and fast USA
  shipping. Browse the Helix Bio catalog and order today." (144 chars). Canonical stays `/shop`
  per the doc's explicit recommendation to keep the existing slug.
- **Breadcrumbs**: doc calls for "Home / Shop / All Research Peptides" (3 crumbs, flat structure —
  no true subcategory pages exist yet). The existing `BreadcrumbList` only had 2 items (Home,
  Shop); added the third ("All Research Peptides", pointing at `/shop` since there's no distinct
  URL for the "all" view).
- **Not implemented — flagging as an open item, not a silent gap:** the doc's Section 9 also
  specifies a closing CTA band ("Ready to Elevate Your Research" H2 + body copy + "Explore Full
  Catalog" button + image) and a "Footer newsletter block" (join-research-community copy +
  "Subscribe" CTA) as part of this page's layout. Neither section exists anywhere in
  `ShopClient.tsx` or `page.tsx` today — there's no matching component to update, and the site
  already has a separate, unrelated `Newsletter.tsx`/Footer newsletter elsewhere in the codebase
  that this pass didn't touch. Adding new sections/components felt like it crossed from a
  content-and-schema pass into a layout change, which is out of scope per your instruction not to
  over-refactor — flagging for a product decision on whether to add a closing-CTA component to
  this page.
- Left the filter/category bar, product grid, sort dropdown, infinite-scroll copy
  (`loadingMore`/`reachedEndOfCatalog`), and the banner-row "NEW BATCHES" / "Leaders in
  high-purity synthesis" copy untouched — none of it contains stale branding, and none of it is
  named as a gap in the doc (the doc's own Section 9 note says filter tabs and stat-bar numbers
  are UI copy handled by the trust-bar/empty-state guidance above, not separate headings to
  rewrite). The doc's recommended filter labels (GLP-1, Tissue-Repair, Growth-Hormone,
  Cognitive/Nootropic) map to live CMS category data (`categories` prop from Payload), which
  per the task instructions was not to be touched — that's a CMS content task for whoever manages
  category records, not a code change.
- No phone number or street address appears anywhere on this page's visible copy or schema, so
  neither needed the sitewide placeholder/leave-alone treatment used on other pages.

## FAQ (done)
- No brand-purge work needed here: `src/data/faqs.ts` had no "99Purity"/"99PurityPeptides"
  instances before this pass (confirmed via grep across `src/`), and `FaqClient.tsx` renders
  `faqData` generically (category/item loop, no hardcoded per-category copy) — nothing to fix
  there. `src/app/[locale]/(frontend)/faq/page.tsx` already builds `FAQPage`/`BreadcrumbList`
  JSON-LD dynamically from `faqData`, so no schema file changes were needed; verified the
  breadcrumb name is still "FAQ".
- **Doc coverage vs. live category count.** The doc's Section 9 gives exactly 3 categories with a
  1:1 question-count match to the live file (SLU-PP-332: 4/4, KLOW: 5/5, Glutathione: 5/5) — used
  doc text verbatim for those with no fresh content needed. Every other category (27 of 30) had
  fewer doc questions than the live file's existing item count (typically doc gives 2-4 questions
  where the page had 5 items already). Per the task instructions, kept the live per-category item
  count unchanged and filled the remaining slots with fresh SEO-fitted Q&As matching the doc's
  compliance-first voice (short, direct "No — RUO, not evaluated by the FDA, no dosing guidance"
  answers for compound pages; "who typically uses this / is analytical testing performed" pattern
  for the grouped research categories). Total: 110 doc-sourced Q&As transcribed verbatim from
  Section 9 (used as source of truth over Section 12's schema-flattened repeat, per instructions)
  plus 45 freshly written Q&As across 27 categories to fill out existing slot counts. 30
  categories / 183 total items updated, all now doc-sourced or freshly written — none left as
  unreviewed leftover copy.
- **GHK-Cu Peptide Research is the one large outlier**, and needed a different approach than the
  "keep count, fill gaps" pattern above: the doc gives only 8 questions for this category, but the
  live file already had 40 detailed, non-branded, RUO-compliant Q&As here (far more than the doc's
  compressed version, and clearly a richer, pre-existing content set rather than 99Purity leftover
  — reviewed all 40 for brand references and compliance language, found none). Rewriting all 40 to
  match a doc that only specifies 8 would have meant deleting 32 items of good existing content
  with no doc-backed replacement, which the task rules argue against. Instead: matched the doc's 8
  questions by topic to their closest existing counterparts (e.g. doc's "How does GHK-Cu contribute
  to cellular research on skin repair?" vs. the existing "How does GHK-Cu work at the cellular
  level?") and replaced those 8 items' question+answer text with the doc's exact Section 9 wording;
  left the other 32 items untouched since they're accurate, compliant, and not contradicted by the
  doc's shorter version. Flagging this as a judgment call, not a doc gap — worth a quick sanity
  check that the doc's writer intended GHK-Cu to stay this detailed rather than being trimmed to 8.
- **Writer-reconstructed questions, per the doc's own cover-note caveat** (partial/low-resolution
  capture, especially in General Peptide Education, Supplier & Ordering, and early compound
  sections): none of the doc's answers were marked with a distinct reconstruction flag beyond the
  cover note's general warning, so all General Peptide Education (Q1-3), Legality & Compliance
  (Q1-3), Quality & Analytical Testing (Q1-4), and Supplier & Ordering (Q1-4) questions/answers as
  transcribed into `faqs.ts` should get a confirm-against-live-page pass before launch, per the
  doc's own instruction — flagging the whole cluster rather than guessing which individual
  questions were affected, since the doc doesn't mark them individually.
- **KLOW/GLOW composition restraint followed as instructed**: did not invent or state an exact
  composition/mixing ratio for either blend anywhere in `faqs.ts` — used the doc's own deferral
  language ("composition and ratios should be confirmed against the current product page and
  certificate of analysis") verbatim for KLOW, and did not add composition claims to the one fresh
  GLOW item either.
- **Category-name mismatches found between the doc and the live file** (cosmetic only, not
  changed, since the doc's H2 outline and the live file's existing `category` strings differ only
  in casing/punctuation and the task didn't ask for a rename): doc's "MOTS-c" vs. live file's
  "MOTS-C"; doc's plain-case section names ("Legality & Compliance", "Quality & Analytical
  Testing", "Supplier & Ordering Questions", "Storage & Handling") vs. the live file's all-caps
  versions ("LEGALITY & COMPLIANCE", "QUALITY & ANALYTICAL TESTING", "SUPPLIER & ORDERING
  QUESTIONS", "STORAGE & HANDLING"). Left all category name strings exactly as they were in the
  file — only rewrote `items` — since renaming wasn't requested and the jump-nav pill labels
  reading in all-caps is a plausible deliberate design choice already reflected in the live UI.
- **One pre-existing non-doc item kept as-is**: `STORAGE & HANDLING`'s fourth item ("How much
  bacteriostatic water do I use to reconstitute a peptide?") isn't in the doc at all, but it's
  unique, accurate, non-branded content that links to a real page
  (`/how-much-bacteriostatic-water-reconstitute-peptides`) and a working calculator — reviewed it,
  confirmed no 99Purity references or compliance issues, and kept it rather than deleting a
  working internal link with no doc-backed replacement.
- Updated `content.faqPage.metaTitle`/`metaDescription` in `messages/en.json` to the doc's exact
  copy ("Research Peptides FAQ | Purity & Compliance | Helix Bio" / the purity-testing/COA/
  storage/RUO-compliance description). No slug change — doc confirms `/faq` stays as-is.
- No phone number, street address, or pricing/batch-number specifics appear anywhere in
  `faqs.ts`, so none of the sitewide placeholder rules or "don't invent specifics" rules needed
  applying beyond what's already noted above.
- Did not touch `messages/es.json` or `src/data/faqs.es.ts` per instructions (English only this
  pass).

## FAQ — follow-up pass: duplicate-content reword of remaining pre-existing items (done)
- Distinct from the "kept as-is" decisions logged above. Those earlier notes ("GHK-Cu... left the
  other 32 items untouched since they're accurate, compliant, and not contradicted by the doc's
  shorter version" and "One pre-existing non-doc item kept as-is" for the bacteriostatic-water
  question) were correct on facts/compliance, but both pockets are still verbatim 99Purity
  Peptides source copy — a duplicate-content risk for a not-yet-live site, independent of whether
  the content itself is accurate. This pass rewords (not re-facts) all of it.
- **GHK-Cu Peptide Research**: reworded 32 of the category's 40 items — every item except the 8
  whose question text was replaced verbatim with doc-sourced copy in the earlier pass (`What is
  GHK-Cu peptide?`, `What is the chemical structure of GHK-Cu?`, `How does GHK-Cu contribute to
  cellular research on skin repair?`, `What pathways does GHK-Cu modulate in skin cells?`, `How
  does GHK-Cu relate to collagen and elastin research?`, `Can GHK-Cu be studied in anti-wrinkle
  research contexts?`, `What research exists on GHK-Cu and skin elasticity?`, `How does GHK-Cu
  relate to skin regeneration research?` — confirmed all 8 still match the doc's GHK-Cu section
  word-for-word and were left untouched). The remaining 32 question+answer pairs were rewritten
  with different sentence structure, clause order, and word choice — same facts, same RUO/
  no-medical-claim/no-FDA-approval compliance stance, same single-`<p>` HTML pattern each item
  already used.
- **STORAGE & HANDLING**: reworded the "How much bacteriostatic water do I use to reconstitute a
  peptide?" question+answer (both paragraphs, including the sentence around the reconstitution-
  chart link), preserving the exact formula, the 10mg/2mL/5mg/mL and U-100/1mL/100-units examples,
  the link target (`/how-much-bacteriostatic-water-reconstitute-peptides`), and the two-`<p>` +
  spacer HTML structure.
- 33 items reworded total (32 GHK-Cu + 1 Storage & Handling). No other category, no TypeScript
  structure, and none of the 8 doc-sourced GHK-Cu items were touched. Verified with `tsc --noEmit`
  against `src/data/faqs.ts` — no syntax errors introduced.
- Same follow-up pass also reworded a few smaller pockets of pre-existing, doc-uncovered copy
  flagged as "left as-is" in earlier notes: the Homepage's "Lyophilized Stability" trust badge
  (`home.trustBadges.cards.stability`), all 5 JourneySection hardcoded copy points
  (`src/components/home/JourneySection.tsx` — step 1/4 headings and all 3 floating annotation
  lines), Affiliates' 6 final-CTA bullets (`affiliate.landing.finalCtaBullet1-6`), and About Us's
  two remaining doc-uncovered lines (`content.ourServices.card2Text2` and
  `content.ourServices.listItems.sourcingInquiries`). Same rule applied: same facts/meaning,
  different wording, no compliance claims changed.

## Privacy Policy, Refund Policy, Shipping Policy (done)
- No SEO content doc was supplied for these three pages — client asked to keep every policy rule
  unchanged (refund window, processing times, delivery estimates, etc.) but rewrite the wording
  throughout, since this content was carried over verbatim from the original 99Purity Peptides
  site during duplication and was never touched by any prior pass in this project.
- Rewrote all copy in `legal.privacyPolicy`, `legal.refundPolicy`, and `legal.shippingPolicy` in
  `messages/en.json` — every section intro, bullet, label, and closing note reworded with
  different sentence structure and phrasing. Section titles/order, key names, and all stated
  rules/numbers were kept identical (7-day refund window, 3–5 business day refund review, 48-hour
  damage-report window, 1–3 business day order processing, 3–7 day domestic / 7–15 day
  international delivery estimates, etc.) — only the wording changed, not the policy itself.
- Set the "January 2026" effective-date placeholder to "August 2026" on all three, matching the
  Terms/Medical Disclaimer pages from the earlier pass, for consistency.
- Did not touch `layout.tsx`/`page.tsx` for these three routes — confirmed via grep that all
  `t('sectionN...')` keys referenced in each `page.tsx` match the `en.json` key names exactly, so
  no structural or schema changes were needed, only the translation values.
- Did not add FAQ sections/schema to these three pages — not requested this time (unlike Terms/
  Medical Disclaimer, which got FAQ sections during the original 8-doc pass).
- `messages/es.json` untouched — English only, consistent with every prior pass.
