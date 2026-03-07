
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type FilterPeriod = 'Today' | 'This Month' | 'This Year' | 'Last Year' | 'All Time' | 'Custom Date';

interface DateFilterContextType {
  selectedPeriod: FilterPeriod;
  setSelectedPeriod: (period: FilterPeriod) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isFiltered: boolean;
  resetToToday: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

export const DateFilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('Today');
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(), to: new Date() });
  const [isLoading, setIsLoading] = useState(false);

  const isFiltered = selectedPeriod !== 'All Time';

  const resetToToday = () => {
    setSelectedPeriod('Today');
    const today = new Date();
    setDateRange({ from: today, to: today });
  };

  // Reset filter when navigating between pages (detected by route changes)
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      resetToToday();
    };

    const handleRouteChange = () => {
      // Small delay to ensure route change is complete
      setTimeout(() => resetToToday(), 100);
    };

    // Listen for route changes in React Router
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <DateFilterContext.Provider value={{
      selectedPeriod,
      setSelectedPeriod,
      dateRange,
      setDateRange,
      isFiltered,
      resetToToday,
      isLoading,
      setIsLoading
    }}>
      {children}
    </DateFilterContext.Provider>
  );
};
