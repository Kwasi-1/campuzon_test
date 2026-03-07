import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SEO from '@/components/SEO';
import StorePageLayout from '@/components/store/StorePageLayout';
import StoreCustomTable from '@/components/store/StoreCustomTable';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { isWithinInterval, parseISO } from 'date-fns';
import TableSkeleton from '@/components/ui/table-skeleton';
import StorePagination from '@/components/store/StorePagination';
import EmptyDateState from '@/components/shared/EmptyDateState';
import storeService, { StoreTransaction, TransactionFilters } from '@/services/storeService';
import { toast } from 'sonner';

const StoreTransactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<StoreTransaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const { selectedPeriod, dateRange, isFiltered, isLoading: dateLoading } = useDateFilter();

  const itemsPerPage = 20;

  // Fetch transactions from API
  const fetchTransactions = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const filters: TransactionFilters = {};
      
      // Apply filters
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (paymentFilter !== 'all') filters.paymentMethod = paymentFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (isFiltered && dateRange.from) {
        filters.dateFrom = dateRange.from.toISOString();
        filters.dateTo = dateRange.to?.toISOString();
      }

      const response = await storeService.getTransactions(page, itemsPerPage, filters);
      
      if (response.success && response.data) {
        setTransactions(response.data);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction summary
  const fetchTransactionSummary = async () => {
    try {
      const filters: Partial<TransactionFilters> = {};
      
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (isFiltered && dateRange.from) {
        filters.dateFrom = dateRange.from.toISOString();
        filters.dateTo = dateRange.to?.toISOString();
      }

      const response = await storeService.getTransactionSummary(selectedPeriod, filters);
      
      if (response.success && response.data) {
        setSummaryStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching transaction summary:', error);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, searchQuery, statusFilter, typeFilter, paymentFilter, categoryFilter, isFiltered, dateRange]);

  useEffect(() => {
    fetchTransactionSummary();
  }, [selectedPeriod, statusFilter, typeFilter, isFiltered, dateRange]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, paymentFilter, categoryFilter]);

  // Dashboard stats from API response or calculated locally
  const dashboardStats = useMemo(() => {
    if (summaryStats) {
      return [
        { label: 'Total Revenue', value: `₵${summaryStats.totalRevenue?.toLocaleString() || '0.00'}`, subtext: `${summaryStats.totalTransactions || 0} transactions` },
        { label: 'Completed Sales', value: summaryStats.completedSales?.toString() || '0', subtext: `₵${summaryStats.completedRevenue?.toLocaleString() || '0.00'} revenue` },
        { label: 'Pending Transactions', value: summaryStats.pendingTransactions?.toString() || '0', subtext: `₵${summaryStats.pendingAmount?.toLocaleString() || '0.00'} pending` },
        { label: 'Total Refunds', value: summaryStats.totalRefunds?.toString() || '0', subtext: `₵${summaryStats.refundAmount?.toLocaleString() || '0.00'} refunded` },
      ];
    }

    // Fallback to local calculation if API doesn't provide summary
    const totalRevenue = transactions
      .filter(t => t.type === 'sale' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunds = transactions
      .filter(t => t.type === 'refund' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const completedSales = transactions.filter(t => t.type === 'sale' && t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

    return [
      { label: 'Total Revenue', value: `₵${totalRevenue.toLocaleString()}`, subtext: `${transactions.length} transactions` },
      { label: 'Completed Sales', value: completedSales.toString(), subtext: `₵${totalRevenue.toLocaleString()} revenue` },
      { label: 'Pending Transactions', value: pendingTransactions.toString(), subtext: 'Awaiting completion' },
      { label: 'Total Refunds', value: transactions.filter(t => t.type === 'refund').length.toString(), subtext: `₵${totalRefunds.toLocaleString()} refunded` },
    ];
  }, [transactions, summaryStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  const filters = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' }
      ]
    },
    {
      label: 'Type',
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Sale', value: 'sale' },
        { label: 'Refund', value: 'refund' }
      ]
    },
    {
      label: 'Payment Method',
      value: paymentFilter,
      onChange: setPaymentFilter,
      options: [
        { label: 'All Payment', value: 'all' },
        { label: 'Mobile Money', value: 'mobile' },
        { label: 'Card', value: 'card' },
        { label: 'Cash', value: 'cash' }
      ]
    },
    {
      label: 'Category',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { label: 'All Categories', value: 'all' },
        { label: 'Groceries', value: 'groceries' },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Home & Garden', value: 'home & garden' }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="Store Transactions"
        description="View and manage your store's transaction history, revenue tracking, and payment analytics."
        keywords="transaction history, revenue tracking, payment analytics, store finances"
      />
      
      <StorePageLayout 
        title="Transactions"
        dashboardStats={dashboardStats}
      >
        <StoreCustomTable
          title="Transaction History"
          subtitle="Complete record of all store transactions"
          searchPlaceholder="Search transactions..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showDateFilter={true}
          filters={filters}
        >
          {isLoading || dateLoading ? (
            <TableSkeleton rows={itemsPerPage} columns={9} />
          ) : transactions.length === 0 ? (
            <EmptyDateState message="No transactions found for the selected date range" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TRANSACTION ID</TableHead>
                    <TableHead>ORDER ID</TableHead>
                    <TableHead>CUSTOMER</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>PAYMENT METHOD</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.orderId}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>₵{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                        {transaction.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <StorePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </StoreCustomTable>
      </StorePageLayout>
    </>
  );
};

export default StoreTransactions;