"use client";

import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ItemCardProps {
  item: Item;
  onResolve?: (id: string) => void;
  showActions?: boolean;
}

export function ItemCard({ item, onResolve, showActions = true }: ItemCardProps) {
  const isResolved = item.status === "resolved";
  const isLost = item.type === "lost";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative bg-white border rounded-2xl p-6 transition-all duration-300",
        isResolved 
          ? "border-slate-100 opacity-60 bg-slate-50" 
          : "border-slate-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5"
      )}
    >
      {/* Status Badge */}
      <div className="absolute top-6 right-6">
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tracking-wide",
          isResolved
            ? "bg-slate-100 text-slate-500"
            : isLost
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "bg-teal-50 text-teal-600 border border-teal-100"
        )}>
          {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
        </span>
      </div>

      {/* Content */}
      <div className="pr-20">
        <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 font-medium mb-3 uppercase tracking-wider text-[10px]">
          {item.category}
        </p>
        
        {item.description && (
          <p className="text-slate-600 mb-5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-300" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-300" />
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && !isResolved && (
        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
          <Link href={`/chat/${item.id}`} className="flex-1">
            <Button 
              variant="ghost" 
              className="w-full justify-between text-slate-600 hover:text-teal-700 hover:bg-teal-50 group/btn"
            >
              <span className="font-medium">Contact {isLost ? "Owner" : "Finder"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
          
          {onResolve && (
            <Button
              variant="outline"
              onClick={() => onResolve(item.id)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
