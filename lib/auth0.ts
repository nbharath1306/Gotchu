import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Ensure we have a domain, even if only ISSUER_BASE_URL is provided
const domain = process.env.AUTH0_DOMAIN || 
  (process.env.AUTH0_ISSUER_BASE_URL 
    ? process.env.AUTH0_ISSUER_BASE_URL.replace('https://', '').replace('http://', '').split('/')[0] 
    : undefined);

export const auth0 = new Auth0Client({
  domain: domain,
  // Explicitly pass other vars to ensure they are picked up if available
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // Try standard var, then custom var, then hard fail
  secret: process.env.AUTH0_SECRET || process.env.GOTCHU_SECRET,
  appBaseUrl: process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL
});
