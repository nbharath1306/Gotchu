import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
// ... imports
import { createAdminClient, createClient } from '@/lib/supabase-server';

// ...

export async function POST(req: NextRequest) {
  try {
    const { chat_id, content } = await req.json();
    if (!chat_id || typeof chat_id !== 'string' || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const session = await auth0.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Admin Client for reliable writes (bypassing Auth0 token RLS issues)
    const supabase = await createAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Sync user just in case
    await ensureUserExists(supabase, user);

    // SECURITY CHECK: Verify user is part of the chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user_a, user_b')
      .eq('id', chat_id)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.user_a !== user.sub && chat.user_b !== user.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('messages').insert({
      id: nanoid(),
      chat_id,
      sender_id: user.sub,
      content
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Message send error:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
