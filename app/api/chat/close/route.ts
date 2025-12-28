import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { auth0 } from '@/lib/auth0';

export async function POST(req: NextRequest) {
    try {
        const { chat_id } = await req.json();

        if (!chat_id) {
            return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
        }

        const session = await auth0.getSession();
        const user = session?.user;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use Admin Client
        const supabase = await createAdminClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Fetch current state
        const { data: chat, error: fetchError } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chat_id)
            .single();

        if (fetchError || !chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Verify participant
        if (chat.user_a !== user.sub && chat.user_b !== user.sub) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (chat.status === 'CLOSED') {
            return NextResponse.json({ success: true, status: 'CLOSED' });
        }

        // Logic: 
        // 1. If no closure requested, set closure_requested_by = ME
        // 2. If closure requested by ME, do nothing (waiting)
        // 3. If closure requested by OTHER, set status = CLOSED

        let updateData = {};

        if (!chat.closure_requested_by) {
            updateData = { closure_requested_by: user.sub };
        } else if (chat.closure_requested_by === user.sub) {
            // Already requested by me, do nothing
            return NextResponse.json({ success: true, status: 'OPEN', requested_by: user.sub });
        } else {
            // Requested by OTHER -> Confirm Closure
            updateData = { status: 'CLOSED' };
        }

        const { error: updateError } = await supabase
            .from('chats')
            .update(updateData)
            .eq('id', chat_id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, updated: true });

    } catch (e: any) {
        console.error("Chat close error:", e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
