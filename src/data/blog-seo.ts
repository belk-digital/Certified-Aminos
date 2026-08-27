import { BLOG_SCHEMAS } from './blog-schemas';

export interface BlogSEOData {
  title: string
  description: string
  keywords: string[]
  schemas?: any[]
}

export const BLOG_SEO: Record<string, BlogSEOData> = {
  'glp-1-gip-agonists-semaglutide-tirzepatide-retatrutide-research': {
    title: 'Semaglutide vs. Tirzepatide vs. Retatrutide | Certified Aminos',
    description: 'An ultimate guide for researchers comparing the molecular mechanisms, half-lives, and metabolic protocols of GLP-1 and GIP agonists like Semaglutide and Retatrutide.',
    keywords: ['semaglutide research', 'tirzepatide protocol', 'retatrutide mechanism', 'GLP-1 agonist', 'GIP dual agonist', 'metabolic peptides', 'research weight loss peptides'],
    schemas: BLOG_SCHEMAS['glp-1-gip-agonists-semaglutide-tirzepatide-retatrutide-research'],
  },
  'tissue-repair-synergy-bpc-157-tb-500-ghk-cu': {
    title: 'BPC-157, TB-500, & GHK-Cu Tissue Repair Synergy | Certified Aminos',
    description: 'Explore the advanced synergistic protocols of BPC-157, TB-500, and GHK-Cu for angiogenesis, actin modulation, and cellular matrix repair in research models.',
    keywords: ['BPC-157 healing', 'TB-500 recovery protocol', 'GHK-Cu collagen', 'tissue repair peptides', 'angiogenesis research', 'peptide synergy', 'muscle recovery peptides'],
    schemas: BLOG_SCHEMAS['tissue-repair-synergy-bpc-157-tb-500-ghk-cu'],
  },
}
