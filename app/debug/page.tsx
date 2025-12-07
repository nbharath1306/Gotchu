import { auth0 } from "@/lib/auth0";

export default async function DebugPage() {
  const session = await auth0.getSession();
  const secret = process.env.AUTH0_SECRET;

  return (
    <div className="p-8 font-mono text-sm break-all">
      <h1 className="text-xl font-bold mb-4">Auth Debug</h1>
      <div className="space-y-2">
        <p><strong>Is Logged In:</strong> {session ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {session?.user ? JSON.stringify(session.user, null, 2) : 'None'}</p>
        <div className="p-4 bg-gray-100 rounded my-4">
          <h2 className="font-bold">Environment Variables Check:</h2>
          <p><strong>AUTH0_BASE_URL:</strong> {process.env.AUTH0_BASE_URL || 'MISSING'}</p>
          <p><strong>AUTH0_ISSUER_BASE_URL:</strong> {process.env.AUTH0_ISSUER_BASE_URL || 'MISSING'}</p>
          <p><strong>AUTH0_CLIENT_ID:</strong> {process.env.AUTH0_CLIENT_ID ? 'Present' : 'MISSING'}</p>
          <p><strong>AUTH0_CLIENT_SECRET:</strong> {process.env.AUTH0_CLIENT_SECRET ? 'Present' : 'MISSING'}</p>
          <p><strong>AUTH0_SECRET:</strong> {process.env.AUTH0_SECRET ? 'Present' : 'MISSING'}</p>
          <p><strong>GOTCHU_SECRET:</strong> {process.env.GOTCHU_SECRET ? 'Present' : 'MISSING'}</p>
          <p><strong>AUTH0_DOMAIN:</strong> {process.env.AUTH0_DOMAIN || 'MISSING'}</p>
        </div>
        <p className="text-red-500 font-bold mt-4">
          If AUTH0_SECRET is MISSING, try adding GOTCHU_SECRET with the same value.
        </p>
      </div>
    </div>
  );
}
