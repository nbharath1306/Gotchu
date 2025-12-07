"use client";

import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, MessageCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  onResolve?: (id: string) => void;
  showActions?: boolean;
}

export function ItemCard({ item, onResolve, showActions = true }: ItemCardProps) {
  const isResolved = item.status === "resolved";
  
  const statusStyles: Record<string, string> = {
    open: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    lost: "bg-red-500/10 text-red-400 border-red-500/20",
    found: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    resolved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  // Determine badge style: use item.type for open items, otherwise use status
  const badgeStyle = item.status === "open" 
    ? statusStyles[item.type] || statusStyles.open
    : statusStyles[item.status] || statusStyles.open;

  return (
    <div 
      className={cn(
        "group relative rounded-xl border bg-zinc-900/50 p-5 transition-all duration-200",
        isResolved 
          ? "border-zinc-800/50 opacity-60" 
          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{item.title}</h3>
          <p className="text-sm text-zinc-500 mt-1">{item.category}</p>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs font-medium capitalize shrink-0", badgeStyle)}
        >
          {item.status === "open" ? item.type : item.status}
        </Badge>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
          {item.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate max-w-[150px]">{item.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && !isResolved && (
        <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
          <Link href={`/chat/${item.id}`} className="flex-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </Link>
          {onResolve && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResolve(item.id)}
              className="flex-1 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      )}

      {/* Resolved indicator */}
      {isResolved && (
        <div className="flex items-center gap-2 pt-3 border-t border-zinc-800 text-zinc-500">
          <CheckCircle className="h-4 w-4 text-blue-400" />
          <span className="text-sm">Item has been resolved</span>
        </div>
      )}
    </div>
  );
}
