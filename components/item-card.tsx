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
    case "Electronics": return "from-blue-500/10 to-indigo-500/10 text-blue-600";
    case "ID": return "from-emerald-500/10 to-teal-500/10 text-emerald-600";
    case "Keys": return "from-amber-500/10 to-orange-500/10 text-amber-600";
    default: return "from-slate-500/10 to-gray-500/10 text-slate-600";
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative bg-white rounded-3xl p-1 transition-all duration-300",
        isResolved ? "opacity-60 grayscale" : "hover:shadow-xl hover:shadow-slate-900/5"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-white rounded-3xl -z-10" />
      
      <div className="bg-white rounded-[20px] p-6 border border-slate-100 h-full flex flex-col relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className={cn(
          "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-50 transition-colors",
          isLost ? "bg-rose-100" : "bg-teal-100"
        )} />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 relative">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br",
            CategoryGradient(item.category)
          )}>
            <CategoryIcon category={item.category} />
          </div>
          
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border",
            isResolved
              ? "bg-slate-100 text-slate-500 border-slate-200"
              : isLost
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-teal-50 text-teal-600 border-teal-100"
          )}>
            {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-teal-700 transition-colors">
            {item.title}
          </h3>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
            {item.description || "No description provided."}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-medium truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-500 px-2.5">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isResolved && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <Link href={`/chat/${item.id}`} className="flex-1">
              <Button 
                className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
              >
                Contact
              </Button>
            </Link>
            
            {onResolve && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onResolve(item.id)}
                className="shrink-0 border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"
                title="Mark as Resolved"
              >
                <CheckCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
