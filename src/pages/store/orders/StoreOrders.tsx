import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import StorePageLayout from '@/components/store/StorePageLayout';
import StoreCustomTable from '@/components/store/StoreCustomTable';
import OrderViewModal from '@/components/store/OrderViewModal';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { isWithinInterval, parseISO } from 'date-fns';
import TableSkeleton from '@/components/ui/table-skeleton';
import StorePagination from '@/components/store/StorePagination';
import EmptyDateState from '@/components/shared/EmptyDateState';
import storeService, { StoreOrder, OrderFilters } from '@/services/storeService';
import { toast } from 'sonner';

const StoreOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { selectedPeriod, dateRange, isFiltered, isLoading: dateLoading } = useDateFilter();

  const itemsPerPage = 15;

  // Fetch orders from API
  const fetchOrders = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const filters: OrderFilters = {};
      
      // Apply filters
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (paymentFilter !== 'all') filters.paymentStatus = paymentFilter;
      if (isFiltered && dateRange.from) {
        filters.dateFrom = dateRange.from.toISOString();
        filters.dateTo = dateRange.to?.toISOString();
      }

      const response = await storeService.getOrders(page, itemsPerPage, filters);
      
      if (response.success && response.data) {
        setOrders(response.data);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, statusFilter, priorityFilter, paymentFilter, isFiltered, dateRange]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchOrders(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Dashboard stats based on current data
  const dashboardStats = useMemo(() => [
    { label: 'Total Orders', value: totalItems },
    { label: 'Preparing Orders', value: orders.filter(o => o.status === 'preparing').length },
    { label: 'Ready Orders', value: orders.filter(o => o.status === 'ready').length },
    { 
      label: 'Average Order Value', 
      value: `₵${orders.length ? (orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length).toFixed(2) : '0.00'}` 
    },
  ], [orders, totalItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: StoreOrder['status']) => {
    setIsUpdating(orderId);
    try {
      const updatedOrder = await storeService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      toast.success(`Order ${orderId} has been marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
      console.error('Error updating order:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleViewOrder = async (order: StoreOrder) => {
    try {
      // Fetch full order details
      const fullOrder = await storeService.getOrder(order.id);
      setSelectedOrder(fullOrder);
      setViewModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order details');
    }
  };

  const handleRefresh = () => {
    fetchOrders(currentPage);
  };

  const filters = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Preparing', value: 'preparing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      label: 'Priority', 
      value: priorityFilter,
      onChange: setPriorityFilter,
      options: [
        { label: 'All Priority', value: 'all' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
      ]
    },
    {
      label: 'Payment',
      value: paymentFilter,
      onChange: setPaymentFilter,
      options: [
        { label: 'All Payment', value: 'all' },
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Refunded', value: 'refunded' }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="Store Orders"
        description="Manage customer orders, update order status, and track deliveries for your store."
        keywords="order management, customer orders, delivery tracking, store orders"
      />
      
      <StorePageLayout 
        title="Orders"
        dashboardStats={dashboardStats}
        actions={
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      >
        <StoreCustomTable
          title="Customer Orders"
          subtitle="Manage and track customer orders"
          searchPlaceholder="Search orders..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showDateFilter={true}
          filters={filters}
        >
          {isLoading || dateLoading ? (
            <TableSkeleton rows={itemsPerPage} columns={8} />
          ) : orders.length === 0 ? (
            <EmptyDateState message="No orders found for the selected criteria" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ORDER ID</TableHead>
                    <TableHead>CUSTOMER</TableHead>
                    <TableHead>ITEMS</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>PRIORITY</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items?.length || 0} items</TableCell>
                      <TableCell>₵{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.priority === 'high' ? 'destructive' : 
                          order.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              disabled={isUpdating === order.id}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              {isUpdating === order.id ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Start
                            </Button>
                          )}
                          
                          {order.status === 'preparing' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                disabled={isUpdating === order.id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {isUpdating === order.id ? (
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Ready
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                disabled={isUpdating === order.id}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'ready' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              disabled={isUpdating === order.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isUpdating === order.id ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Delivered
                            </Button>
                          )}
                        </div>
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

      {/* Order View Modal */}
      <OrderViewModal
        order={selectedOrder ? {
          id: selectedOrder.id,
          customer: selectedOrder.customerName,
          amount: selectedOrder.totalAmount,
          status: selectedOrder.status as any,
          date: selectedOrder.createdAt,
          phone: selectedOrder.customerPhone,
          address: selectedOrder.deliveryAddress,
          paymentMethod: selectedOrder.paymentMethod,
          priority: selectedOrder.priority as any,
          items: selectedOrder.items?.map(item => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: '',
            description: '',
            category: '',
            inStock: true,
            discount: 0,
            originalPrice: item.price,
            rating: 0,
            reviews: 0
          })) || [],
          total: selectedOrder.totalAmount,
          createdAt: selectedOrder.createdAt,
          deliveryAddress: selectedOrder.deliveryAddress,
          itemCount: selectedOrder.items?.length || 0,
          deliveryMethod: selectedOrder.deliveryMethod || 'Standard'
        } : null}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />
    </>
  );
};

export default StoreOrders;