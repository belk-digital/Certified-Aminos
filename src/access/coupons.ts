

const isStaff = (req: any) => req?.user?.role === 'admin' || req?.user?.role === 'staff'

export const couponsAccess: any = {
  // Public read is needed so checkout can validate a typed-in code, but only staff should
  // ever see the raw collection (it otherwise leaks lockedEmails/remainingBalance/usage data).
  // Client-facing validation goes through the verifyCoupon server action instead, which
  // calls payload.find with overrideAccess: true and returns only the fields the UI needs.
  read: ({ req }: any) => isStaff(req),
  create: ({ req }: any) => isStaff(req),
  update: ({ req }: any) => isStaff(req),
  delete: ({ req }: any) => isStaff(req),
}
