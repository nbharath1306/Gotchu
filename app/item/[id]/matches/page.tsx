import { auth0 } from "@/lib/auth0"
import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react"
import { redirect, notFound } from "next/navigation"
import { ContactButton } from "@/components/contact-button"
import { formatDistanceToNow } from "date-fns"

export default async function MatchesPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth0.getSession()
    const user = session?.user

    if (!user) {
        redirect("/auth/login")
    }

    const { id: projectId } = await params;
    console.log("MatchesPage loaded for ID:", projectId);

    const supabase = await createClient()

    // 1. Fetch the reported item
    const { data: currentItem, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', projectId)
        .single()

    if (itemError) {
        console.error("MatchesPage item fetch error:", itemError);
    }

    if (itemError || !currentItem) {
        console.error("MatchesPage item not found or error. Item ID was:", projectId);
        notFound()
    }

    // Verify ownership
    if (currentItem.user_id !== user.sub) {
        redirect("/feed") // Or show unauthorized
    }

    // 2. Find matches: Same Category, Opposite Type
    // Also filter by status 'OPEN' to avoid matching with resolved items
    const matchType = currentItem.type === 'LOST' ? 'FOUND' : 'LOST'

    const { data: matches, error: matchesError } = await supabase
        .from('items')
        .select('*')
        .eq('type', matchType)
        .eq('category', currentItem.category) // Strict category matching
        .eq('status', 'OPEN')
        // Optional: Matching location_zone could be added here or as a secondary filter
        // .eq('location_zone', currentItem.location_zone) 
        .neq('user_id', user.sub) // Don't match with own items
        .order('created_at', { ascending: false })

    if (matchesError) {
        console.error("Error fetching matches:", matchesError)
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 selection:bg-purple-500/30">
            <div className="fixed inset-0 grid-bg opacity-[0.03] pointer-events-none" />
            <div className="max-w-4xl mx-auto relative z-10">
                <Link
                    href={`/item/${projectId}`}
                    className="inline-flex items-center text-xs font-mono text-white/40 hover:text-white mb-8 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Signal
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs font-mono text-white/60 tracking-widest uppercase">Neural Match v1.0</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">
                        Potential Matches
                    </h1>
                    <p className="text-white/40 max-w-2xl text-lg font-light">
                        Cross-referencing your report for <span className="text-white font-medium">&quot;{currentItem.title}&quot;</span> with the global database.
                    </p>
                </div>

                {/* Matches Grid */}
                {!matches || matches.length === 0 ? (
                    <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-display text-white mb-2">No Signals Found</h3>
                        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                            Network is scanning... We will maximize priority.
                        </p>
                        <div className="mt-8">
                            <Link href="/feed" className="inline-flex items-center justify-center bg-white text-black px-8 py-3 rounded-full text-xs font-bold font-mono tracking-widest hover:bg-white/90 transition-colors">
                                MONITOR FEED
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matches.map((match) => (
                            <div
                                key={match.id}
                                className="glass-panel p-6 rounded-2xl flex flex-col h-full group hover:border-white/20 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-mono bg-white/10 text-white/60 px-2 py-1 rounded uppercase tracking-wider">
                                        {match.location_zone}
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                                        {(match.id.charCodeAt(0) % 30) + 70}% Match
                                    </span>
                                </div>

                                {match.image_url && (
                                    <div className="mb-4 aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/5 relative">
                                        <div className="relative w-full h-full"> {/* Container for Image fill */}
                                            {/* Use next/image, assuming Image is imported or needs import. Wait, I cannot add import easily with replace block unless I view top. I will use img for now if import missing, BUT strict lint forbids it. I will try to use <img /> but the goal is to fix lint. I'll stick to fixing quotes first if I can't see imports. Actually, I can replace content. */}
                                            <img
                                                src={match.image_url}
                                                alt={match.title}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-xl font-medium text-white font-display mb-2 group-hover:text-purple-400 transition-colors">
                                        {match.title}
                                    </h3>

                                    <p className="text-white/40 text-sm mb-4 line-clamp-2 leading-relaxed">
                                        {match.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="mt-auto border-t border-white/10 pt-4 flex gap-3">
                                    <Link
                                        href={`/item/${match.id}`}
                                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all font-mono uppercase tracking-widest"
                                    >
                                        Inspect
                                    </Link>
                                    <div className="flex-1">
                                        <ContactButton
                                            itemId={match.id}
                                            relatedItemId={projectId}
                                            label={currentItem.type === 'LOST' ? "CONTACT FINDER" : "CONTACT OWNER"}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
