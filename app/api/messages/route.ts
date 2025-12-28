import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const chat_id = searchParams.get('chat_id');

        if (!chat_id) {
            return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
        }

        const session = await auth0.getSession();
        const user = session?.user;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use Admin Client to bypass RLS
        const supabase = await createAdminClient();

        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // SECURITY: Verify user is participant
        const { data: chat, error: chatError } = await supabase
            .from('chats')
            .select('user_a, user_b, status, closure_requested_by')
            .eq('id', chat_id)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        if (chat.user_a !== user.sub && chat.user_b !== user.sub) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch messages
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat_id)
            .order('created_at', { ascending: true });

        if (msgError) {
            return NextResponse.json({ error: msgError.message }, { status: 500 });
        }

        return NextResponse.json({
            messages,
            chatStatus: chat.status,
            closureRequestedBy: chat.closure_requested_by
        });
    } catch (error: any) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
