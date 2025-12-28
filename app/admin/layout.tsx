import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

// Hardcoded Admins for MVP Safety (Add your email here)
// Hardcoded Admins for MVP Safety (Add your email here)
const ADMIN_EMAILS = [
    "n.bharath3430@gmail.com",
    "amazingakhil2006@gmail.com",
    "bharath.n@example.com"
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth0.getSession();
    const user = session?.user;

    if (!user) {
        redirect("/api/auth/login");
    }

    // 1. Check DB Role
    const supabase = await createClient();
    const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.sub)
        .single();

    const isAdmin = dbUser?.role === 'ADMIN' || (!!user.email && ADMIN_EMAILS.includes(user.email));

    // Debugging access (remove in prod)
    console.log(`[AdminCheck] User: ${user.email || 'unknown'}, Role: ${dbUser?.role}, IsAdmin: ${isAdmin}`);

    if (!isAdmin) {
        // Redirect unauthorized users to home
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-[#F2F2F2]">
            {children}
        </div>
    );
}
