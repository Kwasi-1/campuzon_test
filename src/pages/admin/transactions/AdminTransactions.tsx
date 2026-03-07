import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import TransactionModal from "@/components/admin/TransactionModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import EmptyDateState from "@/components/shared/EmptyDateState";
import { useDateFilter } from "@/contexts/DateFilterContext";
import AdminDisbursements from "./AdminDisbursements";
import { isWithinInterval, parseISO } from "date-fns";
import adminTransactionsService from "@/services/adminTransactionsService";
import { Transaction } from "@/types";

const AdminTransactions = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const {
    selectedPeriod,
    dateRange,
    isFiltered,
    isLoading: dateLoading,
  } = useDateFilter();

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const list = await adminTransactionsService.getAllTransactions();
        setAllTransactions(list);
      } catch (e) {
        setAllTransactions([]);
        toast({
          title: "Failed to load transactions",
          description: (e as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchTransactions();
  }, [toast]);

  // Filter transactions based on search, filters, and date range
  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === "" ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      transaction.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesStore =
      storeFilter === "all" ||
      transaction.store.toLowerCase().includes(storeFilter.toLowerCase());

    // Apply date filter
    let matchesDate = true;
    if (isFiltered && dateRange.from && dateRange.to) {
      const transactionDate = parseISO(transaction.date);
      matchesDate = isWithinInterval(transactionDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    }

    return matchesSearch && matchesStatus && matchesStore && matchesDate;
  });

  // Calculate dashboard stats based on filtered data
  const completedTransactions = filteredTransactions.filter(
    (t) => t.status === "Completed"
  );
  const totalRevenue = completedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalCommission = completedTransactions.reduce(
    (sum, t) => sum + t.commission,
    0
  );
  const successRate =
    allTransactions.length > 0
      ? (completedTransactions.length / allTransactions.length) * 100
      : 0;

  const dashboardStats = [
    {
      label: "Total Revenue",
      value: `₵${totalRevenue.toFixed(2)}`,
      subtext: "+15.3% from last month",
    },
    {
      label: "Commission Earned",
      value: `₵${totalCommission.toFixed(2)}`,
      subtext: "10% platform fee",
    },
    {
      label: "Total Transactions",
      value: filteredTransactions.length.toString(),
      subtext: `${allTransactions.length} total`,
    },
    {
      label: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      subtext: "Payment success rate",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const exportTransactions = async () => {
    try {
      const blob = await adminTransactionsService.exportTransactions("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Transaction data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: "period",
      label: "Period",
      options: [
        { value: "all", label: "All Time" },
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
      ],
      value: periodFilter,
      onChange: setPeriodFilter,
    },
    {
      key: "store",
      label: "Store",
      options: [
        { value: "all", label: "All Stores" },
        { value: "supermart", label: "SuperMart Accra" },
        { value: "freshfoods", label: "Fresh Foods Ltd" },
        { value: "quickshop", label: "QuickShop Express" },
      ],
      value: storeFilter,
      onChange: setStoreFilter,
    },
  ];

  return (
    <>
      <SEO
        title="Transaction Management"
        description="Monitor and manage all platform transactions, payments, and delivery tracking."
        keywords="transaction management, payment tracking, delivery analytics, financial reports"
      />

      <AdminPageLayout title="Treansactions" dashboardStats={dashboardStats}>
        <AdminTable
          title="Transaction History"
          description="Monitor all platform transactions and payments"
          searchPlaceholder="Search transactions by ID, store, customer, or order..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={true}
          actionButton={{
            label: "Export Data",
            onClick: exportTransactions,
            icon: <Download className="w-4 h-4 mr-2" />,
          }}
        >
          {loading || dateLoading ? (
            <TableSkeleton rows={8} columns={11} />
          ) : filteredTransactions.length === 0 ? (
            <EmptyDateState message="No transactions found for the selected date range" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium font-mono">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="font-mono">
                      {transaction.orderId}
                    </TableCell>
                    <TableCell>{transaction.store}</TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    <TableCell className="font-medium">
                      ₵{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>₵{transaction.commission.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getDeliveryStatusColor(
                          transaction.deliveryStatus
                        )}
                      >
                        {transaction.deliveryStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(transaction.date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default AdminTransactions;
