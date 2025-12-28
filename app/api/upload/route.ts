import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { auth0 } from '@/lib/auth0';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const session = await auth0.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
        }

        const supabase = await createAdminClient();
        if (!supabase) return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });

        // Generate path: chat-uploads/USER_ID/RANDOM_FILENAME
        const filename = `${session.user.sub}/${nanoid()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        // We need to convert File to ArrayBuffer for Supabase Admin upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to 'chat-images' bucket
        // Note: User must ensure this bucket exists and is public!
        const { data, error } = await supabase
            .storage
            .from('chat-images')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error("Storage upload error:", error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('chat-images')
            .getPublicUrl(filename);

        return NextResponse.json({ url: publicUrl });

    } catch (e) {
        console.error("Upload handler error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
