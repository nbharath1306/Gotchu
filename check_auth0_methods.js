const auth0 = require('@auth0/nextjs-auth0/server');
if (auth0.Auth0Client) {
    const client = new auth0.Auth0Client({
        domain: 'test.auth0.com',
        clientId: 'test',
        clientSecret: 'test',
        appBaseUrl: 'http://localhost:3000'
    });
    console.log('Has handleAuth?', !!client.handleAuth);
    console.log('Has handleLogin?', !!client.handleLogin);
    console.log('Has handleCallback?', !!client.handleCallback);
    console.log('Prototype chain:', getProtoChain(client));
}

function getProtoChain(obj) {
    const chain = [];
    let proto = Object.getPrototypeOf(obj);
    while (proto) {
        chain.push(Object.getOwnPropertyNames(proto));
        proto = Object.getPrototypeOf(proto);
    }
    return chain;
}
