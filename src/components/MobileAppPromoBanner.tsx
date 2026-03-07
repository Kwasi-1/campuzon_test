import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Star, ArrowRight } from 'lucide-react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Custom AnimatedText component
const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(' ');
  
  return (
    <div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut'
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const MobileAppPromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const promoTexts = [
    "Get 20% OFF your first order with our mobile app! 📱",
    "Shop faster, save more with exclusive app deals! 🛍️",
    "Download now and enjoy free delivery on your first 3 orders! 🚚"
  ];

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % promoTexts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, promoTexts.length]);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem('appPromoBannerDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('appPromoBannerDismissed', 'true');
  };

  const handleAppStoreClick = (store: 'ios' | 'android') => {
    // Track app store click
    console.log(`${store} app store clicked`);
    // Add your app store URLs here
    if (store === 'ios') {
      window.open('https://apps.apple.com/your-app', '_blank');
    } else {
      window.open('https://play.google.com/store/apps/details?id=your.app', '_blank');
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * 100,
                opacity: 0
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * 100,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}

          {/* Gradient Orbs */}
          <motion.div
            className="absolute -left-20 -top-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute -right-20 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Moving Lines */}
          <motion.div
            className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 containe mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between py-1 md:py-2">
            <div className="flex items-center space-x-3 md:space-x-6 flex-1">
              {/* Mobile Phone Icon with Animation */}
              <motion.div
                className="flex-shrink-0"
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className="hidden w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl md:flex items-center justify-center shadow-lg">
                  <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </motion.div>

              {/* Animated Text Content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-white text-sm md:text-base font-medium"
                  >
                    <AnimatedText
                      text={promoTexts[currentTextIndex]}
                      className="text-white"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Rating Stars with Animation */}
                <motion.div 
                  className="hidden md:flex items-center space-x-1 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 0.7 + (i * 0.1),
                        type: 'spring',
                        stiffness: 200
                      }}
                    >
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                  <span className="text-xs text-gray-300 ml-2">4.8 • 10K+ downloads</span>
                </motion.div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* App Store Buttons */}
              <div className="hidden sm:flex space-x-2">
                <motion.button
                  onClick={() => handleAppStoreClick('ios')}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon icon="mdi:apple" className="w-4 h-4 text-white" />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Download on</div>
                    <div className="text-xs font-semibold text-white leading-none">App Store</div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleAppStoreClick('android')}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon icon="lineicons:play-store" className="w-4 h-4 text-white" />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-xs font-semibold text-white leading-none">Google Play</div>
                  </div>
                </motion.button>
              </div>

              {/* Mobile Download Button */}
              <div className="sm:hidden">
                <motion.button
                  onClick={() => {
                    // Detect device and redirect accordingly
                    const userAgent = navigator.userAgent;
                    if (/iPad|iPhone|iPod/.test(userAgent)) {
                      handleAppStoreClick('ios');
                    } else {
                      handleAppStoreClick('android');
                    }
                  }}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* <Download className="w-4 h-4" /> */}
                  <span>GET</span>
                  {/* <ArrowRight className="w-3 h-3" /> */}
                </motion.button>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Progress Bar for Text Animation */}
          <div className="w-full bg-white/10 rounded-full h-0.5 mb-1">
            <motion.div
              className="bg-primary h-0.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: 4, 
                ease: 'linear',
                repeat: Infinity 
              }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileAppPromoBanner;