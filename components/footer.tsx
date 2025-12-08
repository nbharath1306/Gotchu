import Link from "next/link"
import { Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#F2F2F2] py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-black" />
          <span className="font-display font-bold tracking-tight text-lg">GOTCHU</span>
        </div>
        
        <div className="flex gap-8 text-xs font-mono text-[#666666]">
          <Link href="/feed" className="hover:text-black transition-colors">DATABASE</Link>
          <Link href="/report/lost" className="hover:text-black transition-colors">REPORT LOST</Link>
          <Link href="/report/found" className="hover:text-black transition-colors">REPORT FOUND</Link>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-[#666666] hover:text-black transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <span className="text-[10px] font-mono text-[#666666]">
            © {new Date().getFullYear()} SYSTEM
          </span>
        </div>
      </div>
    </footer>
  )
}
