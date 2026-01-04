import { createClient } from "@/lib/supabase-server";
import { FeedClient } from "@/components/feed-client";
import { Item } from "@/types";
import { AlertCircle } from "lucide-react";


export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", "OPEN") // Hide resolved items
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
        <div className="text-center max-w-md mx-auto px-6 relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-display font-medium text-white mb-2 tracking-tight">SYSTEM FAILURE</h2>
          <p className="text-red-400/60 font-mono text-sm tracking-widest uppercase">
            UNABLE TO ESTABLISH UPLINK.
          </p>
        </div>
      </div>
    );
  }

  return <FeedClient items={(items as Item[]) || []} />;
}
