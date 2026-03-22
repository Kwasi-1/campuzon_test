
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStat {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}

interface AdminPageLayoutProps {
  title: string;
  headerActions?: React.ReactNode;
  dashboardStats?: DashboardStat[];
  isLoading?: boolean;
  children: React.ReactNode;
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ 
  title, 
  headerActions,
  dashboardStats, 
  isLoading,
  children 
}) => {
  return (
    <div className="space-y-6 min-h-[calc(100vh-110px)]">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && dashboardStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className={`border border-gray-200 relative ${stat.highlight ? "ring-2 ring-yellow-300/60" : ""}`}>
              <CardContent className="p-6">
                {stat.highlight && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="text-3xl font-bold text-gray-900">
                    {isLoading ? <Skeleton className="h-9 w-24 rounded-md" /> : stat.value}
                  </div>
                  {isLoading && stat.subtext ? (
                    <Skeleton className="h-4 w-32 rounded-md" />
                  ) : stat.subtext ? (
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  ) : null}
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
