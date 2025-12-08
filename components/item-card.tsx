"use client";

import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Smartphone, CreditCard, Key, Package, ArrowRight } from "lucide-react";
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
    case "Electronics": return <Smartphone className="h-5 w-5" />;
    case "ID": return <CreditCard className="h-5 w-5" />;
    case "Keys": return <Key className="h-5 w-5" />;
    default: return <Package className="h-5 w-5" />;
  }
};

export function ItemCard({ item, onResolve, showActions = true }: ItemCardProps) {
  const isResolved = item.status === "RESOLVED";
  const isLost = item.type === "LOST";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "card-clean p-6 flex flex-col h-full",
        isResolved && "opacity-60 grayscale"
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
          <CategoryIcon category={item.category} />
        </div>
        
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold border",
          isResolved
            ? "bg-slate-100 text-slate-600 border-slate-200"
            : isLost
              ? "bg-red-50 text-red-700 border-red-100"
              : "bg-green-50 text-green-700 border-green-100"
        )}>
          {isResolved ? "Resolved" : isLost ? "Lost" : "Found"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
          {item.title}
        </h3>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {item.description || "No description provided."}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{item.location_zone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && !isResolved && (
        <div className="mt-auto pt-4 border-t border-slate-100">
          <Link href={`/item/${item.id}`} className="w-full">
            <Button variant="outline" className="w-full justify-between group">
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
