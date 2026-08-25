/**
 * Payload category names are long, e.g. "Cosmetic & Skin Research Compounds".
 * On the frontend we only ever want the short form, e.g. "Cosmetic & Skin".
 * This must only affect display text — filter values, URL query params, and
 * `where` clauses must keep using the full Payload category name.
 */
export function getCategoryDisplayName(name?: string | null): string {
  if (!name) return ''
  const stripped = name.replace(/\s*Research\s+Compounds?\s*$/i, '').trim()
  return stripped || name
}
