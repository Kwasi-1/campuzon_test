
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStat {
  label: string;
  value: string | number;
  subtext?: string;
}

interface AdminPageLayoutProps {
  title: string;
  dashboardStats?: DashboardStat[];
  children: React.ReactNode;
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ 
  title, 
  dashboardStats, 
  children 
}) => {
  return (
    <div className="space-y-6 min-h-[calc(100vh-110px)]">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && dashboardStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Page Content */}
      <div className='h-full'>{children}</div>
    </div>
  );
};

export default AdminPageLayout;
