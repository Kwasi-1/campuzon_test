import React from 'react';
import { CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDateFilter } from '@/contexts/DateFilterContext';

interface EmptyDateStateProps {
  message?: string;
  showResetButton?: boolean;
}

const EmptyDateState: React.FC<EmptyDateStateProps> = ({ 
  message = "No information available for this date", 
  showResetButton = true 
}) => {
  const { resetToToday, selectedPeriod } = useDateFilter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
        <CalendarX className="w-full h-full" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
      <p className="text-gray-600 text-center mb-4 max-w-md">
        {message} for the selected period "{selectedPeriod}".
      </p>
      {/* {showResetButton && (
        <Button 
          variant="outline" 
          onClick={resetToToday}
          className="mt-2"
        >
          Reset to Today
        </Button>
      )} */}
    </div>
  );
};

export default EmptyDateState;