import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompleteOrderBannerProps = {
  quantity: number;
};

export function CompleteOrderBanner({ quantity }: CompleteOrderBannerProps) {
  return (
    <div className="border-t bg-primary/5">
      <div className="px-4 py-3">
        <Link to="/checkout" className="block">
          <Button className="w-full gap-2" size="lg">
            <ShoppingCart className="h-5 w-5" />
            Complete Order ({quantity} item{quantity > 1 ? "s" : ""} in cart)
          </Button>
        </Link>
      </div>
    </div>
  );
}
