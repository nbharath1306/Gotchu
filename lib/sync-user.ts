import { auth0 } from "@/lib/auth0";
import { createClient } from "@/lib/supabase-server";

export async function syncUser() {
  const session = await auth0.getSession();
  
  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const supabase = await createClient();

  // Map Auth0 user data to our Supabase schema
  const userData = {
    id: user.sub,
    email: user.email,
    full_name: user.name || user.nickname || user.email,
    avatar_url: user.picture,
    updated_at: new Date().toISOString(),
  };

  // Upsert user into Supabase
  const { error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'id' });

  if (error) {
    console.error("Error syncing user to Supabase:", error);
  }

  return user;
}
