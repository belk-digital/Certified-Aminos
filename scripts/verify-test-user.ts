import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const email = process.argv[2]
if (!email) {
  console.error('Usage: tsx scripts/verify-test-user.ts <email>')
  process.exit(1)
}

async function run() {
  const payload = await getPayload({ config: configPromise })
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, overrideAccess: true })
  if (found.docs.length === 0) {
    console.log('No user found with that email.')
    process.exit(1)
  }
  const user = found.docs[0]
  await payload.update({ collection: 'users', id: user.id, data: { emailVerified: true }, overrideAccess: true })
  console.log(`Verified: ${email}`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
