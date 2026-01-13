"use client";

import { useState } from "react";
import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ExternalLink, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { deleteItem } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminItemTableProps {
    initialItems: Item[];
}

export function AdminItemTable({ initialItems }: AdminItemTableProps) {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>(initialItems);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL"); // ALL, LOST, FOUND, RESOLVED
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase()) ||
            item.id.includes(search);
        const matchesFilter =
            filter === "ALL"
                ? true
                : filter === "RESOLVED"
                    ? item.status === "RESOLVED"
                    : item.type === filter && item.status !== "RESOLVED";

        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (id: string) => {
        if (!window.confirm("Admin Action: Permanently delete this item?")) return;

        setDeletingId(id);
        const res = await deleteItem(id);

        if (res.success) {
            toast.success("Item deleted from database.");
            setItems((prev) => prev.filter((i) => i.id !== id));
            router.refresh(); // Refresh server stats
        } else {
            toast.error(res.error || "Failed to delete item.");
        }
        setDeletingId(null);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ID, Title, Description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {["ALL", "LOST", "FOUND", "RESOLVED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all whitespace-nowrap ${filter === f
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">ITEM</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">STATUS</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">ZONE</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">DATE</th>
                                <th className="px-6 py-4 font-mono text-xs text-gray-500 font-medium text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                {item.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                                )}
                                            </div>
                                            <div className="max-w-[200px]">
                                                <div className="font-bold text-[#111111] truncate">{item.title}</div>
                                                <div className="text-[10px] text-gray-400 font-mono truncate">{item.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${item.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                            item.type === 'LOST' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {item.status === 'RESOLVED' ? 'RESOLVED' : item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                                            <MapPin className="w-3 h-3" />
                                            {item.location_zone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/item?id=${item.id}`}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                                title="View Public Page"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                                title="Admin Delete"
                                            >
                                                {deletingId === item.id ? (
                                                    <span className="w-4 h-4 block animate-spin border-2 border-red-500 border-t-transparent rounded-full" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No items found matching filter.
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
