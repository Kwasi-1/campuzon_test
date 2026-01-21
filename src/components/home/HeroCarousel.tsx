import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  image?: string;
}

interface HeroCarouselProps {
  slides?: CarouselSlide[];
  autoPlayInterval?: number;
}

const defaultSlides: CarouselSlide[] = [
  {
    id: "1",
    title: "Get help exactly when you need it",
    subtitle:
      "From shipping to returns, find answers to all of your questions.",
    ctaText: "Start here",
    ctaLink: "/help",
    bgColor: "bg-gradient-to-r from-teal-600 to-teal-500",
  },
  {
    id: "2",
    title: "Your campus marketplace",
    subtitle: "Buy and sell safely with students in your university.",
    ctaText: "Browse products",
    ctaLink: "/products",
    bgColor: "bg-gradient-to-r from-purple-600 to-purple-500",
  },
  {
    id: "3",
    title: "Deals you won't want to miss",
    subtitle: "Shop the latest discounts from campus sellers.",
    ctaText: "Shop deals",
    ctaLink: "/products?sort=discount",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
  },
];

export function HeroCarousel({
  slides = defaultSlides,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, goToNext, autoPlayInterval]);

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden">
      {/* Slide Content */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 ease-out",
          currentSlide.bgColor,
        )}
      >
        {currentSlide.image && (
          <img
            src={currentSlide.image}
            alt=""
            className="absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-90"
          />
        )}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {currentSlide.title}
          </h2>
          {currentSlide.subtitle && (
            <p className="text-white/90 text-lg mb-6">
              {currentSlide.subtitle}
            </p>
          )}
          <div>
            <Link
              to={currentSlide.ctaLink}
              className="inline-flex items-center px-6 py-3 bg-white text-foreground font-semibold rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              {currentSlide.ctaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <button
          onClick={goToPrevious}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={goToNext}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/70",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
