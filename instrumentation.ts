import { registerOTel } from '@vercel/otel'

export function register() {
  registerOTel({
    serviceName: 'roosevelt-ops-metrics',
    // Grafana Cloud OTLP endpoint will be configured via environment variables
  })
}
