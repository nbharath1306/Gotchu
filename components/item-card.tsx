"use client";

import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, MessageCircle, CheckCircle, Smartphone, Key, Wallet, BookOpen, Headphones, ShoppingBag, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ItemCardProps {
  item: Item;
  onResolve?: (id: string) => void;
  showActions?: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Electronics": Smartphone,
  "Keys": Key,
  "Wallet/Cards": Wallet,
  "Books": BookOpen,
  "Headphones/Earbuds": Headphones,
  "Bags/Backpacks": ShoppingBag,
  "Jewelry/Watch": Watch,
};

export function ItemCard({ item, onResolve, showActions = true }: ItemCardProps) {
  const isResolved = item.status === "resolved";
  const isLost = item.type === "lost";
  const IconComponent = categoryIcons[item.category] || Smartphone;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-2xl border bg-zinc-900/50 backdrop-blur-sm overflow-hidden transition-all duration-300",
        isResolved 
          ? "border-zinc-800/50 opacity-60" 
          : "border-zinc-800 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5"
      )}
    >
      {/* Gradient top border */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity",
        isLost 
          ? "bg-gradient-to-r from-red-500 to-orange-500"
          : "bg-gradient-to-r from-emerald-500 to-cyan-500"
      )} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            isLost 
              ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-400"
              : "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400"
          )}>
            <IconComponent className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                isResolved 
                  ? "bg-blue-500/20 text-blue-400"
                  : isLost 
                    ? "bg-red-500/20 text-red-400"
                    : "bg-emerald-500/20 text-emerald-400"
              )}>
                {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
              </span>
            </div>
            <h3 className="font-semibold text-white text-lg leading-tight truncate">
              {item.title}
            </h3>
            <p className="text-sm text-zinc-500">{item.category}</p>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
            {item.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && !isResolved && (
          <div className="flex gap-2 pt-4 border-t border-zinc-800">
            <Link href={`/chat/${item.id}`} className="flex-1">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5 hover:border-zinc-600 rounded-xl h-9"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </Link>
            {onResolve && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onResolve(item.id)}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-xl h-9"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        )}
        
        {isResolved && (
          <div className="flex items-center gap-2 pt-4 border-t border-zinc-800 text-blue-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Item has been recovered</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
