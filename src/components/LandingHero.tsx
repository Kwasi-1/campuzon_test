import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CheckCircle } from 'lucide-react';

const LandingHero = () => {
  // Grocery-focused hero content
  const groceryItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&q=80",
      alt: "Fresh Vegetables"
    },
    {
      id: 2, 
      image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop&q=80",
      alt: "Fresh Fruits"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&h=400&fit=crop&q=80",
      alt: "Dairy Products"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop&q=80",
      alt: "Bakery Items"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80",
      alt: "Meat & Seafood"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&q=80",
      alt: "Pantry Essentials"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black/90 min-h-[600px] lg:min-h-[700px] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-cover bg-right" style={{
          backgroundImage: `url("https://media.istockphoto.com/id/1328853722/photo/over-the-shoulder-view-of-young-asian-woman-doing-home-delivery-grocery-shopping-online-with.jpg?s=612x612&w=0&k=20&c=OXmKDgC3g3nb8mcG1bxP4WLqyjHvdZ9yWfY1gO9jAYA=")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] lg:min-h-[700px] py-12 ml-20 2xl:ml-0">
          
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] xl:text-7xl 2xl:text-[80px] font-semibold xl:leading-[1.2] lg:leading-tight font-display -mr-10">
                Brand New
                <br />
                <span className="texttransparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  Fresh Collection
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 font-light leading-relaxed border-l-4 border-red-500 pl-6">
                Discover Ghana's freshest groceries — premium quality, locally sourced, and delivered to your doorstep.
              </p>
            </div>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg font-medium">Fresh Daily</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg font-medium">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg font-medium">Fast Delivery</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link to="/categories">
                <Button 
                  size="lg" 
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  EXPLORE GROCERIES
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Hexagonal Product Showcase */}
          <div className="hidden relative items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main Hexagonal Grid */}
              <div className="grid grid-cols-3 gap-4">
                {groceryItems.map((item, index) => {
                  const positions = [
                    'col-start-2', // Top center
                    'col-start-1 row-start-2', // Middle left  
                    'col-start-3 row-start-2', // Middle right
                    'col-start-2 row-start-3', // Bottom center
                    'col-start-1 row-start-3', // Bottom left
                    'col-start-3 row-start-3', // Bottom right
                  ];
                  
                  return (
                    <div 
                      key={item.id}
                      className={`${positions[index]} relative group`}
                    >
                      <div className="hexagon-container transform hover:scale-110 transition-all duration-300">
                        <div 
                          className="hexagon bg-cover bg-center shadow-2xl"
                          style={{
                            backgroundImage: `url(${item.image})`,
                            width: '120px',
                            height: '104px',
                          }}
                        >
                          <div className="hexagon-overlay bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Elements */}
              {/* <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-400 rounded-full animate-bounce opacity-80" />
              <div className="absolute -bottom-6 -right-6 w-6 h-6 bg-red-500 rounded-full animate-pulse opacity-80" />
              <div className="absolute top-1/2 -left-8 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-60" /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="hidden absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent bg-blend-saturation" />
    </section>
  );
};

export default LandingHero;