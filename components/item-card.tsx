"use client";

import { Item } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  onResolve?: (id: string) => void;
  showActions?: boolean;
}

export function ItemCard({ item, onResolve, showActions = true }: ItemCardProps) {
  const isResolved = item.status === "resolved";
  
  return (
    <div 
      className={cn(
        "bg-white border rounded-lg p-5 transition-colors",
        isResolved ? "border-neutral-100 opacity-50" : "border-neutral-200 hover:border-neutral-300"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-medium text-neutral-900 truncate">{item.title}</h3>
          <p className="text-sm text-neutral-500">{item.category}</p>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-medium shrink-0",
          item.status === "resolved"
            ? "bg-neutral-100 text-neutral-500"
            : item.type === "lost"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
        )}>
          {item.status === "resolved" ? "Resolved" : item.type === "lost" ? "Lost" : "Found"}
        </span>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{item.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-neutral-500 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {item.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      {showActions && !isResolved && (
        <div className="flex gap-2 pt-3 border-t border-neutral-100">
          <Link href={`/chat/${item.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs border-neutral-200 text-neutral-600 hover:bg-neutral-50">
              Contact
            </Button>
          </Link>
          {onResolve && (
            <Button
              size="sm"
              onClick={() => onResolve(item.id)}
              className="h-8 text-xs bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
