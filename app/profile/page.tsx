import { auth0 } from "@/lib/auth0"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ProfileClient } from "@/components/profile-client"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth0.getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user
  const supabase = await createClient()

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.sub)
    .single()

  const { data: userItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.sub)
    .order('created_at', { ascending: false })

  return (
    <ProfileClient 
      user={{
        name: user.name || user.nickname || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        picture: user.picture || '',
      }}
      profile={userData ? { karma: userData.karma_points } : null}
      items={userItems || []}
    />
  )
}
