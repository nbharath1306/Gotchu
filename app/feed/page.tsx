import { createSupabaseServer } from "@/lib/supabase-server";
import { FeedClient } from "@/components/feed-client";
import { Item } from "@/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = createSupabaseServer();
  
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
    return (
      <div className="min-h-screen bg-[#09090b] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-zinc-500">Unable to load items. Please try again later.</p>
        </div>
      </div>
    );
  }

  return <FeedClient items={(items as Item[]) || []} />;
}
