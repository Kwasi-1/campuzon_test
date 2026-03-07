
import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'search' | 'shopping';
}

const EmptyState = ({ 
  title, 
  subtitle, 
  actionText, 
  onAction,
  icon = 'search'
}: EmptyStateProps) => {
  const IconComponent = icon === 'search' ? Search : ShoppingBag;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{subtitle}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
