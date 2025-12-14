import { NextApiRequest, NextApiResponse } from 'next';
import { auth0 } from '@/lib/auth0';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { item_id } = req.body;
    if (!item_id || typeof item_id !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const session = await auth0.getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = session.user;
    const jwt = session.idToken || session.accessToken;
    const supabase = await createClient(jwt as string | undefined);
    // Fetch item to get owner
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', item_id)
      .single();
    if (itemError || !item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (item.user_id === user.sub) {
      return res.status(400).json({ error: 'Cannot start chat with yourself' });
    }
    // Check if chat already exists (both user_a/user_b combinations)
    const { data: existing, error: findError } = await supabase
      .from('chats')
      .select('id')
      .eq('item_id', item_id)
      .or(`and(user_a.eq."${user.sub}",user_b.eq."${item.user_id}"),and(user_a.eq."${item.user_id}",user_b.eq."${user.sub}")`)
      .maybeSingle();
    if (findError) {
      return res.status(500).json({ error: findError.message });
    }
    if (existing) {
      return res.status(200).json({ chatId: existing.id, created: false });
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
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ chatId: data.id, created: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
