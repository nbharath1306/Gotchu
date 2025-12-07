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
        "bg-white rounded-2xl p-6 border transition-all duration-200",
        isResolved 
          ? "border-gray-100 opacity-60" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{item.category}</p>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium shrink-0",
          item.status === "resolved"
            ? "bg-blue-50 text-blue-600"
            : item.type === "lost"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
        )}>
          {item.status === "resolved" ? "Resolved" : item.type === "lost" ? "Lost" : "Found"}
        </span>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && !isResolved && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Link href={`/chat/${item.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full">
              Contact
            </Button>
          </Link>
          {onResolve && (
            <Button
              onClick={() => onResolve(item.id)}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
