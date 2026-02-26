import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration({
      enableLongTask: true,
      enableInp: true,
    }),
  ],
  profilesSampleRate: 1.0,
  initialScope: {
    tags: {
      environment: process.env.NODE_ENV || 'development',
    },
  },
})
