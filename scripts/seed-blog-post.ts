import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const HERO_IMAGE = path.join(process.cwd(), 'public', 'HelixBio Images', 'featured-research-2.webp')
const AUTHOR_IMAGE = path.join(process.cwd(), 'public', 'HelixBio Images', 'featured-research-1.webp')

function textNode(text: string, format = 0) {
  return { type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 }
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [textNode(text)],
    direction: 'ltr',
  }
}

function heading(tag: 'h2' | 'h3', text: string) {
  return {
    type: 'heading',
    tag,
    format: '',
    indent: 0,
    version: 1,
    children: [textNode(text)],
    direction: 'ltr',
  }
}

function bulletList(items: string[]) {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: items.map((item) => ({
      type: 'listitem',
      value: 1,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [textNode(item)],
    })),
  }
}

function quote(text: string) {
  return {
    type: 'quote',
    format: '',
    indent: 0,
    version: 1,
    children: [textNode(text)],
    direction: 'ltr',
  }
}

function tableCell(text: string, isHeader: boolean) {
  return {
    type: 'tablecell',
    format: '',
    indent: 0,
    version: 1,
    headerState: isHeader ? 1 : 0,
    colSpan: 1,
    rowSpan: 1,
    backgroundColor: null,
    children: [paragraph(text)],
    direction: 'ltr',
  }
}

function tableRow(cells: string[], isHeader = false) {
  return {
    type: 'tablerow',
    format: '',
    indent: 0,
    version: 1,
    children: cells.map((c) => tableCell(c, isHeader)),
    direction: 'ltr',
  }
}

function table(headers: string[], rows: string[][]) {
  return {
    type: 'table',
    format: '',
    indent: 0,
    version: 1,
    children: [tableRow(headers, true), ...rows.map((r) => tableRow(r))],
    direction: 'ltr',
  }
}

function calloutBox(style: 'info' | 'tip' | 'warning', text: string) {
  return {
    type: 'block',
    format: '',
    version: 2,
    fields: {
      id: Math.random().toString(36).slice(2, 10),
      blockName: '',
      blockType: 'calloutBox',
      style,
      text,
    },
  }
}

const content = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      paragraph(
        'BPC-157 is among the most widely studied synthetic peptides in preclinical recovery research, prized for its reported effects on tissue repair, gut integrity, and inflammatory signaling. This overview summarizes the current body of research and the mechanisms most frequently cited in the literature.',
      ),
      heading('h2', 'What the research indicates'),
      paragraph(
        'Preclinical models suggest BPC-157 may support angiogenesis, modulate nitric oxide pathways, and accelerate healing across tendon, ligament, and gastrointestinal tissue. Its stability across a wide pH range has made it a common candidate in gut-healing and musculoskeletal recovery studies.',
      ),
      quote(
        'Across rodent models, BPC-157 administration was associated with measurably faster recovery timelines in soft-tissue injury protocols compared to controls.',
      ),
      heading('h3', 'Proposed mechanisms of action'),
      bulletList([
        'Upregulation of growth hormone receptor expression in tendon fibroblasts',
        'Modulation of the nitric oxide (NO) system to support vascular repair',
        'Protective effects on gastric mucosa observed in gut-injury models',
        'Reported interaction with the VEGFR2 pathway supporting angiogenesis',
      ]),
      calloutBox(
        'tip',
        'Always cross-reference handling protocols with the certificate of analysis (COA) shipped with each batch — stability data can vary by lot.',
      ),
      heading('h2', 'Stability by storage condition'),
      table(
        ['Storage condition', 'Form', 'Typical stability window'],
        [
          ['Frozen (-20°C)', 'Lyophilized', '24+ months'],
          ['Refrigerated (2–8°C)', 'Reconstituted', '2–4 weeks'],
          ['Room temperature', 'Reconstituted', 'Not recommended'],
        ],
      ),
      calloutBox(
        'warning',
        'This peptide is distributed strictly for in-vitro laboratory research and is not for human or animal consumption.',
      ),
      heading('h2', 'Handling and storage considerations'),
      paragraph(
        'Reconstituted peptide solutions are generally stored refrigerated and used within the timeframe validated by supplier stability data. Researchers should always defer to their institution’s handling protocols and the certificate of analysis (COA) provided with each batch.',
      ),
      paragraph(
        'As with all research compounds distributed by Helix Bio, this peptide is intended strictly for in-vitro laboratory research and is not for human or animal consumption.',
      ),
    ],
  },
}

async function seed() {
  const payload = await getPayload({ config: configPromise })

  // 1. Author profile global
  const authorImageData = fs.readFileSync(AUTHOR_IMAGE)
  const { docs: existingAuthorPhotos } = await payload.find({
    collection: 'blog-media',
    where: { alt: { equals: 'Helix Bio Team' } },
    limit: 1,
  })
  const authorPhoto =
    existingAuthorPhotos[0] ||
    (await payload.create({
      collection: 'blog-media',
      data: { alt: 'Helix Bio Team' },
      file: {
        data: authorImageData,
        mimetype: 'image/webp',
        name: 'helix-bio-team.webp',
        size: authorImageData.length,
      },
    }))

  await payload.updateGlobal({
    slug: 'blog-author-profile',
    data: {
      name: 'Helix Bio Team',
      title: 'Research & Product Team',
      bio: 'Our in-house team tracks published peptide research and translates it into clear, source-cited summaries for the research community.',
      credentials: 'Reviewed by in-house research chemists',
      photo: authorPhoto.id,
      socialLinks: [
        { platform: 'X', url: 'https://x.com/helixbio' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/helixbio' },
      ],
    },
  })
  console.log('Updated blog-author-profile global')

  // 2. Author user (required relationship)
  const { docs: users } = await payload.find({ collection: 'users', limit: 1 })
  if (users.length === 0) {
    throw new Error('No users found — create at least one user before seeding a blog post.')
  }
  const authorUser = users[0]

  // 3. Featured image
  const heroImageData = fs.readFileSync(HERO_IMAGE)
  const { docs: existingHero } = await payload.find({
    collection: 'blog-media',
    where: { alt: { equals: 'BPC-157 research vials' } },
    limit: 1,
  })
  const featuredImage =
    existingHero[0] ||
    (await payload.create({
      collection: 'blog-media',
      data: { alt: 'BPC-157 research vials' },
      file: {
        data: heroImageData,
        mimetype: 'image/webp',
        name: 'bpc-157-research.webp',
        size: heroImageData.length,
      },
    }))

  // 4. Sample product to cross-sell (optional, best-effort)
  const { docs: sampleProducts } = await payload.find({ collection: 'products', limit: 3 })

  const slug = 'bpc-157-recovery-research-overview'
  const { docs: existingPosts } = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const postData = {
    title: 'BPC-157 Recovery Research: What the Current Evidence Shows',
    slug,
    author: authorUser.id,
    featuredImage: featuredImage.id,
    excerpt:
      'A source-cited overview of BPC-157 preclinical recovery research, covering proposed mechanisms, tissue-repair findings, and proper research-grade handling.',
    content,
    publishedAt: new Date().toISOString(),
    status: 'published' as const,
    category: 'Recovery protocols' as const,
    relatedProducts: sampleProducts.map((p) => p.id),
    readTime: '',
    keyTakeaways: [
      { text: 'BPC-157 is studied preclinically for tissue repair, gut integrity, and inflammatory modulation.' },
      { text: 'Proposed mechanisms include nitric oxide modulation and VEGFR2-linked angiogenesis support.' },
      { text: 'Findings are limited to preclinical/animal models — human clinical data remains limited.' },
      { text: 'For research use only; always follow institutional handling and storage protocols.' },
    ],
    faqs: [
      {
        question: 'Is BPC-157 approved for human use?',
        answer:
          'No. BPC-157 is not FDA-approved and is sold strictly for laboratory research purposes, not for human or animal consumption.',
      },
      {
        question: 'What models have been used to study BPC-157?',
        answer:
          'Most published findings come from rodent models examining tendon, ligament, and gastrointestinal tissue repair.',
      },
      {
        question: 'How should research peptides be stored?',
        answer:
          'Lyophilized peptides are typically stored frozen, while reconstituted solutions are refrigerated and used within the window validated by the supplier COA.',
      },
    ],
    references: [
      {
        citationText: 'Sikiric et al., 2018, Current Pharmaceutical Design — "Stable Gastric Pentadecapeptide BPC 157"',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29788864/',
      },
      {
        citationText: 'Chang et al., 2011, Journal of Applied Physiology — tendon fibroblast study',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21836044/',
      },
    ],
    focusKeyphrase: 'BPC-157 research',
    keywords: 'BPC-157, peptide recovery research, tissue repair peptide, research peptides',
  }

  if (existingPosts.length > 0) {
    await payload.update({ collection: 'blog-posts', id: existingPosts[0].id, data: postData })
    console.log(`Updated existing blog post: ${slug}`)
  } else {
    await payload.create({ collection: 'blog-posts', data: postData })
    console.log(`Created blog post: ${slug}`)
  }

  console.log(`\nView it at: /${slug}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
