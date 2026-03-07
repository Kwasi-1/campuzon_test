
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import DateFilter from '../shared/DateFilter';

interface FilterOption {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

interface StoreCustomTableProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  showDateFilter?: boolean;
  filters?: FilterOption[];
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  bulkActions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

const StoreCustomTable: React.FC<StoreCustomTableProps> = ({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  showAddButton = false,
  addButtonText = "Add",
  onAddClick,
  showDateFilter = false,
  filters = [],
  children,
  searchValue = "",
  onSearchChange,
  bulkActions,
  secondaryActions,
  isEmpty = false,
  emptyMessage = "No data available",
  onSort
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    if (onSort) {
      onSort(column, newDirection);
    }
  };

  const SortableHeader = ({ children, column }: { children: React.ReactNode; column: string }) => (
    <div 
      className="flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors"
      onClick={() => handleSort(column)}
    >
      {children}
      {sortColumn === column ? (
        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      ) : (
        <div className="w-3 h-3 opacity-30">
          <ArrowUp className="w-3 h-3" />
        </div>
      )}
    </div>
  );

  // Add SortableHeader to children if onSort is provided
  const enhancedChildren = React.isValidElement(children) ? 
    React.cloneElement(children as React.ReactElement, { 
      SortableHeader: onSort ? SortableHeader : undefined 
    }) : children;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6 h-full">
        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Button */}
            {filters.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            )}
          </div>

          {/* Date Filter and Action Buttons */}
          <div className="flex items-center gap-2">
            {showDateFilter && <DateFilter/>}
            {secondaryActions}
            {showAddButton && (
              <Button onClick={onAddClick}>
                <Plus className="w-4 h-4 mr-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkActions && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {bulkActions}
          </div>
        )}

        {/* Expanded Filters */}
        {showFilters && filters.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter, index) => (
                <div key={index}>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* View Settings and Manage Table */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm">
                View Settings
              </Button>
              <Button variant="outline" size="sm">
                Manage Table
              </Button>
            </div>
          </div>
        )}

        {/* Table Content or Empty State */}
        <div className="overflow-x-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
              <p className="text-gray-500 max-w-sm">{emptyMessage}</p>
            </div>
          ) : (
            enhancedChildren
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreCustomTable;
