import { createClient } from "@/lib/supabase-server"
import { ItemCard } from "@/components/item-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth0 } from "@/lib/auth0";

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  
  // Fetch items
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  // Get current user for "Manage" vs "Contact" logic
  const session = await auth0.getSession();
  const user = session?.user;

  if (error) {
    return <div>Error loading feed</div>
  }

  const lostItems = items?.filter(item => item.type === 'LOST') || []
  const foundItems = items?.filter(item => item.type === 'FOUND') || []

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Campus Feed</h1>
        <p className="text-muted-foreground">
          See what's been lost and found around DSU Harohalli.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="lost">Lost Items</TabsTrigger>
          <TabsTrigger value="found">Found Items</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items?.map((item) => (
              <ItemCard key={item.id} item={item} currentUserId={user?.sub} />
            ))}
            {items?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No items reported yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lost" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lostItems.map((item) => (
              <ItemCard key={item.id} item={item} currentUserId={user?.sub} />
            ))}
            {lostItems.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No lost items reported.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="found" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foundItems.map((item) => (
              <ItemCard key={item.id} item={item} currentUserId={user?.sub} />
            ))}
            {foundItems.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No found items reported.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
