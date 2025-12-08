import Link from "next/link";
import { Github, Twitter, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Gotchu</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs text-center md:text-left">
            Reconnecting lost items with their owners. Built with <Heart className="inline h-3 w-3 text-red-500 fill-red-500 mx-0.5" /> by <span className="font-semibold text-slate-900">Circle13</span>.
          </p>
        </div>

        <div className="flex gap-8 text-sm font-medium text-slate-600">
          <Link href="/feed" className="hover:text-slate-900 transition-colors">Feed</Link>
          <Link href="/report/lost" className="hover:text-slate-900 transition-colors">Report Lost</Link>
          <Link href="/report/found" className="hover:text-slate-900 transition-colors">Report Found</Link>
          <Link href="/profile" className="hover:text-slate-900 transition-colors">Profile</Link>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all">
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Circle13. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
