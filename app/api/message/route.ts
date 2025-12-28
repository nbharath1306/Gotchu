import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase-server';
import { auth0 } from '@/lib/auth0';
import { ensureUserExists } from '@/lib/users';

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
    const supabase = await createClient();

    // Sync user just in case
    await ensureUserExists(supabase, user);

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
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
