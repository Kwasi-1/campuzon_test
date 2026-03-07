
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { DateFilterProvider } from '@/contexts/DateFilterContext';

interface AdminPortalProps {
  children?: React.ReactNode;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ children }) => {
  return (
    <DateFilterProvider>
      <AdminLayout>
        {children || <Outlet />}
      </AdminLayout>
    </DateFilterProvider>
  );
};

export default AdminPortal;
