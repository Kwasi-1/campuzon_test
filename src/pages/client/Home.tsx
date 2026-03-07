import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  Star,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LandingHero from "@/components/LandingHero";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SEO from "@/components/SEO";
import { Icon } from "@iconify/react";
import { getFeaturedCategories } from "@/data/categories";
import { getPopularStores } from "@/data/stores";
import { productService } from "@/services";
import { useApiState } from "@/hooks/useApiState";
import { Product } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSearchOverlay from "@/components/MobileSearchOverlay";
import StoreCard from "@/components/client/StoreCard";
import { groceryCategories } from "@/data/mockData";
import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=400&fit=crop&q=80",
      title: "Farm Fresh Eggs",
      subtitle: "Now ¢25 – straight from the farm to your table",
      gradient: "from-orange-400 to-orange-500"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop&q=80",
      title: "Fresh Groceries",
      subtitle: "Quality produce delivered to your doorstep",
      gradient: "from-green-400 to-green-500"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop&q=80",
      title: "Premium Quality",
      subtitle: "Best prices on all your favorite items",
      gradient: "from-blue-400 to-blue-500"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    if (!isMobile) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isMobile, heroSlides.length]);

  // API state hooks for different product sections
  const featuredProducts = useApiState<Product[]>({
    initialData: [],
    onError: (error) =>
      toast.error(`Failed to load featured products: ${error}`),
  });

  const popularProducts = useApiState<Product[]>({
    initialData: [],
    onError: (error) =>
      toast.error(`Failed to load popular products: ${error}`),
  });

  const recentProducts = useApiState<Product[]>({
    initialData: [],
    onError: (error) => toast.error(`Failed to load recent products: ${error}`),
  });

  // Combined loading state
  const isLoading =
    featuredProducts.isLoading ||
    popularProducts.isLoading ||
    recentProducts.isLoading;

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      // Fetch featured products
      featuredProducts.execute(() => productService.getFeaturedProducts(8));

      // Fetch popular products
      popularProducts.execute(() => productService.getPopularProducts(4));

      // Fetch recent products
      recentProducts.execute(() => productService.getRecentProducts(4));
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleStoreClick = (storeName: string) => {
    navigate(`/stores?store=${storeName}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    navigate(`/categories?category=${categoryName}`);
  };

  // Categorized stores data
  const storesByCategory = {
    "Grocery Stores": [
      {
        name: "SHOPRITE",
        category: "Grocery & Supermarket",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:storefront",
        rating: 4.5,
        products: 850,
        description: "Ghana's leading supermarket chain",
      },
      {
        name: "PALACE MALL",
        category: "Grocery & Supermarket", 
        location: "Kumasi",
        logo: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:building-office",
        rating: 4.3,
        products: 650,
        description: "Premium shopping experience",
      },
      {
        name: "MELCOM",
        category: "General Goods",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:shopping-cart",
        rating: 4.2,
        products: 1200,
        description: "Everything you need under one roof",
      },
      {
        name: "GAME STORES",
        category: "Grocery & Electronics",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:gamepad",
        rating: 4.4,
        products: 920,
        description: "Great prices on groceries and more",
      },
    ],
    "Fresh Markets": [
      {
        name: "MAKOLA MARKET",
        category: "Fresh Produce",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:plant",
        rating: 4.1,
        products: 450,
        description: "Fresh fruits and vegetables daily",
      },
      {
        name: "KEJETIA MARKET",
        category: "Fresh Produce",
        location: "Kumasi",
        logo: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:leaf",
        rating: 4.0,
        products: 380,
        description: "Largest fresh produce market",
      },
      {
        name: "TEMA MARKET",
        category: "Fresh Produce",
        location: "Tema",
        logo: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:carrot",
        rating: 4.2,
        products: 320,
        description: "Quality fresh produce daily",
      },
      {
        name: "TAKORADI MARKET",
        category: "Fresh Produce", 
        location: "Takoradi",
        logo: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:apple",
        rating: 3.9,
        products: 280,
        description: "Western region's best market",
      },
    ],
    "Specialty Stores": [
      {
        name: "HEALTHY CHOICE",
        category: "Organic & Health Foods",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:heart-straight",
        rating: 4.6,
        products: 180,
        description: "Organic and health-focused products",
      },
      {
        name: "WINE CELLAR",
        category: "Beverages & Spirits",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:wine",
        rating: 4.5,
        products: 220,
        description: "Premium wines and beverages",
      },
      {
        name: "BAKER'S CORNER",
        category: "Bakery & Confectionery", 
        location: "Kumasi",
        logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:bread",
        rating: 4.4,
        products: 95,
        description: "Fresh baked goods daily",
      },
      {
        name: "MEAT MASTERS",
        category: "Butchery & Meat",
        location: "Accra",
        logo: "https://images.unsplash.com/photo-1588347818133-97b9eb9fc0ce?w=100&h=100&fit=crop&q=80",
        fallbackIcon: "ph:cooking",
        rating: 4.3,
        products: 150,
        description: "Quality meats and seafood",
      },
    ],
  };

  const popularStores = getPopularStores();

  // Mobile view remains similar to original but simplified
  if (isMobile) {
    return (
      <>
        <SEO
          title="Shop from Top Stores"
          description="Discover fresh groceries from Ghana's leading supermarkets. Browse categories, compare prices, and get fast delivery from Shoprite, Palace Mall, and more top stores."
          keywords="grocery shopping, Ghana supermarkets, fresh produce, online shopping, food delivery, Shoprite, Palace Mall"
        />

        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
        />

        <div className="min-h-screen bg-gray-50 pb-20 -mb-20">

          {/* Hero Banner Slider */}
          <div className="px-4 py-4 p">
            <div className="relative rounded-2xl overflow-hidden h-48 sm:h-52 md:h-56">
              <div className="flex transition-transform duration-300 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {heroSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`relative bg-gradient-to-r ${slide.gradient} flex-shrink-0 w-full h-full`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                    <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
                      <div>
                        <h2 className="text-white text-xl md:text-2xl font-bold mb-1">
                          {slide.title}
                        </h2>
                        <p className="text-white/90 text-sm md:text-base">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <button
                onClick={prevSlide}
                className="hidden absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full fle items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full hidden fle items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>

              {/* Slide indicators */}
              <div className="absolute bottom-6 md:bottom-8 left-10 md:left-12 transform -translate-x-1/2 flex gap-1">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Featured Shops */}
          <section className="px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Featured Shops
                </h2>
                <p className="text-sm text-gray-500">Top rated stores</p>
              </div>
              <Link to="/stores" className="text-primary text-sm font-medium">
                See All
              </Link>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {popularStores.slice(0, 6).map((store, index) => (
                <StoreCard
                  key={index}
                  store={store}
                  index={index}
                  handleStoreClick={handleStoreClick}
                  compact={true}
                />
              ))}
            </div>
          </section>

          {/* Categories Grid */}
          <section className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 gap-4">
              {groceryCategories.slice(1, 7).map((category, index) => (
                <div
                  key={category.name}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon icon={category.icon} className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                      <p className="text-xs text-gray-500">{category.count} items</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  // Desktop view - matching the uploaded design
  return (
    <>
      <SEO
        title="Shop from Top Stores"
        description="Discover fresh groceries from Ghana's leading supermarkets. Browse categories, compare prices, and get fast delivery from Shoprite, Palace Mall, and more top stores."
        keywords="grocery shopping, Ghana supermarkets, fresh produce, online shopping, food delivery, Shoprite, Palace Mall"
      />

      <div className="min-h-screen bg-gray50">
        <LandingHero />

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Categories */}
            <div className="col-span-3">
              <div className="bg-white border border-gray-300/30 rounded-lg shadow-sm p-6 sticky top-40">
                <h2 className="text-xl font-bold text-gray-900 mb-6">CATEGORY</h2>
                
                <div className="space-y-2">
                  {groceryCategories.map((category, index) => (
                    <div
                      key={category.name}
                      className={`flex items-center justify-between p-3 roundedlg cursor-pointer transition-all ${
                        selectedCategory === category.name
                          ? 'bg-red-50 border-l-4 border-primary'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          icon={category.icon}
                          className={`w-5 h-5 ${
                            selectedCategory === category.name
                              ? 'text-red-500'
                              : 'text-gray-600'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            selectedCategory === category.name
                              ? 'text-red-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {category.name}
                        </span>
                      </div>
                      <Plus
                        className={`w-4 h-4 ${
                          selectedCategory === category.name
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-9 space-y-8 md:space-y-16">
              {Object.entries(storesByCategory).map(([categoryName, stores]) => (
                <div key={categoryName}>
                  {/* Category Header */}
                  <div className="flex itemscenter mb-6">
                    <div className="w-14 h-14 border border-gray-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-gray-800 font-semibold text-xl">
                        {categoryName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 border-b h-fit border-gray-300 pb-1">
                      <h2 className="text-2xl font-bold text-gray-900 font-display text-center w-full">{categoryName}</h2>
                      {/* <div className="h-1 w-full bg-red-500 mt-1"></div> */}
                    </div>
                  </div>

                  {/* Stores Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {stores.map((store, index) => (
                      <div
                        key={store.name}
                        className="bg-white rounded-xl border border-gray-300/30 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => handleStoreClick(store.name)}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Store Logo/Icon */}
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                            {store.logo ? (
                              <img
                                src={store.logo}
                                alt={store.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Icon
                                icon={store.fallbackIcon}
                                className="w-8 h-8 text-gray-600"
                              />
                            )}
                          </div>

                          {/* Store Info */}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {store.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {store.category}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{store.location}</span>
                              </div>
                              {store.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{store.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Favorite Button */}
                          <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <Icon icon="ph:heart" className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* See More Button */}
              <div className="text-center py-8">
                <Link to="/stores">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 rounded-full border-gray-300 hover:border-red-500 hover:text-red-500"
                  >
                    See more...
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;