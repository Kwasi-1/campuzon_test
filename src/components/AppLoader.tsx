import React from 'react';

interface AppLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const AppLoader = ({ size = 'md', text, className = '' }: AppLoaderProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Logo with spinning animation */}
        <div className="animate-spin relative">
          <div className={`${sizeClasses[size]} rounded-full border-4 border-primary/20 border-t-primary`} />
        </div>
        
        {/* Tobra Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} font-bold text-primary`}>
            T
          </div>
        </div>
      </div>
      
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]} text-center`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default AppLoader;