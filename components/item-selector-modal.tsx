"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase"
import { Loader2, Search } from "lucide-react"

interface Item {
    id: string
    title: string
    type: string
    created_at: string
}

interface ItemSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (itemId: string) => void
    filterType: 'LOST' | 'FOUND'
    userId: string
}

export function ItemSelectorModal({ isOpen, onClose, onSelect, filterType, userId }: ItemSelectorModalProps) {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (isOpen && userId) {
            fetchItems()
        }
    }, [isOpen, userId])

    const fetchItems = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('items')
            .select('id, title, type, created_at')
            .eq('user_id', userId)
            .eq('type', filterType)
            .eq('status', 'OPEN')
            .order('created_at', { ascending: false })

        if (data) setItems(data)
        setLoading(false)
    }

    const filteredItems = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-black">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl uppercase tracking-tight">
                        Select your {filterType} Item
                    </DialogTitle>
                    <DialogDescription>
                        Link your report to verify this claim.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black transition-colors rounded-md text-sm font-mono"
                        placeholder="Search your items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-lg">
                            <p className="text-sm text-gray-500 font-mono mb-2">NO ITEMS FOUND</p>
                            <a href={`/report/${filterType.toLowerCase()}`} className="text-xs font-bold underline hover:text-[#FF4F4F]">
                                + CREATE {filterType} REPORT
                            </a>
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className="w-full text-left p-3 border border-gray-100 hover:border-black hover:bg-gray-50 transition-all rounded-md group"
                            >
                                <div className="font-bold text-sm group-hover:underline">{item.title}</div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
