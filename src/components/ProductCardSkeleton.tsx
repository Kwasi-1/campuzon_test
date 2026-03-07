import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const ProductCardSkeleton = () => {
  return (
    <Card className="group cursor-pointer border-0 shadow-none hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-transparent rounded-lg">
      <div className="relative rounded-lg border border-gray-100/80">
        <div className="aspect-square flex items-center rounded-lg justify-center bg-white">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
      
      <CardContent className="pt-4 px-1">
        {/* Rating Skeleton */}
        <div className="flex items-center gap-1 mb-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-8 h-4 rounded" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
        
        {/* Product Name Skeleton */}
        <div className="mb-3 space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        
        {/* Price Section Skeleton */}
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        
        {/* Discount Skeleton */}
        <Skeleton className="h-4 w-12 rounded" />
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;