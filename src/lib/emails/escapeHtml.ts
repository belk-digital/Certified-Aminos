/**
 * Escapes user-controlled text before interpolating it into an HTML email template.
 * Without this, a crafted name/address/message can inject markup (fake buttons, links,
 * tracking pixels) into an email that renders in a customer's or staff member's inbox.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
