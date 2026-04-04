import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateFilter from "@/components/shared/DateFilter";

interface AdminTableProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
  showDateFilter?: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children: React.ReactNode;
}

const AdminTable: React.FC<AdminTableProps> = ({
  title,
  description,
  searchPlaceholder = "Search...",
  onSearch,
  filters = [],
  showDateFilter = false,
  actionButton,
  secondaryActionButton,
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.key} className="w-full sm:w-auto sm:min-w-48">
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {showDateFilter && <DateFilter />}

            {secondaryActionButton && (
              <Button
                variant="outline"
                onClick={secondaryActionButton.onClick}
                className="shrink-0"
              >
                {secondaryActionButton.icon}
                {secondaryActionButton.label}
              </Button>
            )}

            {actionButton && (
              <Button onClick={actionButton.onClick} className="shrink-0">
                {actionButton.icon}
                {actionButton.label}
              </Button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">{children}</div>
      </CardContent>
    </Card>
  );
};

export default AdminTable;