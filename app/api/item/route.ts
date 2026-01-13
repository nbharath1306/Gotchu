import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
  }
  const supabase = await createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !item) {
    return NextResponse.json({ error: error?.message || 'Item not found' }, { status: 404 });
  }
  return NextResponse.json({ item });
}
