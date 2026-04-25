import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import type { Category } from "@/types-new";

type SubCategory = {
  name: string;
  image: string;
  searchQuery: string;
};

type CategoryData = {
  id: Category;
  label: string;
  icon: string;
  banner: string;
  subCategories: SubCategory[];
};

const CATEGORIES_DATA: CategoryData[] = [
  {
    id: "electronics",
    label: "Electronics",
    icon: "solar:laptop-linear",
    banner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Phones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300&auto=format&fit=crop", searchQuery: "phone" },
      { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop", searchQuery: "laptop" },
      { name: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop", searchQuery: "audio" },
      { name: "Accessories", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300&auto=format&fit=crop", searchQuery: "accessories" },
    ],
  },
  {
    id: "fashion",
    label: "Fashion",
    icon: "solar:hanger-linear",
    banner: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=300&auto=format&fit=crop", searchQuery: "men" },
      { name: "Women", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop", searchQuery: "women" },
      { name: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop", searchQuery: "shoes" },
      { name: "Bags", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=300&auto=format&fit=crop", searchQuery: "bag" },
    ],
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: "solar:star-linear",
    banner: "https://images.unsplash.com/photo-1522335789203-aabd1fc54c28?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Skincare", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300&auto=format&fit=crop", searchQuery: "skincare" },
      { name: "Makeup", image: "https://images.unsplash.com/photo-1512496015851-a1c84cb6f154?q=80&w=300&auto=format&fit=crop", searchQuery: "makeup" },
      { name: "Hair", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=300&auto=format&fit=crop", searchQuery: "hair" },
      { name: "Fragrance", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=300&auto=format&fit=crop", searchQuery: "fragrance" },
    ],
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: "solar:cart-large-minimalistic-linear",
    banner: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Snacks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=300&auto=format&fit=crop", searchQuery: "snacks" },
      { name: "Beverages", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=300&auto=format&fit=crop", searchQuery: "beverages" },
      { name: "Pantry", image: "https://images.unsplash.com/photo-1506617420156-8e4536971650?q=80&w=300&auto=format&fit=crop", searchQuery: "pantry" },
    ],
  },
  {
    id: "books",
    label: "Books",
    icon: "solar:book-linear",
    banner: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Textbooks", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=300&auto=format&fit=crop", searchQuery: "textbooks" },
      { name: "Fiction", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop", searchQuery: "fiction" },
      { name: "Notebooks", image: "https://images.unsplash.com/photo-1531346878377-a544ba4bb366?q=80&w=300&auto=format&fit=crop", searchQuery: "notebooks" },
    ],
  },
  {
    id: "stationery",
    label: "Stationery",
    icon: "solar:pen-linear",
    banner: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Pens", image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=300&auto=format&fit=crop", searchQuery: "pens" },
      { name: "Paper", image: "https://images.unsplash.com/photo-1603484477859-abe6a73f9366?q=80&w=300&auto=format&fit=crop", searchQuery: "paper" },
      { name: "Art", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=300&auto=format&fit=crop", searchQuery: "art" },
    ],
  },
  {
    id: "food",
    label: "Food",
    icon: "solar:cup-hot-linear",
    banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Fast Food", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&auto=format&fit=crop", searchQuery: "fast food" },
      { name: "Local", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop", searchQuery: "local" },
      { name: "Pastries", image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=300&auto=format&fit=crop", searchQuery: "pastries" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: "solar:hand-shake-linear",
    banner: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "Tutors", image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=300&auto=format&fit=crop", searchQuery: "tutor" },
      { name: "Delivery", image: "https://images.unsplash.com/photo-1607004468138-c7e63ac80521?q=80&w=300&auto=format&fit=crop", searchQuery: "delivery" },
      { name: "Cleaning", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop", searchQuery: "cleaning" },
    ],
  },
  {
    id: "other",
    label: "Other",
    icon: "solar:box-linear",
    banner: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop",
    subCategories: [
      { name: "General", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=300&auto=format&fit=crop", searchQuery: "general" },
    ],
  },
];

export function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES_DATA[0].id);

  const currentCategoryData = CATEGORIES_DATA.find((c) => c.id === activeCategory);

  return (
    <div className="flex h-[calc(100vh-5.5rem)] md:h-[calc(100vh-12.5rem)] lg:h-[calc(100vh-10rem)] w-full overflow-hidden bg-background md:rounded-xl md:border md:shadow-sm -mb-10 -mt10 md:mb-auto md:mt-auto pb-14 md:pb-0">
      
      {/* Left Sidebar - Categories List */}
      <div className="w-[85px] sm:w-[100px] md:w-[120px] flex-shrink-0 bg-muted/30 border-r border-border overflow-y-auto scrollbar-hide py-2">
        {CATEGORIES_DATA.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex flex-col items-center justify-center py-4 px-1 gap-2 relative transition-colors ${
                isActive ? "bg-background text-primary" : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
              )}
              <div className={`p-2 rounded-full ${isActive ? "bg-primary/10" : ""}`}>
                <Icon icon={category.icon} className="h-6 w-6" />
              </div>
              <span className={`text-[10px] sm:text-xs text-center font-medium ${isActive ? "font-semibold" : ""}`}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Content Area - Subcategories */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-background p-4 sm:p-6">
        {currentCategoryData && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Banner */}
            <Link
              to={`/products?category=${currentCategoryData.id}`}
              className="block relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden group shadow-sm"
            >
              <img
                src={currentCategoryData.banner}
                alt={`${currentCategoryData.label} banner`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
                  {currentCategoryData.label}
                </h2>
                <p className="text-xs sm:text-sm mt-1 opacity-90">
                  Shop All
                </p>
              </div>
            </Link>

            {/* Subcategories Grid */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 px-1">
                Popular in {currentCategoryData.label}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
                {currentCategoryData.subCategories.map((sub, index) => (
                  <Link
                    key={index}
                    to={`/products?category=${currentCategoryData.id}&search=${sub.searchQuery}`}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-full aspect-square rounded-3xl overflow-hidden bg-muted/30 shadow-sm border border-black/5 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs text-center font-medium text-gray-700 group-hover:text-primary transition-colors">
                      {sub.name}
                    </span>
                  </Link>
                ))}
                
                {/* 'View All' Item */}
                <Link
                  to={`/products?category=${currentCategoryData.id}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-full aspect-square rounded-[24px] bg-muted/40 flex items-center justify-center shadow-sm border border-black/5 transition-all duration-300 group-hover:bg-muted/60 group-hover:shadow-md group-hover:-translate-y-1">
                    <Icon icon="solar:widget-add-linear" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 group-hover:text-primary" />
                  </div>
                  <span className="text-[11px] sm:text-xs text-center font-medium text-gray-700 group-hover:text-primary transition-colors">
                    View All
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
