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
        <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/item/${projectId}`}
                    className="inline-flex items-center text-sm font-mono text-[#666666] hover:text-black mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    BACK TO ITEM
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-[#111111] mb-4">
                        POTENTIAL MATCHES
                    </h1>
                    <p className="text-[#666666] max-w-2xl text-lg">
                        Based on your report for <span className="font-bold text-black">"{currentItem.title}"</span>,
                        we found these items that might be relevant.
                    </p>
                </div>

                {/* Matches Grid */}
                {!matches || matches.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-[#E5E5E5] bg-white">
                        <div className="w-16 h-16 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-[#666666]" />
                        </div>
                        <h3 className="text-xl font-bold font-display mb-2">NO MATCHES YET</h3>
                        <p className="text-[#666666] font-mono text-sm">
                            WE'LL NOTIFY YOU WHEN SOMETHING COMES UP.
                        </p>
                        <div className="mt-8">
                            <Link href="/feed" className="btn-primary px-8 py-3 text-sm">
                                BROWSE ALL ITEMS
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matches.map((match) => (
                            <div
                                key={match.id}
                                className="card-swiss p-6 bg-white flex flex-col h-full"
                            >
                                {match.image_url && (
                                    <div className="mb-4 aspect-video rounded-sm overflow-hidden bg-[#F2F2F2]">
                                        <img
                                            src={match.image_url}
                                            alt={match.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-[#111111] font-display leading-tight">
                                            {match.title}
                                        </h3>
                                        <span className="text-[10px] font-mono bg-[#F2F2F2] px-2 py-1 rounded">
                                            {match.location_zone}
                                        </span>
                                    </div>

                                    <p className="text-[#666666] text-sm mb-4 line-clamp-3">
                                        {match.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-mono text-[#999999] mb-6">
                                        <span>{formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}</span>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-[#E5E5E5] pt-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href={`/item/${match.id}`}
                                            className="flex items-center justify-center py-3 border border-[#E5E5E5] hover:bg-[#F2F2F2] transition-colors text-xs font-bold font-mono tracking-wider"
                                        >
                                            VIEW DETAILS
                                        </Link>
                                        <div className="w-full">
                                            <ContactButton itemId={match.id} />
                                        </div>
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
