import { LLMS_TXT } from '@/data/llms/llmsTxt'
import { buildLlmsTxt, LLMS_RESPONSE_HEADERS } from '@/lib/llms/buildLlmsTxt'

export const revalidate = 3600

export async function GET() {
  return new Response(await buildLlmsTxt(LLMS_TXT), { headers: LLMS_RESPONSE_HEADERS })
}
