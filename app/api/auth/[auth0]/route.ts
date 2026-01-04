import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: Promise<{ auth0: string }> }) => {
    const { auth0: route } = await params;
    const client = (auth0 as any).authClient;

    try {
        switch (route) {
            case 'login':
                return await client.handleLogin(req);
            case 'logout':
                return await client.handleLogout(req);
            case 'callback':
                return await client.handleCallback(req);
            case 'me':
                return await client.handleProfile(req);
            default:
                return new NextResponse('Not Found', { status: 404 });
        }
    } catch (error: any) {
        console.error('Auth0 Error:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: error.status || 500 });
    }
};

