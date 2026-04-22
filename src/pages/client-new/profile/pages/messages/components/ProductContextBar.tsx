import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Conversation } from "@/types-new";

type ProductContextBarProps = {
  conversation: Conversation;
};

export function ProductContextBar({ conversation }: ProductContextBarProps) {
  if (!conversation.product) return null;

  return (
    <div className="borderb bg-muted/30 rounded-sm m-2 md:-mb-2">
      <div className="p-2 px-4">
        <Link
          to={`/product/${conversation.product.id}`}
          className="flex items-center gap-3 hover:bg-muted/50 rounded-md p-2 transition-colors"
        >
          <img
            src={conversation.product.thumbnail || "/placeholder-product.jpg"}
            alt={conversation.product.name}
            className="w-12 h-12 rounded-[6px] object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{conversation.product.name}</p>
            <p className="text-sm text-primary font-semibold">
              {formatPrice(conversation.product.price || 0)}
            </p>
          </div>
          <Package className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
