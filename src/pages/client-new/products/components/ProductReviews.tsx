import { useState } from "react";
import { Star, ThumbsUp, MessageSquare, Camera } from "lucide-react";
import {
  Skeleton,
} from "@/components/shared/Skeleton";
import { Card, CardContent } from "@/components/ui/card"
import { useProductReviews, type Review } from "@/hooks/useReviews";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data, isLoading } = useProductReviews(productId);
  const reviews = data?.reviews || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)} out of 5
            </span>
            <span className="text-sm text-muted-foreground">
              • {reviews.length} reviews
            </span>
          </div>
        </div>

        {/* We can add a "Write a Review" button here if user has purchased the item */}
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 bg-muted/30 rounded-lg">
            No reviews yet for this product.
          </p>
        ) : (
          reviews.map((review) => (
            <Card
              key={review.id}
              className="border-none shadow-none bg-transparent"
            >
              <CardContent className="p-0 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {review.user?.profileImage ? (
                        <img
                          src={review.user.profileImage}
                          alt={review.user.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {review.user?.displayName?.[0] || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {review.user?.displayName || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.dateCreated), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-sm">{review.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((img, i) => (
                      <div
                        key={i}
                        className="h-20 w-20 rounded-lg border overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`Review ${i}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {review.sellerResponse && (
                  <div className="ml-8 p-4 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs font-bold">Response from Seller</p>
                    <p className="text-sm text-gray-700 italic">
                      "{review.sellerResponse}"
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Report
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
