import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
import { DateFilterProvider } from '@/contexts/DateFilterContext';

interface SuperAdminPortalProps {
  children?: React.ReactNode;
}

const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ children }) => {
  return (
    <DateFilterProvider>
      <SuperAdminLayout>
        {children || <Outlet />}
      </SuperAdminLayout>
    </DateFilterProvider>
  );
};

export default SuperAdminPortal;