import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Store } from "@/types";

interface FeedbackRating {
  type: "positive" | "neutral" | "negative";
  count: number;
}

interface SellerRating {
  name: string;
  score: number;
  maxScore?: number;
}

interface FeedbackItem {
  id: string;
  username: string;
  feedbackScore?: number;
  date: string;
  text: string;
  isVerifiedPurchase?: boolean;
}

interface StoreFeedbackProps {
  store: Store;
  feedbackRatings?: FeedbackRating[];
  sellerRatings?: SellerRating[];
  feedbackItems?: FeedbackItem[];
  totalFeedback?: number;
}

export function StoreFeedback({
  store,
  feedbackRatings,
  sellerRatings,
  feedbackItems,
  totalFeedback,
}: StoreFeedbackProps) {
  // Default feedback ratings if not provided
  const defaultRatings: FeedbackRating[] = feedbackRatings || [
    { type: "positive", count: Math.floor((store.totalOrders || 100) * 0.95) },
    { type: "neutral", count: Math.floor((store.totalOrders || 100) * 0.03) },
    { type: "negative", count: Math.floor((store.totalOrders || 100) * 0.02) },
  ];

  // Default seller ratings if not provided
  const defaultSellerRatings: SellerRating[] = sellerRatings || [
    { name: "Accurate description", score: 4.6, maxScore: 5 },
    { name: "Reasonable shipping cost", score: 4.2, maxScore: 5 },
    { name: "Shipping speed", score: 4.5, maxScore: 5 },
    { name: "Communication", score: 4.8, maxScore: 5 },
  ];

  // Default feedback items if not provided
  const defaultFeedbackItems: FeedbackItem[] = feedbackItems || [
    {
      id: "1",
      username: "j***_(0)",
      date: "Past month",
      text: "Quality is great. Condition is new. Appearance is prestige. Charger came too. Everything wrapped well and protective. Worth the value. Seller was super responsive and helpful. Overall very satisfied with the purchase and process",
      isVerifiedPurchase: true,
    },
    {
      id: "2",
      username: "o***n (14)",
      date: "Past month",
      text: "Item new as described. It arrived on time, well (and safe) packaging. I'm happy with my purchase, totally worth it.",
      isVerifiedPurchase: true,
    },
    {
      id: "3",
      username: "t***e (1573)",
      date: "Past month",
      text: "Item well represented and arrived in great condition.",
      isVerifiedPurchase: true,
    },
    {
      id: "4",
      username: "g***u (14)",
      date: "Past month",
      text: "Super fast shipping, quality item and was in perfect condition, great value !",
      isVerifiedPurchase: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Feedback Ratings Summary */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Feedback ratings
        </h2>
        <p className="text-sm text-gray-600 mb-4">Last 12 months</p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-1">Positive</p>
            <p className="text-2xl font-bold text-gray-900">
              {defaultRatings.find((r) => r.type === "positive")?.count || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Neutral</p>
            <p className="text-2xl font-bold text-gray-900">
              {defaultRatings.find((r) => r.type === "neutral")?.count || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Negative</p>
            <p className="text-2xl font-bold text-gray-900">
              {defaultRatings.find((r) => r.type === "negative")?.count || 0}
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Seller Ratings */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Detailed seller ratings
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Average for the last 12 months
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {defaultSellerRatings.map((rating) => (
            <div key={rating.name} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 min-w-[160px]">
                {rating.name}
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full"
                  style={{
                    width: `${(rating.score / (rating.maxScore || 5)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {rating.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* All Feedback */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          All feedback ({totalFeedback || defaultFeedbackItems.length})
        </h3>

        <div className="space-y-4">
          {defaultFeedbackItems.map((item) => (
            <div
              key={item.id}
              className="py-4 border-b border-gray-200 last:border-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">{item.username}</span>
                <span className="text-sm text-gray-400">{item.date}</span>
                {item.isVerifiedPurchase && (
                  <span className="text-sm text-gray-600 flex items-center gap-1 ml-auto">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Verified purchase
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>

        {/* See All Feedback Button */}
        <div className="mt-6 text-center">
          <Button
            variant="default"
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
          >
            See all feedback
          </Button>
        </div>
      </section>
    </div>
  );
}
