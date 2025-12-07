import { createClient } from "@/lib/supabase-server"
import { FeedClient } from "@/components/feed-client"
import { auth0 } from "@/lib/auth0"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  const session = await auth0.getSession()
  const user = session?.user

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Feed</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Campus Feed
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Discover lost and found items around DSU Harohalli campus
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/report/lost">
              <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-xl shadow-red-500/20 transition-all duration-300 hover:scale-105">
                <AlertCircle className="mr-2 h-5 w-5" />
                Report Lost
              </Button>
            </Link>
            <Link href="/report/found">
              <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-xl shadow-green-500/20 transition-all duration-300 hover:scale-105">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Report Found
              </Button>
            </Link>
          </div>
        </div>

        {/* Feed Content */}
        <FeedClient items={items || []} currentUserId={user?.sub} />
      </div>
    </div>
  )
}
