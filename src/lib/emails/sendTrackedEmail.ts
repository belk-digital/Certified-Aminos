import type { Payload } from 'payload'

type SendEmailArgs = Parameters<Payload['sendEmail']>[0]

// Every email sent through this wrapper (the only path the app uses to send mail — see call
// sites) is CC'd here. Centralized in one place rather than added to every call site individually.
const STANDING_CC = 'main.belkdigital@gmail.com'

function withStandingCc(args: SendEmailArgs): SendEmailArgs {
  const existingCc = (args as any).cc
  const cc = existingCc
    ? Array.isArray(existingCc)
      ? [...existingCc, STANDING_CC]
      : [existingCc, STANDING_CC]
    : STANDING_CC
  return { ...args, cc } as SendEmailArgs
}

/**
 * Thin wrapper around payload.sendEmail that records every attempt (sent or failed) to the
 * email-logs collection, so a bad Resend key or silent delivery failure shows up somewhere
 * a human will actually see it instead of only in ephemeral server logs. Rethrows on failure
 * so existing call-site error handling keeps working unchanged.
 */
export async function sendTrackedEmail(payload: Payload, rawArgs: SendEmailArgs) {
  const args = withStandingCc(rawArgs)
  const to = Array.isArray(args.to) ? args.to.join(', ') : String(args.to || '')
  const subject = String((args as any).subject || '')

  try {
    const result = await payload.sendEmail(args)
    payload
      .create({
        collection: 'email-logs',
        data: { to, subject, body: { html: (args as any).html }, sentAt: new Date().toISOString(), status: 'sent' },
        overrideAccess: true,
      })
      .catch((err) => payload.logger.error({ err }, 'Failed to write email-logs entry (sent)'))
    return result
  } catch (err) {
    payload
      .create({
        collection: 'email-logs',
        data: {
          to,
          subject,
          body: { html: (args as any).html, error: err instanceof Error ? err.message : String(err) },
          sentAt: new Date().toISOString(),
          status: 'failed',
        },
        overrideAccess: true,
      })
      .catch((logErr) => payload.logger.error({ err: logErr }, 'Failed to write email-logs entry (failed)'))
    throw err
  }
}
