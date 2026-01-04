import { Auth0Client } from '@auth0/nextjs-auth0/server';

if (!process.env.AUTH0_SECRET) {
  console.error("CRITICAL: AUTH0_SECRET is missing in runtime environment!");
} else {
  console.log("AUTH0_SECRET is present (length: " + process.env.AUTH0_SECRET.length + ")");
}

export const auth0 = new Auth0Client({
  // Map standard Auth0 env vars to what Auth0Client expects
  domain: process.env.AUTH0_ISSUER_BASE_URL,
  appBaseUrl: process.env.AUTH0_BASE_URL,

  authorizationParameters: {
    scope: 'openid profile email',
  },
  signInReturnToPath: '/',
  noContentProfileResponseWhenUnauthenticated: true,
  routes: {
    callback: '/auth/callback',
    login: '/auth/login',
    logout: '/auth/logout'
  },
  session: {
    rolling: true,
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days
    inactivityDuration: 60 * 60 * 24, // 1 day
    cookie: {
      transient: false,
      sameSite: 'lax'
    }
  }
});
