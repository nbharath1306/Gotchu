import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase-server';
import { auth0 } from '@/lib/auth0';

export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    if (!item_id || typeof item_id !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const session = await auth0.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();
    // Fetch item to get owner
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', item_id)
      .single();
    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (item.user_id === user.sub) {
      return NextResponse.json({ error: 'Cannot start chat with yourself' }, { status: 400 });
    }
    // Check if chat already exists (both user_a/user_b combinations)
    const { data: existing, error: findError } = await supabase
      .from('chats')
      .select('id')
      .eq('item_id', item_id)
      .or(`and(user_a.eq."${user.sub}",user_b.eq."${item.user_id}"),and(user_a.eq."${item.user_id}",user_b.eq."${user.sub}")`)
      .maybeSingle();
    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ chatId: existing.id, created: false });
    }
    // Create chat
    const { data, error } = await supabase
      .from('chats')
      .insert({
        id: nanoid(),
        item_id,
        user_a: user.sub,
        user_b: item.user_id
      })
      .select('id')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ chatId: data.id, created: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
