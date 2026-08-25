import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  // Disabled: uses Node's inspector/debugger protocol to capture local variables on error,
  // which is known to corrupt stream internals (TransformStream/kState) on newer Node
  // versions like this project's Node 24 runtime — was causing
  // "controller[kState].transformAlgorithm is not a function" crashes.
  includeLocalVariables: false,
  enableLogs: true,
})
