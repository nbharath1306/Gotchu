import { createSupabaseServer } from "@/lib/supabase-server";
import { FeedClient } from "@/components/feed-client";
import { Item } from "@/types";
import { AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-[#F2F2F2] pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-display font-bold text-[#111111] mb-2">SYSTEM ERROR</h2>
          <p className="text-[#666666] font-mono text-sm">
            UNABLE TO RETRIEVE DATABASE RECORDS. REFRESH REQUIRED.
          </p>
        </div>
      </div>
    );
  }

  return <FeedClient items={(items as Item[]) || []} />;
}
