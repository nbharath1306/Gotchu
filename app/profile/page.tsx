import { auth0 } from "@/lib/auth0"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemCard } from "@/components/item-card"
import { Star, Package, CheckCircle, AlertCircle, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth0.getSession()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  const user = session.user
  const supabase = await createClient()

  // Fetch user data from Supabase
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.sub)
    .single()

  // Fetch user's items
  const { data: userItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.sub)
    .order('created_at', { ascending: false })

  const items = userItems || []
  const openItems = items.filter(item => item.status === 'OPEN')
  const resolvedItems = items.filter(item => item.status === 'RESOLVED')
  const lostItems = items.filter(item => item.type === 'LOST')
  const foundItems = items.filter(item => item.type === 'FOUND')

  const karmaPoints = userData?.karma_points || 0

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Profile Header */}
      <Card className="glass border-white/10 mb-8 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-violet-600/30 to-indigo-600/30" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage src={user.picture || ''} alt={user.name || 'User'} />
              <AvatarFallback className="text-2xl bg-violet-600 text-white">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left pb-2">
              <h1 className="text-2xl font-bold">{user.name || 'Anonymous User'}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex gap-2 pb-2">
              <Link href="/auth/logout">
                <Button variant="outline" size="sm" className="border-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{karmaPoints}</p>
              <p className="text-xs text-muted-foreground">Karma Points</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openItems.length}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedItems.length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User's Items */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Your Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 glass border-white/10 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg text-xs md:text-sm">
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value="open" className="rounded-lg text-xs md:text-sm">
                Open ({openItems.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="rounded-lg text-xs md:text-sm">
                Lost ({lostItems.length})
              </TabsTrigger>
              <TabsTrigger value="found" className="rounded-lg text-xs md:text-sm">
                Found ({foundItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} currentUserId={user.sub} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="open">
              {openItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openItems.map((item) => (
                    <ItemCard key={item.id} item={item} currentUserId={user.sub} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No open items" />
              )}
            </TabsContent>

            <TabsContent value="lost">
              {lostItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lostItems.map((item) => (
                    <ItemCard key={item.id} item={item} currentUserId={user.sub} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No lost items reported" />
              )}
            </TabsContent>

            <TabsContent value="found">
              {foundItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foundItems.map((item) => (
                    <ItemCard key={item.id} item={item} currentUserId={user.sub} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No found items reported" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState({ message = "You haven't reported any items yet" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      <div className="flex gap-2">
        <Link href="/report/lost">
          <Button variant="outline" size="sm">Report Lost Item</Button>
        </Link>
        <Link href="/report/found">
          <Button variant="outline" size="sm">Report Found Item</Button>
        </Link>
      </div>
    </div>
  )
}
