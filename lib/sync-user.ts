import { auth0 } from "@/lib/auth0";
import { createServiceRoleClient } from "@/lib/supabase-server";

export async function syncUser() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  // Use Service Role client to bypass RLS since we are the system
  const supabase = await createServiceRoleClient();

  if (!supabase) {
    console.error("Failed to create Supabase service client");
    return null;
  }

  // Map Auth0 user data to our Supabase schema
  const userData = {
    id: user.sub, // This is now TEXT (e.g. "auth0|...")
    email: user.email,
    full_name: user.name || user.nickname || user.email,
    avatar_url: user.picture,
  };

  // Upsert user into Supabase
  const { error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'id' });

  if (error) {
    console.error("Error syncing user to Supabase:", error.message);
    return null;
  }

  console.log("User synced successfully:", user.sub);
  return user;
}
