export type IdAustriaMockEnvironment = {
  mockMode: boolean;
  nodeEnv?: string;
  vercelEnv?: string;
};

/**
 * Permit the simulated identity check in local development and Vercel Preview,
 * but never in a production deployment. Vercel sets NODE_ENV=production for
 * Preview builds too, so VERCEL_ENV must take precedence there.
 */
export function canUseIdAustriaMock(environment: IdAustriaMockEnvironment): boolean {
  if (!environment.mockMode) return false;
  if (environment.vercelEnv === "production") return false;
  if (environment.vercelEnv === "preview") return true;
  return environment.nodeEnv === "development" || environment.nodeEnv === "test";
}
