
import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
  className?: string;
}

const Hero = ({ title, subtitle, children, className = "" }: HeroProps) => {
 const backgroundImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=1080&fit=crop&q=80";

  const heroStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(51, 102, 153,  0.9), rgba(51, 102, 153, 0.9)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

    const isLanding = window.location.pathname === '/';

    const heightClass = isLanding ? 'h-[calc(100vh-110px)]' : 'py-16';

  return (
    <section 
      className={`bg-primary text-white ${className} ${heightClass}`}
      // style={heroStyle}
    >
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center">
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-display uppercase mb-3 md:mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base md:text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};

export default Hero;
