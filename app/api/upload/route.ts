import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
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

        // Validation: Enforce max size (e.g. 50MB) but allow all types
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (Max 50MB)' }, { status: 400 });
        }

        const supabase = await createServiceRoleClient();
        if (!supabase) return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });

        // Generate path: chat-uploads/SANITIZED_USER_ID/RANDOM_FILENAME
        const fileExt = file.name.split('.').pop();
        // Sanitize User ID (replace | and other special chars with _)
        const sanitizedUserId = session.user.sub.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${sanitizedUserId}/${nanoid()}.${fileExt}`;

        // Convert to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Attempt Upload
        const { data, error } = await supabase
            .storage
            .from('chat-images')
            .upload(filename, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: false
            });

        if (error) {
            console.error("[UPLOAD ERROR] Supabase Storage Error:", JSON.stringify(error, null, 2));

            // Handle "Bucket not found" by trying to create it (Admin Only)
            if (error.message.includes("The resource was not found") || error.message.includes("Bucket not found")) {
                console.log("[UPLOAD] Attempting to create missing bucket 'chat-images'...");
                await supabase.storage.createBucket('chat-images', { public: true });

                // Retry Upload
                const retry = await supabase.storage.from('chat-images').upload(filename, buffer, {
                    contentType: file.type || 'application/octet-stream',
                    upsert: false
                });

                if (retry.error) {
                    console.error("[UPLOAD RETRY ERROR]", retry.error);
                    return NextResponse.json({ error: `Upload Retry Failed: ${retry.error.message}` }, { status: 500 });
                }
                // Success on retry
            } else {
                return NextResponse.json({ error: `Storage Error: ${error.message}` }, { status: 500 });
            }
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('chat-images')
            .getPublicUrl(filename);

        console.log("[UPLOAD SUCCESS] Public URL:", publicUrl);

        return NextResponse.json({ url: publicUrl });

    } catch (e: any) {
        console.error("[CRITICAL UPLOAD ERROR]:", e);
        return NextResponse.json({ error: `Server Error: ${e.message}` }, { status: 500 });
    }
}
