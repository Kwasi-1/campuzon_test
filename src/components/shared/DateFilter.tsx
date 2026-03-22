
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useDateFilter, FilterPeriod } from "@/contexts/DateFilterContext";

const DateFilter = () => {
  const { selectedPeriod, setSelectedPeriod, dateRange, setDateRange, setIsLoading } = useDateFilter();
  const [showCustomDate, setShowCustomDate] = useState(false);

  const filters: FilterPeriod[] = [
    "Today",
    "This Month", 
    "This Year",
    "Last Year",
    "All Time",
    "Custom Date",
  ];

  const handleFilterClick = async (filter: FilterPeriod) => {
    setIsLoading(true);
    setSelectedPeriod(filter);
    
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastYear = new Date(today.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);

    switch (filter) {
      case 'Today':
        setDateRange({ from: today, to: today });
        break;
      case 'This Month':
        setDateRange({ from: startOfMonth, to: today });
        break;
      case 'This Year':
        setDateRange({ from: startOfYear, to: today });
        break;
      case 'Last Year':
        setDateRange({ from: lastYear, to: endOfLastYear });
        break;
      case 'All Time':
        setDateRange({ from: undefined, to: undefined });
        break;
      case 'Custom Date':
        setShowCustomDate(true);
        break;
    }
    
    // Simulate loading time for data fetching
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-white dark:bg-[#e0e6e930] border border-gray-200 dark:border-gray-700 rounded-lg p-[5px]">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`px-3 py-[5px] rounded-md text-xs md:text-[13px] cursor-pointer
              ${
                selectedPeriod === filter
                  ? "bg-white dark:bg-accent border border-[#e5e7eb] dark:border-[#2f3031] text-black dark:text-white focus:border-[#e5e7eb]"
                  : "hover:text-gray-400 text-[#929292] dark:text-[#b0b0b0]"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {selectedPeriod === 'Custom Date' && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, 'MMM dd') : 'From date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-gray-400">-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, 'MMM dd') : 'To date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
