"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, Shield, User, Award } from "lucide-react";

// Minimal User Type for Table
interface AdminUser {
    id: string;
    email?: string;
    display_name?: string;
    avatar_url?: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
    karma_points: number;
    created_at: string;
}

interface AdminUserTableProps {
    initialUsers: AdminUser[];
}

export function AdminUserTable({ initialUsers }: AdminUserTableProps) {
    const [search, setSearch] = useState("");
    const users = initialUsers || [];

    const filteredUsers = users.filter((user) => {
        const term = search.toLowerCase();
        return (
            (user.email?.toLowerCase().includes(term)) ||
            (user.display_name?.toLowerCase().includes(term)) ||
            (user.id.toLowerCase().includes(term))
        );
    });

    return (
        <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Users by Name, Email, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">USER</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">ROLE</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">KARMA</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">JOINED</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#111111]">{user.display_name || "Anonymous"}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{user.email || user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'MODERATOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Award className={`w-4 h-4 ${user.karma_points > 50 ? 'text-amber-500' : 'text-gray-400'}`} />
                                            <span className="font-mono font-bold text-gray-700">{user.karma_points}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
