import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase-server';
import { auth0 } from '@/lib/auth0';

export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    console.log('[start-chat] Input item_id:', item_id);
    if (!item_id || typeof item_id !== 'string') {
      console.log('[start-chat] Invalid input');
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const session = await auth0.getSession();
    const user = session?.user;
    if (!user) {
      console.log('[start-chat] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Pass Auth0 ID token to Supabase for RLS
    const jwt = session?.idToken || session?.accessToken;
    const supabase = await createClient(jwt);
    // Fetch item to get owner
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', item_id)
      .single();
    console.log('[start-chat] Item fetch:', { item, itemError });
    if (itemError || !item) {
      console.log('[start-chat] Item not found');
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (item.user_id === user.sub) {
      console.log('[start-chat] Cannot start chat with yourself');
      return NextResponse.json({ error: 'Cannot start chat with yourself' }, { status: 400 });
    }
    // Check if chat already exists (both user_a/user_b combinations)
    const { data: existing, error: findError } = await supabase
      .from('chats')
      .select('id')
      .eq('item_id', item_id)
      .or(`and(user_a.eq."${user.sub}",user_b.eq."${item.user_id}"),and(user_a.eq."${item.user_id}",user_b.eq."${user.sub}")`)
      .maybeSingle();
    console.log('[start-chat] Existing chat:', { existing, findError });
    if (findError) {
      console.log('[start-chat] Find error:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }
    if (existing) {
      console.log('[start-chat] Chat already exists:', existing.id);
      return NextResponse.json({ chatId: existing.id, created: false });
    }
    // Create chat
    const newId = nanoid();
    const { data, error } = await supabase
      .from('chats')
      .insert({
        id: newId,
        item_id,
        user_a: user.sub,
        user_b: item.user_id
      })
      .select('id')
      .single();
    console.log('[start-chat] Chat insert:', { data, error });
    if (error) {
      console.log('[start-chat] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log('[start-chat] Chat created:', data.id);
    return NextResponse.json({ chatId: data.id, created: true });
  } catch (e) {
    console.log('[start-chat] Server error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
