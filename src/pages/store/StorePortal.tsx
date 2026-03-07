
import React from 'react';
import { Outlet } from 'react-router-dom';
import StoreLayout from '@/components/store/StoreLayout';
import { DateFilterProvider } from '@/contexts/DateFilterContext';

interface StorePortalProps {
  children?: React.ReactNode;
}

const StorePortal: React.FC<StorePortalProps> = ({ children }) => {
  return (
    <DateFilterProvider>
      <StoreLayout>
        {children || <Outlet />}
      </StoreLayout>
    </DateFilterProvider>
  );
};

export default StorePortal;
