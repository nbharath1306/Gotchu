const auth0 = require('@auth0/nextjs-auth0/server');
console.log('Exports:', Object.keys(auth0));
if (auth0.Auth0Client) {
    const client = new auth0.Auth0Client({
        domain: 'test.auth0.com',
        clientId: 'test',
        clientSecret: 'test',
        appBaseUrl: 'http://localhost:3000'
    });
    console.log('Client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
}
