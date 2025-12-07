import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="font-semibold text-slate-900">Gotchu</span>
          </div>
          <p className="text-sm text-slate-500">
            A product by <span className="font-medium text-slate-700">Circle13</span>
          </p>
        </div>

        <div className="flex gap-8 text-sm text-slate-500">
          <Link href="/feed" className="hover:text-teal-600 transition-colors">Feed</Link>
          <Link href="/report/lost" className="hover:text-teal-600 transition-colors">Report Lost</Link>
          <Link href="/report/found" className="hover:text-teal-600 transition-colors">Report Found</Link>
        </div>

        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} Circle13. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
