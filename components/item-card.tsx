"use client";

import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, CheckCircle, ArrowRight, Smartphone, CreditCard, Key, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ItemCardProps {
  item: Item;
  onResolve?: (id: string) => void;
  showActions?: boolean;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Electronics": return <Smartphone className="h-6 w-6" />;
    case "ID": return <CreditCard className="h-6 w-6" />;
    case "Keys": return <Key className="h-6 w-6" />;
    default: return <Package className="h-6 w-6" />;
  }
};

const CategoryGradient = (category: string) => {
  switch (category) {
    case "Electronics": return "from-blue-500/20 via-cyan-500/20 to-indigo-500/20 text-blue-600";
    case "ID": return "from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-600";
    case "Keys": return "from-amber-500/20 via-orange-500/20 to-rose-500/20 text-amber-600";
    default: return "from-slate-500/20 via-gray-500/20 to-zinc-500/20 text-slate-600";
  }
};

export function ItemCard({ item, onResolve, showActions = true }: ItemCardProps) {
  const isResolved = item.status === "resolved";
  const isLost = item.type === "lost";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "group relative bg-white/60 backdrop-blur-xl rounded-[2rem] p-1 transition-all duration-500 border border-white/60",
        isResolved ? "opacity-60 grayscale" : "hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:bg-white/80"
      )}
    >
      <div className="bg-white/50 rounded-[1.8rem] p-6 h-full flex flex-col relative overflow-hidden">
        {/* Subtle Gradient Mesh Background */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br",
          isLost ? "from-rose-50/50 via-transparent to-transparent" : "from-teal-50/50 via-transparent to-transparent"
        )} />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-sm backdrop-blur-md border border-white/50",
            CategoryGradient(item.category)
          )}>
            <CategoryIcon category={item.category} />
          </div>
          
          <span className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border backdrop-blur-md shadow-sm",
            isResolved
              ? "bg-slate-100/80 text-slate-500 border-slate-200"
              : isLost
                ? "bg-rose-50/80 text-rose-600 border-rose-100"
                : "bg-teal-50/80 text-teal-600 border-teal-100"
          )}>
            {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 relative z-10">
          <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-teal-700 transition-colors tracking-tight">
            {item.title}
          </h3>
          
          <p className="text-slate-500 text-base leading-relaxed mb-8 line-clamp-2 font-medium">
            {item.description || "No description provided."}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/60 p-3 rounded-2xl border border-white/50 shadow-sm">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 px-3">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-medium">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isResolved && (
          <div className="mt-8 pt-6 border-t border-slate-100/50 relative z-10">
            {onResolve ? (
              <Button 
                onClick={() => onResolve(item.id)}
                className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 transition-all"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Resolved
              </Button>
            ) : (
              <Link href={`/item/${item.id}`} className="block">
                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-700 transition-all bg-white/50">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
