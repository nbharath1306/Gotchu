// import { KineticLanding } from "@/components/landing/kinetic-landing";
import { AuraHero } from "@/components/landing/aura-hero";
import { createClient } from "@/lib/supabase-server";
import { auth0 } from "@/lib/auth0";

// This is now a Server Component
export default async function Home() {
  const supabase = await createClient();
  const session = await auth0.getSession();

  // Fetch Real Stats (Parallel)
  const [
    { count: openCount },
    { count: resolvedCount },
    { count: usersCount }
  ] = await Promise.all([
    supabase.from("items").select("*", { count: "exact", head: true }).eq('status', 'OPEN'),
    supabase.from("items").select("*", { count: "exact", head: true }).eq('status', 'RESOLVED'),
    supabase.from("users").select("*", { count: "exact", head: true }),
  ]);

  // Construct Stats Object
  const stats = {
    activeReports: openCount || 0,
    recoveredCount: resolvedCount || 0,
    // avgResponse: "~12m", 
    totalUsers: usersCount || 0
  };

  return (
    <AuraHero stats={stats} session={session} />
  );
}
