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

        const supabase = await createAdminClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        // 1. Fetch Chat & Item Details
        const { data: chat, error: chatError } = await supabase
            .from('chats')
            .select('*, item:items(*)')
            .eq('id', chat_id)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Verify Participant
        if (chat.user_a !== user.sub && chat.user_b !== user.sub) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. LOGIC: Handle State Transitions

        // CASE A: Already Closed
        if (chat.status === 'CLOSED') {
            return NextResponse.json({ message: 'Chat already closed' });
        }

        // CASE B: First Request (Transition to PENDING)
        if (chat.status === 'OPEN' || !chat.closure_requested_by) {
            const { error: updateError } = await supabase
                .from('chats')
                .update({
                    status: 'PENDING_CLOSURE',
                    closure_requested_by: user.sub
                })
                .eq('id', chat_id);

            if (updateError) throw updateError;
            return NextResponse.json({ status: 'PENDING_CLOSURE', message: 'Closure requested' });
        }

        // CASE C: Confirmation (Second Request from OTHER user)
        if (chat.status === 'PENDING_CLOSURE') {
            // Prevent same user from confirming their own request (though UI hides it)
            if (chat.closure_requested_by === user.sub) {
                return NextResponse.json({ message: 'Waiting for other user to confirm' });
            }

            // --- RESOLUTION PROTOCOL ---

            // 1. Close Chat
            const { error: closeError } = await supabase
                .from('chats')
                .update({ status: 'CLOSED' })
                .eq('id', chat_id);

            if (closeError) throw closeError;

            // 2. Resolve Item
            if (chat.item_id) {
                await supabase
                    .from('items')
                    .update({ status: 'RESOLVED' })
                    .eq('id', chat.item_id);
            }

            // 3. KARMA AWARDING
            // Logic: Who is the "Finder"?
            // - If Item Type is LOST: The Reporter is the "Loser". The Other User is likely the "Finder".
            // - If Item Type is FOUND: The Reporter is the "Finder".

            let finderId = null;
            if (chat.item) {
                if (chat.item.type === 'FOUND') {
                    finderId = chat.item.reporter_id; // Reporter Found it
                } else if (chat.item.type === 'LOST') {
                    // Reporter Lost it. The person chatting with them (who ISN'T the reporter) found it.
                    // We need to find which user in the chat is NOT the reporter.
                    if (chat.user_a === chat.item.reporter_id) finderId = chat.user_b;
                    else finderId = chat.user_a;
                }
            }

            if (finderId) {
                // Call RPC to increment
                const { error: karmaError } = await supabase.rpc('increment_karma', {
                    user_ids: [finderId],
                    amount: 10
                });
                if (karmaError) console.error("Karma Error:", karmaError);
            }

            return NextResponse.json({ status: 'CLOSED', message: 'Chat closed and karma awarded' });
        }

        return NextResponse.json({ error: 'Invalid state' }, { status: 400 });

    } catch (error: any) {
        console.error("Close chat error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
