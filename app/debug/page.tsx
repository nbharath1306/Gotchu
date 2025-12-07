import { auth0 } from "@/lib/auth0";

export default async function DebugPage() {
  const session = await auth0.getSession();

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Auth Debug</h1>
      <div className="space-y-2">
        <p><strong>Is Logged In:</strong> {session ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {session?.user ? JSON.stringify(session.user, null, 2) : 'None'}</p>
        <p><strong>Base URL:</strong> {process.env.AUTH0_BASE_URL}</p>
        <p><strong>Issuer:</strong> {process.env.AUTH0_ISSUER_BASE_URL}</p>
        <p><strong>Client ID:</strong> {process.env.AUTH0_CLIENT_ID?.slice(0, 5)}...</p>
        <p><strong>Secret Set:</strong> {process.env.AUTH0_SECRET ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
