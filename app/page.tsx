import { LandingPageClient } from "@/components/landing-client";
import { createClient } from "@/lib/supabase-server";

// This is now a Server Component
export default async function Home() {
  const supabase = await createClient();

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
    avgResponse: "~12m", // Hard to calculate without logs, keeping estimation for now
    totalUsers: usersCount || 0
  };

  return (
    <LandingPageClient stats={stats} />
  );
}
