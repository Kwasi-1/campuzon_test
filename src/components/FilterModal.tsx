
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { categories } from '@/data/categories';
import { stores } from '@/data/stores';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  selectedStore: string;
  selectedPriceRange: string;
  onCategoryChange: (category: string) => void;
  onStoreChange: (store: string) => void;
  onPriceRangeChange: (range: string) => void;
  currentTab: string;
}

const FilterModal = ({
  isOpen,
  onClose,
  selectedCategory,
  selectedStore,
  selectedPriceRange,
  onCategoryChange,
  onStoreChange,
  onPriceRangeChange,
  currentTab,
}: FilterModalProps) => {
  if (!isOpen) return null;

  const handleCategorySelect = (category: string) => {
    onCategoryChange(selectedCategory === category ? '' : category);
  };

  const handleStoreSelect = (store: string) => {
    onStoreChange(selectedStore === store ? '' : store);
  };

  const handlePriceRangeSelect = (range: string) => {
    onPriceRangeChange(selectedPriceRange === range ? '' : range);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {currentTab !== "stores" && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Store</h3>
                <div className="space-y-2">
                  {stores.map((store) => (
                    <div key={store.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={store.name}
                        checked={selectedStore === store.name}
                        onCheckedChange={() => handleStoreSelect(store.name)}
                      />
                      <label
                        htmlFor={store.name}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {store.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {currentTab !== "categories" && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.name}
                        checked={selectedCategory === category.name}
                        onCheckedChange={() => handleCategorySelect(category.name)}
                      />
                      <label
                        htmlFor={category.name}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                {[
                  "Under GH₵ 10",
                  "GH₵ 10 - GH₵ 30",
                  "GH₵ 30 - GH₵ 50",
                  "Above GH₵ 50",
                ].map((range) => (
                  <div key={range} className="flex items-center space-x-2">
                    <Checkbox
                      id={range}
                      checked={selectedPriceRange === range}
                      onCheckedChange={() => handlePriceRangeSelect(range)}
                    />
                    <label
                      htmlFor={range}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {range}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;