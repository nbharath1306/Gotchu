import { createClient } from "@/lib/supabase-server"
import { FeedClient } from "@/components/feed-client"
import { auth0 } from "@/lib/auth0"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  
  // Fetch items
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  // Get current user
  const session = await auth0.getSession()
  const user = session?.user

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="text-center py-12">
          <p className="text-red-500">Error loading feed. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Feed</h1>
          <p className="text-muted-foreground">
            See what's been lost and found around DSU Harohalli.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/report/lost">
            <Button className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              Report Lost
            </Button>
          </Link>
          <Link href="/report/found">
            <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20">
              <PlusCircle className="mr-2 h-4 w-4" />
              Report Found
            </Button>
          </Link>
        </div>
      </div>

      {/* Feed Content */}
      <FeedClient items={items || []} currentUserId={user?.sub} />
    </div>
  )
}
