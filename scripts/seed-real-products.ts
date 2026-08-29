import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import path from 'path'
import fs from 'fs'

const IMG_DIR = path.join(process.cwd(), 'public', 'CA Product images')

// Old demo/mock products from scripts/seed-demo-products.ts — replaced by the real catalog below.
const OLD_DEMO_SLUGS = [
  'mt-1',
  'retatrutide',
  'bpc-157',
  'semaglutide',
  'tirzepatide',
  'cjc-1295',
  'ipamorelin',
  'tb-500',
]

// Shared boilerplate reused across every product — matches how a real RUO peptide catalog
// keeps its purity/compliance language standardized site-wide rather than rewritten per SKU.
const QUALITY_PURITY = 'Every batch is verified to ≥99% purity via independent third-party HPLC and mass-spectrometry testing. A Certificate of Analysis (COA) documenting identity, purity, and batch number is available for every lot we release, and nothing ships without passing our internal quality gate first.'
const COMPLIANCE_NOTICE = 'This product is sold strictly for laboratory and in-vitro research use only (RUO). It is not a drug, food, cosmetic, or dietary supplement, and it is not intended for human or veterinary use, diagnosis, treatment, cure, or prevention of any disease. Handling should be restricted to qualified individuals in a controlled research setting.'

type Variant = { dose: string; price: number; file: string; sku?: string }

interface ProductSeed {
  name: string
  slug: string
  category: string
  badge?: 'NEW' | 'SALE' | 'POPULAR'
  isBestSeller?: boolean
  description: string
  researchFocus: string
  variants: Variant[]
}

const PRODUCTS: ProductSeed[] = [
  {
    name: '5-Amino-1MQ',
    slug: '5-amino-1mq',
    category: 'GLP-1 & Metabolic',
    description: 'A small-molecule NNMT inhibitor studied for its role in cellular metabolic regulation and adipocyte research.',
    researchFocus: 'Research centers on 5-Amino-1MQ’s inhibition of nicotinamide N-methyltransferase (NNMT), an enzyme implicated in fat-cell metabolism and NAD+ homeostasis. In-vitro models are used to study downstream effects on cellular energy expenditure and lipid metabolism pathways.',
    variants: [{ dose: '50MG', price: 89, file: '5 Amino 1 50mg.png' }],
  },
  {
    name: 'AHK-Cu',
    slug: 'ahk-cu',
    category: 'Cosmetic & Skin',
    description: 'A copper-binding tripeptide complex studied alongside GHK-Cu for dermal and connective-tissue research applications.',
    researchFocus: 'AHK-Cu is investigated for copper-peptide signaling relevant to collagen and elastin synthesis pathways, with research models focused on wound-model fibroblast activity and extracellular matrix remodeling.',
    variants: [
      { dose: '50MG', price: 79, file: 'AHK-CU  50MG.png' },
      { dose: '100MG', price: 139, file: 'AHK-CU  100MG.png' },
    ],
  },
  {
    name: 'AOD9604',
    slug: 'aod9604',
    category: 'GLP-1 & Metabolic',
    description: 'A modified fragment of human growth hormone (176-191) studied specifically for its lipolytic activity without broader GH signaling effects.',
    researchFocus: 'Research examines AOD9604’s isolated fat-metabolizing fragment of the HGH molecule, focusing on lipolysis and inhibition of lipogenesis in adipose-tissue models, independent of IGF-1-mediated growth pathways.',
    variants: [
      { dose: '5MG', price: 69, file: 'AOD9604 5MG.png' },
      { dose: '10MG', price: 109, file: 'AOD9604 10MG.png' },
    ],
  },
  {
    name: 'ARA-290',
    slug: 'ara-290',
    category: 'Healing & Recovery',
    description: 'A non-hematopoietic erythropoietin analog studied for tissue-protective and anti-inflammatory signaling, without the hematologic effects of native EPO.',
    researchFocus: 'ARA-290 is studied for its interaction with the innate repair receptor (IRR), a heterodimer of the erythropoietin receptor and CD131, in models of neuropathic and inflammatory tissue injury.',
    variants: [{ dose: '10MG', price: 99, file: 'ARA-290 10MG.png' }],
  },
  {
    name: 'BPC-157 / TB-500 Blend',
    slug: 'bpc-157-tb-500-blend',
    category: 'Peptide Bundles',
    badge: 'POPULAR',
    isBestSeller: true,
    description: 'A combined-vial formulation pairing BPC-157 and TB-500 for research into synergistic tissue-repair and angiogenesis pathways.',
    researchFocus: 'This blend is used in comparative research on combined gastric-pentadecapeptide and thymosin-beta-4-fragment signaling, studying whether the two mechanisms of action produce additive effects in cellular migration and repair models.',
    variants: [
      { dose: '5MG/5MG', price: 129, file: 'BPC TB-500  5MG-5MG.png' },
      { dose: '10MG/10MG', price: 199, file: 'BPC TB-500  10MG-10MG.png' },
    ],
  },
  {
    name: 'BPC-157',
    slug: 'bpc-157',
    category: 'Healing & Recovery',
    badge: 'POPULAR',
    isBestSeller: true,
    description: 'A pentadecapeptide derived from a gastric protective protein, widely studied for its role in accelerated tissue repair and healing.',
    researchFocus: 'Research on BPC-157 focuses on its interaction with growth-factor pathways involved in angiogenesis and cellular migration, with in-vitro and animal models examining connective-tissue, tendon, and gut-mucosa repair processes.',
    variants: [
      { dose: '5MG', price: 55, file: 'BPC-157  5MG.png' },
      { dose: '10MG', price: 89, file: 'BPC-157 10MG.png' },
    ],
  },
  {
    name: 'CJC-1295 / Ipamorelin Blend',
    slug: 'cjc-1295-ipamorelin-blend',
    category: 'Peptide Bundles',
    badge: 'POPULAR',
    isBestSeller: true,
    description: 'A combined-vial formulation pairing a GHRH analog with a selective GH secretagogue for synergistic growth-hormone axis research.',
    researchFocus: 'This blend is used to study the combined effect of GHRH-receptor stimulation (CJC-1295) and ghrelin-receptor-mediated GH pulse induction (Ipamorelin), a pairing frequently modeled for its complementary, non-overlapping mechanisms.',
    variants: [{ dose: '5MG/5MG', price: 119, file: 'CJC Ipamorelin  5MG-5MG.png' }],
  },
  {
    name: 'CJC-1295 (No DAC)',
    slug: 'cjc-1295-no-dac',
    category: 'Growth Hormone Secretagogue',
    description: 'A growth hormone-releasing hormone (GHRH) analog without the Drug Affinity Complex modification, studied for its short-acting GH-secretagogue profile.',
    researchFocus: 'Without the DAC modification, this analog has a short half-life, making it a common reference compound in research protocols studying pulsatile GH release timing relative to GHRH-receptor activation.',
    variants: [{ dose: '10MG', price: 79, file: 'CJC-1295 No DAC  10MG.png' }],
  },
  {
    name: 'CJC-1295 (with DAC)',
    slug: 'cjc-1295-with-dac',
    category: 'Growth Hormone Secretagogue',
    description: 'A long-acting GHRH analog modified with a Drug Affinity Complex for extended plasma stability in sustained-release GH research.',
    researchFocus: 'The DAC modification binds serum albumin, extending the analog’s half-life considerably versus the unmodified form — a property studied in research protocols examining sustained GHRH-receptor stimulation over time.',
    variants: [{ dose: '5MG', price: 89, file: 'CJC-1295 W DAC  5MG.png' }],
  },
  {
    name: 'Cagrilintide',
    slug: 'cagrilintide',
    category: 'GLP-1 & Metabolic',
    badge: 'NEW',
    description: 'A long-acting amylin receptor agonist studied for its role in appetite regulation and metabolic research, often paired with GLP-1 agonist protocols.',
    researchFocus: 'Cagrilintide is investigated for amylin-receptor-mediated satiety signaling, with research increasingly focused on its combined effects alongside GLP-1 receptor agonists in metabolic-regulation models.',
    variants: [{ dose: '10MG', price: 159, file: 'Cagrilintide 10MG.png' }],
  },
  {
    name: 'DSIP',
    slug: 'dsip',
    category: 'Cognitive & Nootropic',
    description: 'Delta Sleep-Inducing Peptide, studied for its role in modulating sleep-architecture and neuroendocrine stress-response pathways.',
    researchFocus: 'DSIP research focuses on its influence on delta-wave sleep patterns and its interaction with the hypothalamic-pituitary-adrenal axis, with models examining stress-hormone regulation and circadian signaling.',
    variants: [{ dose: '10MG', price: 69, file: 'DSIP 10MG.png' }],
  },
  {
    name: 'Dihexa',
    slug: 'dihexa',
    category: 'Cognitive & Nootropic',
    description: 'A synthetic derivative of angiotensin IV studied for its neurogenic and synaptogenic activity in cognitive-function research.',
    researchFocus: 'Dihexa is investigated for its potent activation of the HGF/c-Met signaling pathway, a mechanism studied for its role in synapse formation and neuronal plasticity in preclinical cognitive models.',
    variants: [{ dose: '10MG', price: 99, file: 'Dihexa 10MG.png' }],
  },
  {
    name: 'Epithalon',
    slug: 'epithalon',
    category: 'Cosmetic & Skin',
    description: 'A synthetic tetrapeptide studied for its interaction with telomerase activity in cellular-aging and longevity research models.',
    researchFocus: 'Research on Epithalon centers on its reported activation of telomerase in select cell lines, along with its influence on pineal-gland melatonin regulation, both studied in the context of cellular senescence.',
    variants: [
      { dose: '10MG', price: 65, file: 'Epithalon 10MG.png' },
      { dose: '50MG', price: 189, file: 'Epithalon 50MG.png' },
    ],
  },
  {
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    category: 'Cosmetic & Skin',
    badge: 'POPULAR',
    description: 'A naturally occurring copper-binding peptide extensively studied for its role in collagen synthesis, wound-model repair, and anti-aging research.',
    researchFocus: 'GHK-Cu is one of the most-studied copper peptides, with research spanning dermal fibroblast stimulation, antioxidant enzyme upregulation, and extracellular matrix remodeling in skin and connective-tissue models.',
    variants: [{ dose: '30MG', price: 75, file: 'GHK-CU 30MG.png' }],
  },
  {
    name: 'GHRP-2',
    slug: 'ghrp-2',
    category: 'Growth Hormone Secretagogue',
    description: 'A synthetic hexapeptide studied as a ghrelin-receptor agonist for its potent, dose-dependent growth hormone secretagogue activity.',
    researchFocus: 'GHRP-2 research focuses on its strong ghrelin-receptor binding affinity and its use as a reference compound for comparing GH-pulse amplitude across secretagogue classes.',
    variants: [{ dose: '100MG', price: 149, file: 'GHRP-2  100MG.png' }],
  },
  {
    name: 'GHRP-6',
    slug: 'ghrp-6',
    category: 'Growth Hormone Secretagogue',
    description: 'A hexapeptide ghrelin-receptor agonist studied for GH-release activity along with an appetite-stimulating research profile.',
    researchFocus: 'In addition to GH-secretagogue activity, GHRP-6 is studied for its distinct effect on hypothalamic appetite-regulation pathways compared to other secretagogues in its class.',
    variants: [{ dose: '10MG', price: 59, file: 'GHRP-6 10MG.png' }],
  },
  {
    name: 'Glow Blend',
    slug: 'glow-blend',
    category: 'Peptide Bundles',
    badge: 'NEW',
    description: 'A combined-vial skin and repair-focused formulation pairing GHK-Cu with BPC-157 and TB-500 for dermal and tissue research.',
    researchFocus: 'This blend is used to study the intersection of copper-peptide dermal signaling with systemic tissue-repair peptides, a combination frequently modeled in aesthetic and regenerative research protocols.',
    variants: [{ dose: '70MG', price: 179, file: 'Glow 70MG.png' }],
  },
  {
    name: 'Glutathione',
    slug: 'glutathione',
    category: 'Cosmetic & Skin',
    description: 'A tripeptide antioxidant studied for its role in cellular oxidative-stress defense and skin-brightening research.',
    researchFocus: 'Research on glutathione centers on its function as the body’s primary intracellular antioxidant, with studies examining its influence on melanin-synthesis pathways and oxidative-stress markers.',
    variants: [
      { dose: '600MG', price: 55, file: 'Glutathione 600MG.png' },
      { dose: '1500MG', price: 119, file: 'Glutathione  1500MG.png' },
    ],
  },
  {
    name: 'H-Frag',
    slug: 'h-frag',
    category: 'GLP-1 & Metabolic',
    description: 'A modified fragment of the human growth hormone molecule studied for isolated lipolytic activity in metabolic research models.',
    researchFocus: 'Similar in design intent to other HGH-fragment analogs, H-Frag is studied for fat-metabolism signaling isolated from the broader growth-promoting effects of the full HGH molecule.',
    variants: [{ dose: '5MG', price: 69, file: 'H Frag 5MG.png' }],
  },
  {
    name: 'HCG',
    slug: 'hcg',
    category: 'Sexual & Hormonal',
    description: 'Human Chorionic Gonadotropin, studied for its LH-receptor agonist activity in reproductive-endocrinology research models.',
    researchFocus: 'HCG research focuses on its structural similarity to luteinizing hormone and its resulting activation of gonadal steroidogenesis pathways, widely used as a reference compound in reproductive-axis studies.',
    variants: [
      { dose: '5000 IU', price: 65, file: 'HCG 5000 IU.png' },
      { dose: '10000 IU', price: 109, file: 'HCG   10000 IU.png' },
    ],
  },
  {
    name: 'IGF-1 LR3',
    slug: 'igf-1-lr3',
    category: 'Growth Hormone Secretagogue',
    description: 'A long-acting analog of Insulin-like Growth Factor 1 studied for its extended bioavailability in cellular-growth and repair research.',
    researchFocus: 'The Long R3 modification reduces binding to IGF-binding proteins, extending activity versus native IGF-1 — a property studied for sustained IGF-1 receptor signaling in muscle and connective-tissue models.',
    variants: [{ dose: '1MG', price: 129, file: 'IGF-LR3  1MG.png' }],
  },
  {
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    category: 'Growth Hormone Secretagogue',
    badge: 'NEW',
    isBestSeller: true,
    description: 'A selective growth hormone secretagogue studied for its targeted, pulsatile GH-release profile with minimal off-target receptor activity.',
    researchFocus: 'Ipamorelin is one of the most selective ghrelin-receptor agonists studied to date, with research emphasizing its clean GH-pulse induction without meaningfully affecting cortisol, prolactin, or appetite signaling.',
    variants: [
      { dose: '5MG', price: 55, file: 'Ipamorelin 5MG.png' },
      { dose: '10MG', price: 89, file: 'Ipamorelin  10MG.png' },
    ],
  },
  {
    name: 'KPV',
    slug: 'kpv',
    category: 'Healing & Recovery',
    description: 'A tripeptide fragment of alpha-MSH studied for its anti-inflammatory signaling independent of pigmentation-related melanocortin activity.',
    researchFocus: 'KPV research focuses on its anti-inflammatory action at the cellular level, including studies in gut-barrier and dermal-inflammation models, without engaging the pigmentation pathway associated with full-length alpha-MSH.',
    variants: [{ dose: '10MG', price: 69, file: 'KPV 10MG.png' }],
  },
  {
    name: 'Kisspeptin-10',
    slug: 'kisspeptin-10',
    category: 'Sexual & Hormonal',
    description: 'A neuropeptide fragment studied for its role as an upstream regulator of the hypothalamic-pituitary-gonadal (HPG) axis.',
    researchFocus: 'Kisspeptin-10 is investigated for its activation of GnRH neurons, positioning it as a key research tool for studying the upstream control of reproductive-hormone cascades.',
    variants: [{ dose: '10MG', price: 79, file: 'Kisspeptin 10MG.png' }],
  },
  {
    name: 'Klow Blend',
    slug: 'klow-blend',
    category: 'Peptide Bundles',
    description: 'A combined-vial formulation pairing Kisspeptin, GHK-Cu, BPC-157, and TB-500 for multi-pathway hormonal and repair research.',
    researchFocus: 'This blend is used in research protocols studying the interaction between hypothalamic-axis signaling and localized tissue-repair/dermal pathways within a single combined model.',
    variants: [{ dose: '80MG', price: 199, file: 'Klow 80MG.png' }],
  },
  {
    name: 'L-Carnitine',
    slug: 'l-carnitine',
    category: 'GLP-1 & Metabolic',
    description: 'An amino-acid derivative studied for its role in mitochondrial fatty-acid transport and cellular energy-metabolism research.',
    researchFocus: 'L-Carnitine research centers on its function shuttling long-chain fatty acids into the mitochondrial matrix for beta-oxidation, a core mechanism studied in metabolic and exercise-physiology models.',
    variants: [{ dose: '400MG', price: 39, file: 'L-Carnitine 400MG.png' }],
  },
  {
    name: 'LL-37',
    slug: 'll-37',
    category: 'Healing & Recovery',
    description: 'A cathelicidin-derived antimicrobial peptide studied for its role in innate immune defense and wound-model repair research.',
    researchFocus: 'LL-37 is studied for its broad-spectrum antimicrobial activity and its secondary role in modulating inflammation and angiogenesis during tissue-repair processes.',
    variants: [{ dose: '1MG', price: 59, file: 'LL-37 1MG.png' }],
  },
  {
    name: 'Lipo-C',
    slug: 'lipo-c',
    category: 'GLP-1 & Metabolic',
    description: 'A lipotropic compound blend studied for its role in hepatic fat metabolism and cellular energy research.',
    researchFocus: 'Lipo-C combines lipotropic agents traditionally studied for supporting fat mobilization and liver-metabolism pathways, used as a reference formulation in metabolic-research protocols.',
    variants: [{ dose: '120MG', price: 55, file: 'Lipo-C 120MG.png' }],
  },
  {
    name: 'MOTS-c',
    slug: 'mots-c',
    category: 'GLP-1 & Metabolic',
    badge: 'NEW',
    description: 'A mitochondrial-derived peptide studied for its role in cellular energy metabolism and metabolic-homeostasis research.',
    researchFocus: 'MOTS-c is investigated for its regulation of the AMPK pathway and insulin sensitivity, with research models exploring mitochondrial-nuclear communication in metabolic stress response.',
    variants: [
      { dose: '10MG', price: 69, file: 'MOTS-C  10MG.png' },
      { dose: '40MG', price: 199, file: 'MOTS-C 40MG.png' },
    ],
  },
  {
    name: 'Melanotan 1',
    slug: 'melanotan-1',
    category: 'Cosmetic & Skin',
    description: 'A synthetic analog of alpha-MSH studied for melanogenesis and pigmentation-pathway research.',
    researchFocus: 'Melanotan 1 is studied for its selective activation of the MC1 receptor, driving eumelanin production in melanocyte models without the broader receptor activity seen in Melanotan 2.',
    variants: [{ dose: '10MG', price: 65, file: 'Melanotan-1  10mg.png' }],
  },
  {
    name: 'Melanotan 2',
    slug: 'melanotan-2',
    category: 'Cosmetic & Skin',
    description: 'A synthetic analog of alpha-MSH studied for its broader melanocortin-receptor activity in pigmentation research.',
    researchFocus: 'Melanotan 2 activates multiple melanocortin receptors (MC1, MC3, MC4), making it a research tool for studying both pigmentation pathways and broader melanocortin-system signaling.',
    variants: [{ dose: '10MG', price: 65, file: 'Melanotan-2 10MG.png' }],
  },
  {
    name: 'NAD+',
    slug: 'nad-plus',
    category: 'Cognitive & Nootropic',
    badge: 'POPULAR',
    description: 'Nicotinamide Adenine Dinucleotide, a coenzyme central to cellular energy production, studied in mitochondrial-function and aging research.',
    researchFocus: 'NAD+ research spans mitochondrial ATP production, sirtuin-pathway activation, and DNA-repair enzyme function (PARPs), with declining NAD+ levels a well-studied marker of cellular aging.',
    variants: [
      { dose: '500MG', price: 79, file: 'NAD+ 500MG.png' },
      { dose: '1000MG', price: 139, file: 'NAD+ 1000MG.png' },
    ],
  },
  {
    name: 'Oxytocin',
    slug: 'oxytocin',
    category: 'Sexual & Hormonal',
    description: 'A neuropeptide hormone studied for its role in social bonding, neuroendocrine signaling, and reproductive-physiology research.',
    researchFocus: 'Oxytocin research covers its dual role as a neurotransmitter in social-behavior models and as a peripheral hormone involved in reproductive and lactation physiology.',
    variants: [{ dose: '10MG', price: 59, file: 'Oxytocin 10MG.png' }],
  },
  {
    name: 'PT-141',
    slug: 'pt-141',
    category: 'Sexual & Hormonal',
    badge: 'POPULAR',
    description: 'A melanocortin-receptor agonist studied for its central nervous system-mediated effects on sexual-response pathways.',
    researchFocus: 'Unlike vascular-acting compounds, PT-141 is studied for its activation of melanocortin receptors in the central nervous system, offering a distinct mechanism of action for arousal-pathway research.',
    variants: [{ dose: '10MG', price: 75, file: 'PT-141  10MG.png' }],
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    category: 'GLP-1 & Metabolic',
    badge: 'NEW',
    isBestSeller: true,
    description: 'A triple hormone receptor agonist (GLP-1/GIP/glucagon) designed for advanced metabolic-research applications.',
    researchFocus: 'Retatrutide is studied for its simultaneous activation of GLP-1, GIP, and glucagon receptors, a triple-agonist mechanism under active research for its combined effects on glycemic control and energy expenditure.',
    variants: [
      { dose: '10MG', price: 179, file: 'Retatrutide  10MG.png' },
      { dose: '20MG', price: 249, file: 'Retatrutide 20MG.png' },
      { dose: '30MG', price: 309, file: 'Retatrutide 30MG.png' },
      { dose: '60MG', price: 449, file: 'Retatrutide 60MG.png' },
    ],
  },
  {
    name: 'SS-31',
    slug: 'ss-31',
    category: 'Healing & Recovery',
    description: 'A mitochondria-targeted tetrapeptide studied for its role in protecting mitochondrial membrane integrity under oxidative stress.',
    researchFocus: 'SS-31 is studied for its selective binding to cardiolipin on the inner mitochondrial membrane, a mechanism explored for reducing oxidative damage and preserving ATP-synthesis efficiency.',
    variants: [
      { dose: '10MG', price: 89, file: 'SS-31 10MG.png' },
      { dose: '50MG', price: 259, file: 'SS-31  50MG.png' },
    ],
  },
  {
    name: 'Selank',
    slug: 'selank',
    category: 'Cognitive & Nootropic',
    description: 'A synthetic peptide analog of tuftsin studied for its anxiolytic and cognitive-modulating properties in neuroscience research.',
    researchFocus: 'Selank research focuses on its influence on BDNF expression and GABAergic/serotonergic signaling, mechanisms studied in models of stress-response regulation and cognitive performance.',
    variants: [{ dose: '10MG', price: 65, file: 'Selank  10MG.png' }],
  },
  {
    name: 'Semaglutide',
    slug: 'semaglutide',
    category: 'GLP-1 & Metabolic',
    badge: 'POPULAR',
    isBestSeller: true,
    description: 'A GLP-1 receptor agonist widely studied for glycemic regulation and metabolic research applications.',
    researchFocus: 'Semaglutide research centers on GLP-1 receptor activation and its downstream effects on insulin secretion, gastric emptying, and appetite-regulation pathways in metabolic models.',
    variants: [
      { dose: '5MG', price: 129, file: 'Semaglutide  5MG.png' },
      { dose: '10MG', price: 189, file: 'Semaglutide 10MG.png' },
      { dose: '20MG', price: 279, file: 'Semaglutide 20MG.png' },
      { dose: '30MG', price: 349, file: 'Semaglutide 30MG.png' },
    ],
  },
  {
    name: 'Semax',
    slug: 'semax',
    category: 'Cognitive & Nootropic',
    description: 'A synthetic ACTH(4-10) analog studied for its nootropic and neuroprotective activity in cognitive-research models.',
    researchFocus: 'Semax is studied for its upregulation of BDNF and its influence on dopaminergic and serotonergic systems, mechanisms of interest in cognitive-performance and neuroprotection research.',
    variants: [
      { dose: '10MG', price: 65, file: 'Semax 10MG.png' },
      { dose: '30MG', price: 149, file: 'Semax 30MG.png' },
    ],
  },
  {
    name: 'Semax / Selank Blend',
    slug: 'semax-selank-blend',
    category: 'Peptide Bundles',
    description: 'A combined-vial nootropic formulation pairing Semax and Selank for comparative cognitive and stress-response research.',
    researchFocus: 'This blend is used to study the combined neuroprotective and anxiolytic mechanisms of two structurally distinct ACTH/tuftsin-derived peptides within a single research protocol.',
    variants: [{ dose: '10MG/10MG', price: 119, file: 'Semax Selank 10MG 10MG.png' }],
  },
  {
    name: 'Sermorelin',
    slug: 'sermorelin',
    category: 'Growth Hormone Secretagogue',
    description: 'A GHRH(1-29) analog studied for its stimulation of endogenous growth hormone release from the pituitary.',
    researchFocus: 'Sermorelin represents the shortest active fragment of GHRH, and is used as a reference compound in research on pituitary GH-release dynamics and feedback regulation.',
    variants: [
      { dose: '10MG', price: 75, file: 'Sermorelin 10MG.png' },
      { dose: '20MG', price: 129, file: 'Sermorelin 20MG.png' },
    ],
  },
  {
    name: 'Snap-8',
    slug: 'snap-8',
    category: 'Cosmetic & Skin',
    description: 'An octapeptide studied for its inhibition of neurotransmitter release at neuromuscular junctions, relevant to dermal-research applications.',
    researchFocus: 'Snap-8 is studied for its interference with SNARE-complex formation, a mechanism examined in topical/dermal research models for its effect on localized muscle-contraction signaling.',
    variants: [
      { dose: '10MG', price: 55, file: 'Snap8 10MG.png' },
      { dose: '20MG', price: 95, file: 'Snap8 20MG.png' },
    ],
  },
  {
    name: 'TB-500',
    slug: 'tb-500',
    category: 'Healing & Recovery',
    isBestSeller: true,
    description: 'A synthetic fragment of Thymosin Beta-4 studied for its role in cellular migration, angiogenesis, and wound-model healing.',
    researchFocus: 'TB-500 research focuses on actin-regulation pathways involved in cell migration and its downstream effects on angiogenesis and collagen deposition during tissue-repair processes.',
    variants: [
      { dose: '5MG', price: 65, file: 'TB-500 5MG.png' },
      { dose: '10MG', price: 109, file: 'TB-500 10MG.png' },
    ],
  },
  {
    name: 'Tesamorelin / Ipamorelin Blend',
    slug: 'tesamorelin-ipamorelin-blend',
    category: 'Peptide Bundles',
    description: 'A combined-vial formulation pairing Tesamorelin with Ipamorelin for research into layered GHRH/ghrelin-receptor GH-axis stimulation.',
    researchFocus: 'This blend is used to study the combined effect of a stabilized GHRH analog (Tesamorelin) with a selective ghrelin-receptor agonist (Ipamorelin) on GH-pulse amplitude and frequency.',
    variants: [
      { dose: '6MG/3MG', price: 139, file: 'Tesa-IPA  6MG-3MG.png' },
      { dose: '13MG/3MG', price: 219, file: 'Tesa-IPA 13MG 3MG.png' },
    ],
  },
  {
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    category: 'Growth Hormone Secretagogue',
    description: 'A stabilized GHRH analog studied for its potent stimulation of endogenous growth hormone secretion.',
    researchFocus: 'Tesamorelin is one of the more extensively studied GHRH analogs, with research focused on its effect on IGF-1 levels and visceral-fat metabolism in metabolic and endocrine models.',
    variants: [
      { dose: '10MG', price: 99, file: 'Tesamorelin 10MG.png' },
      { dose: '20MG', price: 169, file: 'Tesamorelin 20MG.png' },
    ],
  },
  {
    name: 'Thymosin Alpha-1',
    slug: 'thymosin-alpha-1',
    category: 'Healing & Recovery',
    description: 'A thymic peptide studied for its immunomodulatory activity, particularly its influence on T-cell function.',
    researchFocus: 'Thymosin Alpha-1 research centers on its regulation of T-cell maturation and cytokine signaling, positioning it as a key reference compound in immune-modulation studies.',
    variants: [{ dose: '10MG', price: 89, file: 'Thymosin Alpha-1 10MG.png' }],
  },
  {
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    category: 'GLP-1 & Metabolic',
    isBestSeller: true,
    description: 'A dual GIP/GLP-1 receptor agonist researched for its combined incretin-signaling effects in metabolic research.',
    researchFocus: 'Tirzepatide is studied for its unimolecular dual-agonist activity at both GIP and GLP-1 receptors, a mechanism of substantial interest in comparative metabolic and glycemic-control research.',
    variants: [
      { dose: '10MG', price: 199, file: 'Tirzepatide 10MG.png' },
      { dose: '20MG', price: 279, file: 'Tirzepatide 20MG.png' },
      { dose: '30MG', price: 339, file: 'Tirzepatide 30MG.png' },
      { dose: '60MG', price: 469, file: 'Tirzepatide 60MG.png' },
    ],
  },
  {
    name: 'VIP',
    slug: 'vip',
    category: 'Healing & Recovery',
    description: 'Vasoactive Intestinal Peptide, studied for its broad anti-inflammatory and immunoregulatory signaling across multiple tissue systems.',
    researchFocus: 'VIP is studied for its interaction with VPAC receptors across the nervous, immune, and digestive systems, with research spanning neuroinflammation, mucosal immunity, and vascular-tone regulation models.',
    variants: [{ dose: '10MG', price: 79, file: 'VIP 10MG.png' }],
  },
]

const slugifyCat = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function run() {
  const payload = await getPayload({ config: configPromise })
  console.log('--- Removing old demo products ---')
  for (const slug of OLD_DEMO_SLUGS) {
    const found = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1 })
    if (found.docs.length > 0) {
      await payload.delete({ collection: 'products', id: found.docs[0].id })
      console.log(`  Deleted demo product: ${slug}`)
    }
  }

  console.log('\n--- Resolving categories ---')
  const categoryIdByName: Record<string, string | number> = {}
  const allCategoryNames = Array.from(new Set(PRODUCTS.map((p) => p.category)))
  for (const name of allCategoryNames) {
    const existing = await payload.find({ collection: 'categories', where: { name: { equals: name } }, limit: 1 })
    if (existing.docs.length > 0) {
      categoryIdByName[name] = existing.docs[0].id
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: { name, slug: slugifyCat(name), isVisible: true } as any,
      })
      categoryIdByName[name] = created.id
      console.log(`  Created missing category: ${name}`)
    }
  }

  console.log('\n--- Seeding real products ---')
  let created = 0
  let skipped = 0

  for (const p of PRODUCTS) {
    const existing = await payload.find({ collection: 'products', where: { slug: { equals: p.slug } }, limit: 1 })
    if (existing.docs.length > 0) {
      console.log(`  Already exists, skipping: ${p.slug}`)
      skipped++
      continue
    }

    console.log(`  Processing: ${p.name}`)

    const variantsData: any[] = []
    let firstImageId: string | number | null = null

    for (const v of p.variants) {
      const imgPath = path.join(IMG_DIR, v.file)
      let mediaId: string | number | null = null

      if (fs.existsSync(imgPath)) {
        const fileData = fs.readFileSync(imgPath)
        const mediaDoc = await payload.create({
          collection: 'media',
          data: { alt: `${p.name} ${v.dose}` },
          file: {
            data: fileData,
            mimetype: 'image/png',
            name: v.file,
            size: fileData.length,
          },
        })
        mediaId = mediaDoc.id
        if (!firstImageId) firstImageId = mediaId
      } else {
        console.warn(`    Image not found: ${imgPath}`)
      }

      const sku = `${p.slug}-${v.dose}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      variantsData.push({
        sku,
        isKit: p.category === 'Peptide Bundles',
        images: mediaId ? [{ image: mediaId }] : [],
        price: v.price,
        stock: 500,
        options: [{ key: 'Dose', value: v.dose }],
      })
    }

    const minPrice = Math.min(...p.variants.map((v) => v.price))
    const catId = categoryIdByName[p.category]

    await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: 'active',
        isVisible: true,
        isBestSeller: !!p.isBestSeller,
        price: minPrice,
        stock: 500,
        hasVariants: true,
        variants: variantsData,
        categories: [catId as any],
        images: firstImageId ? [{ image: firstImageId as any }] : [],
        badge: (p.badge || 'none') as any,
        doses: p.variants.map((v) => ({ value: v.dose })),
        productDetailsTitle: 'Product Details',
        productDetailsDescription: p.description,
        researchFocusTitle: 'Research Focus & Mechanism Overview',
        researchFocusDescription: p.researchFocus,
        qualityPurityTitle: 'Quality & Purity Standards',
        qualityPurityDescription: QUALITY_PURITY,
        complianceNoticeTitle: 'Compliance Notice',
        complianceNoticeDescription: COMPLIANCE_NOTICE,
      } as any,
    })

    console.log(`    Created: ${p.name} (${p.variants.length} dose${p.variants.length > 1 ? 's' : ''})`)
    created++
  }

  console.log(`\n--- Done: ${created} created, ${skipped} skipped ---`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
