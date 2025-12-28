import { createAdminClient, createClient } from "@/lib/supabase-server";
import { getSession } from "@auth0/nextjs-auth0";
import { Shield, Users, Package, MessageSquare } from "lucide-react";

export default async function AdminDashboard() {
    const session = await getSession();
    const user = session?.user;

    // Use Admin Client to fetch global stats (bypass RLS)
    const supabase = (await createAdminClient()) || (await createClient());

    // Parallel Fetching
    const [
        { count: totalItems },
        { count: openItems },
        { count: resolvedItems },
        { count: totalUsers },
        { count: totalChats }
    ] = await Promise.all([
        supabase.from("items").select("*", { count: "exact", head: true }),
        supabase.from("items").select("*", { count: "exact", head: true }).eq('status', 'OPEN'),
        supabase.from("items").select("*", { count: "exact", head: true }).eq('status', 'RESOLVED'),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("chats").select("*", { count: "exact", head: true }),
    ]);

    return (
        <div className="p-8 max-w-7xl mx-auto pt-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-[#111111] mb-2">Command Center</h1>
                    <p className="text-[#666666]">System Overview & Moderation</p>
                </div>
                <div className="px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-xs font-mono flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    SYSTEM ONLINE
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <StatsCard icon={Package} label="Total Items" value={totalItems || 0} sub={`${openItems} Active`} />
                <StatsCard icon={Shield} label="Resolved" value={resolvedItems || 0} sub="Success Stories" />
                <StatsCard icon={Users} label="Users" value={totalUsers || 0} />
                <StatsCard icon={MessageSquare} label="Chats" value={totalChats || 0} />
            </div>

            {/* Action Sections Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-swiss bg-white p-6 min-h-[400px]">
                    <h3 className="label-caps mb-4">ITEM MODERATION</h3>
                    <div className="flex items-center justify-center h-full text-[#999999] text-sm">
                        Item Table Loading...
                    </div>
                </div>
                <div className="card-swiss bg-white p-6 min-h-[400px]">
                    <h3 className="label-caps mb-4">USER MANAGEMENT</h3>
                    <div className="flex items-center justify-center h-full text-[#999999] text-sm">
                        User List Loading...
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ icon: Icon, label, value, sub }: { icon: any, label: string, value: number, sub?: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#F2F2F2] rounded-lg text-[#111111]">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-3xl font-bold text-[#111111] tabular-nums">{value}</span>
            </div>
            <div>
                <div className="text-xs font-bold text-[#666666] tracking-wider uppercase">{label}</div>
                {sub && <div className="text-[10px] text-[#999999] font-mono mt-1">{sub}</div>}
            </div>
        </div>
    )
}
