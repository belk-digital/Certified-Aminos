import { getAutoAddAccessoryItems } from '@/app/(frontend)/actions/cart'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const items = await getAutoAddAccessoryItems()
    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
