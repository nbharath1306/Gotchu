import { createServiceRoleClient, createClient } from "@/lib/supabase-server";
import { auth0 } from "@/lib/auth0";
import { Shield, Users, Package, MessageSquare } from "lucide-react";
import { AdminItemTable } from "@/components/admin-item-table";
import { AdminUserTable } from "@/components/admin-user-table";

export default async function AdminDashboard() {
    const session = await auth0.getSession();
    const user = session?.user;

    // Use Admin Client to fetch global stats (bypass RLS)
    const supabase = (await createServiceRoleClient()) || (await createClient());

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

    // Fetch Items & Users
    const [itemsRes, usersRes] = await Promise.all([
        supabase.from("items").select("*").order('created_at', { ascending: false }).limit(100),
        supabase.from("users").select("*").order('created_at', { ascending: false }).limit(100)
    ]);

    const items = itemsRes.data || [];
    const users = usersRes.data || [];

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

            {/* Item Moderation and User Management Grid */}
            <div className="grid grid-cols-1 gap-12 mb-12">
                {/* Item Table */}
                <div className="card-swiss bg-white p-6">
                    <h3 className="label-caps mb-6">ITEM DATABASE</h3>
                    <AdminItemTable initialItems={items} />
                </div>

                {/* User Table */}
                <div className="card-swiss bg-white p-6">
                    <h3 className="label-caps mb-6">USER REGISTRY</h3>
                    <AdminUserTable initialUsers={users} />
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
