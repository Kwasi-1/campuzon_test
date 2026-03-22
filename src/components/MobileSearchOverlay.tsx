
import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SearchHeader } from './layout/SearchHeader';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearchOverlay = ({ isOpen, onClose }: MobileSearchOverlayProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      handleClose();
      setSearchQuery('');
    }
  };

  const handleHistoryClick = (query: string) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white transition-transform duration-300 ${
        isClosing ? "animate-slide-out-up" : "animate-slide-in-down"
      }`}
    >
      <SearchHeader
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={() => handleSearch({ preventDefault: () => {} } as any)}
        onBack={handleClose}
        placeholder="Search products, stores..."
        autoFocus
      />

      <div className="p-5 flex flex-col gap-8">
        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
                Recent Searches
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
              >
                <Trash2 className="h-[18px] w-[18px]" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(query)}
                  className="px-4 py-2 bg-[#f4f7fb] text-[13.5px] font-medium text-gray-600 rounded-full hover:bg-gray-200 transition-colors leading-none"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Recommendations
          </h3>
          <div className="space-y-1 -mx-5 px-5">
            {[
              { label: "Daily Deals", href: "/products?filter=deals" },
              { label: "APP ONLY OFFER", href: "/products?filter=offers" },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.href);
                  handleClose();
                }}
                className="w-full flex items-center justify-between py-4 group hover:bg-gray-50 transition-colors"
              >
                <span className="text-[15px] font-semibold text-gray-800 group-hover:text-primary">
                  {item.label}
                </span>
                <ChevronRight className="h-4.5 w-4.5 text-gray-300 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
