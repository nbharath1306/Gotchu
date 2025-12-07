import { auth0 } from "@/lib/auth0";
import { cookies } from "next/headers";

export default async function CallbackDebugPage() {
  const session = await auth0.getSession();
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  return (
    <div className="p-8 font-mono text-sm break-all">
      <h1 className="text-xl font-bold mb-4">Callback Debug</h1>
      
      <div className="p-4 bg-green-50 rounded my-4">
        <h2 className="font-bold">Session Status:</h2>
        <p><strong>Has Session:</strong> {session ? 'YES' : 'NO'}</p>
        {session && (
          <div>
            <p><strong>User ID:</strong> {session.user?.sub}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Name:</strong> {session.user?.name}</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-yellow-50 rounded my-4">
        <h2 className="font-bold">Cookies ({allCookies.length}):</h2>
        {allCookies.length === 0 ? (
          <p className="text-red-500">No cookies found!</p>
        ) : (
          <ul className="list-disc pl-5">
            {allCookies.map((cookie, i) => (
              <li key={i}>
                <strong>{cookie.name}:</strong> {cookie.value.slice(0, 50)}...
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded my-4">
        <h2 className="font-bold">Instructions:</h2>
        <ol className="list-decimal pl-5">
          <li>Go to <a href="/auth/login" className="text-blue-600 underline">/auth/login</a></li>
          <li>Login with Google</li>
          <li>You should be redirected back here</li>
          <li>If "Has Session" is NO, the cookie is not being set</li>
        </ol>
      </div>
    </div>
  );
}
