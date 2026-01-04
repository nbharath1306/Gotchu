const auth0 = require('@auth0/nextjs-auth0/server');
if (auth0.Auth0Client) {
    const client = new auth0.Auth0Client({
        domain: 'test.auth0.com',
        clientId: 'test',
        clientSecret: 'test',
        appBaseUrl: 'http://localhost:3000'
    });
    console.log('Client keys:', Object.keys(client));
    console.log('Client proto names:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
}
