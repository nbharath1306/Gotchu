import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

// Hardcoded Admins for MVP Safety (Add your email here)
const ADMIN_EMAILS = [
    "bharath.n@example.com", // Replace or add user's email dynamically if possible, but hardcoding is safest for MVP
    // The user didn't give me their email, so I will rely on the DB Role check primarily, 
    // but I'll add a log for them to see.
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

    const isAdmin = dbUser?.role === 'ADMIN' || ADMIN_EMAILS.includes(user.email);

    // Debugging access (remove in prod)
    console.log(`[AdminCheck] User: ${user.email}, Role: ${dbUser?.role}, IsAdmin: ${isAdmin}`);

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
