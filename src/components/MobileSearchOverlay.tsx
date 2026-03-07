
import React, { useState, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
    <div className={`fixed inset-0 z-50 bg-white transition-transform duration-300 mt-16 ${
      isClosing ? 'animate-slide-out-up' : 'animate-slide-in-down'
    }`}>
      {/* <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Search</h2>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="w-5 h-5" />
        </Button>
      </div> */}

      <div className="p-4">
        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products, stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-full bg-[#f4f7fb] outline-none ring-0 focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            autoFocus
          />
        </form>

        {searchHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-gray-500">
                Clear All
              </Button>
            </div>
            <div className="space-y-1">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(query)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-sm rounded-lg text-left"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{query}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div >
        <Button variant="ghost" size="sm" onClick={handleClose} className="absolute bottom-28 right-0 left-0 w-10 h-10 border mx-auto rounded-full bg-primary/5 text-primary">
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
