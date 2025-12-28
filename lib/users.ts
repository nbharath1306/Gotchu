import { SupabaseClient } from "@supabase/supabase-js";
// import { Session } from "@auth0/nextjs-auth0";

/**
 * Ensures the Auth0 user exists in the public.users table.
 * This should be called before any operation that requires a foreign key to users.id.
 */
export async function ensureUserExists(supabase: SupabaseClient, user: any) {
    if (!user || !user.sub) {
        console.error("ensureUserExists: No user or user.sub provided", user);
        return false;
    }

    // 1. Check if user exists (Optimization: could use upsert directly if we trust the data)
    // We use upsert to handle both creation and updates (e.g. avatar/name changes)
    const { error } = await supabase
        .from('users')
        .upsert({
            id: user.sub,
            email: user.email,
            full_name: user.name || user.nickname || 'Unknown',
            avatar_url: user.picture,
        }, { onConflict: 'id' })

    if (error) {
        console.error("ensureUserExists: Failed to upsert user", error);
        return false;
    }

    return true;
}
