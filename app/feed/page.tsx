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
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to load feed</h2>
          <p className="text-slate-500">
            We encountered an issue while fetching the latest items. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return <FeedClient items={(items as Item[]) || []} />;
}
