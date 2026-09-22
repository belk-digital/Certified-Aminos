import { LLMS_FULL_TXT } from '@/data/llms/llmsFullTxt'
import { buildLlmsTxt, LLMS_RESPONSE_HEADERS } from '@/lib/llms/buildLlmsTxt'

export const revalidate = 3600

export async function GET() {
  return new Response(await buildLlmsTxt(LLMS_FULL_TXT), { headers: LLMS_RESPONSE_HEADERS })
}
