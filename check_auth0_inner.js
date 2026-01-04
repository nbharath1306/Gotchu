const auth0 = require('@auth0/nextjs-auth0/server');
if (auth0.Auth0Client) {
    const client = new auth0.Auth0Client({
        domain: 'test.auth0.com',
        clientId: 'test',
        clientSecret: 'test',
        appBaseUrl: 'http://localhost:3000'
    });
    const inner = client.authClient;
    if (inner) {
        console.log('Inner Keys:', Object.keys(inner));
        console.log('Inner Proto:', Object.getOwnPropertyNames(Object.getPrototypeOf(inner)));
    } else {
        console.log('No authClient property');
    }
}
