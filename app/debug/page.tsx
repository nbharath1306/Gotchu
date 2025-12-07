import { auth0 } from "@/lib/auth0";

export default async function DebugPage() {
  const session = await auth0.getSession();
  const secret = process.env.AUTH0_SECRET;
  const gotchuSecret = process.env.GOTCHU_SECRET;

  return (
    <div className="p-8 font-mono text-sm break-all">
      <h1 className="text-xl font-bold mb-4">Auth Debug (v2)</h1>
      <div className="space-y-2">
        <p><strong>Is Logged In:</strong> {session ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {session?.user ? JSON.stringify(session.user, null, 2) : 'None'}</p>
        
        <div className="p-4 bg-gray-100 rounded my-4">
          <h2 className="font-bold">Environment Variables Check:</h2>
          <p><strong>APP_BASE_URL:</strong> {process.env.APP_BASE_URL || 'MISSING'}</p>
          <p><strong>AUTH0_BASE_URL:</strong> {process.env.AUTH0_BASE_URL || 'MISSING'}</p>
          <p><strong>AUTH0_ISSUER_BASE_URL:</strong> {process.env.AUTH0_ISSUER_BASE_URL || 'MISSING'}</p>
          <p><strong>AUTH0_CLIENT_ID:</strong> {process.env.AUTH0_CLIENT_ID ? 'Present' : 'MISSING'}</p>
          <p><strong>AUTH0_CLIENT_SECRET:</strong> {process.env.AUTH0_CLIENT_SECRET ? 'Present' : 'MISSING'}</p>
          <p><strong>AUTH0_SECRET:</strong> {secret ? `Present (Length: ${secret.length})` : 'MISSING'}</p>
          <p><strong>GOTCHU_SECRET:</strong> {gotchuSecret ? `Present (Length: ${gotchuSecret.length})` : 'MISSING'}</p>
          <p><strong>AUTH0_DOMAIN:</strong> {process.env.AUTH0_DOMAIN || 'MISSING'}</p>
        </div>

        <div className="p-4 bg-blue-50 rounded my-4">
           <h2 className="font-bold">Troubleshooting:</h2>
           <ul className="list-disc pl-5">
             <li>If AUTH0_SECRET is MISSING, add it to Vercel Env Vars.</li>
             <li>If AUTH0_BASE_URL has a trailing slash (e.g. .app/), remove it.</li>
             <li>Ensure AUTH0_BASE_URL matches your Vercel domain exactly.</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
