import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types-new";

interface OfferSubmittedScreenProps {
  order: Order;
  storeName?: string;
}

export function OfferSubmittedScreen({
  order,
  storeName,
}: OfferSubmittedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-12 z-[99999999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full overflow-hidden rounded-xl borde bg-white shadowmd"
      >
        {/* Animated top bar */}
        {/* <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="h-1.5 origin-left bg-gradient-to-r from-amber-400 to-orange-400"
        /> */}

        <div className="flex flex-col items-center px-8 py-10 text-center">
          {/* Animated icon */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50"
          >
            <Clock className="h-12 w-12 text-amber-500" strokeWidth={1.5} />
            {/* Pulsing ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-100 opacity-60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-2 text-2xl font-bold tracking-tight text-gray-900"
          >
            Offer Sent!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="mb-1 text-base text-gray-600"
          >
            Your order has been submitted to{" "}
            <span className="font-semibold text-gray-800">
              {storeName ?? "the seller"}
            </span>{" "}
            for approval.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
            className="text-sm text-gray-400"
          >
            You'll be notified once the seller accepts — then you can complete
            payment.
          </motion.p>

          {/* Order number pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="my-6 flex items-center gap-2 rounded-full borde border-gray-200 bg-gray-50 px-4 py-2 text-sm"
          >
            <CheckCircle className="h-4 w-4 text-gray-500" />
            <span className="font-mono font-medium text-gray-800">
              {order.orderNumber}
            </span>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.62 }}
            className="mb-8 w-full space-y-3 rounded-2xl bg-gray-50 p-4 text-left"
          >
            {[
              { step: "1", label: "Offer submitted", done: true },
              { step: "2", label: "Seller reviews & accepts", done: false },
              { step: "3", label: "You complete payment", done: false },
              { step: "4", label: "Order processed & delivered", done: false },
            ].map(({ step, label, done }) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done ? "✓" : step}
                </span>
                <span
                  className={`text-sm ${done ? "font-medium text-gray-800" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex w-full flex-col gap-3"
          >
            <Button
              size="lg"
              className="w-full rounded-full"
              onClick={() => navigate("/orders")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              View My Orders
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full text-gray-500"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center text-xs text-gray-400"
      >
        Sellers typically respond within a few hours. You'll also get a
        notification when payment is ready.
      </motion.p>
    </div>
  );
}
