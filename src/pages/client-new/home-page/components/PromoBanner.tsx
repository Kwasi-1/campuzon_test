import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, CreditCard, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PROMO_ITEMS = [
  {
    title: "Shopping made easy",
    subtitle: "Buy and sell safely with escrow protection",
    ctaText: "Learn more",
    ctaLink: "/help/how-it-works",
    icon: <ShoppingBag className="w-6 h-6 text-gray-600" />,
    iconBg: "bg-gray-100",
  },
  {
    title: "Escrow Protected",
    subtitle: "Your money is safe until delivery",
    ctaText: "Learn more",
    ctaLink: "/help/how-it-works",
    icon: <ShieldCheck className="w-6 h-6 text-gray-600" />,
    iconBg: "bg-gray-100",
  },
  {
    title: "Campus Pickup",
    subtitle: "Meet safely on campus",
    ctaText: "Learn more",
    ctaLink: "/help/how-it-works",
    icon: <Truck className="w-6 h-6 text-gray-600" />,
    iconBg: "bg-gray-100",
  },
  {
    title: "Secure Payments",
    subtitle: "Mobile money & bank transfers",
    ctaText: "Learn more",
    ctaLink: "/help/how-it-works",
    icon: <CreditCard className="w-6 h-6 text-gray-600" />,
    iconBg: "bg-gray-100",
  },
];

export default function PromoBanner({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_ITEMS.length);
    }, 4500); // changes every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  const currentItem = PROMO_ITEMS[currentIndex];

  return (
    <div
      className={cn(
        "relative w-full py-4 md:py-6 px-6 md:px-8 rounded-md md:rounded-xl overflow-hidden bg-[#F7F7F7] text-foreground h-[80px] md:h-[100px] flex items-center shadow-sm",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-4">
            {/* <div className={cn("hidden md:flex w-12 h-12 rounded-md items-center justify-center shrink-0", currentItem.iconBg)}>
              {currentItem.icon}
            </div> */}
            <div className="flex flex-col md:gap-1">
              <h3 className="text-[17px] md:text-xl lg:text-2xl font-bold  text-foreground">{currentItem.title}</h3>
              {currentItem.subtitle && (
                <span className="text-[13px] md:text-sm opacity-80 text-foreground">
                  {currentItem.subtitle}
                </span>
              )}
            </div>
          </div>

          {currentItem.ctaText && (
            <Link
              to={currentItem.ctaLink}
              className="hidden md:flex items-center gap-1 text-sm font-semibold hover:underline group shrink-0 ml-4"
            >
              {currentItem.ctaText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
