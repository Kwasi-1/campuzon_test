
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order, OrderItem } from '@/types';

interface OrderViewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderViewModal: React.FC<OrderViewModalProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preparing': return 'bg-yellow-100 text-yellow-800';
      case 'Ready': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock order items for demonstration
  const mockOrderItems = [
    { id: 1, name: 'Fresh Bananas', quantity: 2, price: 15.00 },
    { id: 2, name: 'Bread Loaf', quantity: 1, price: 8.00 },
    { id: 3, name: 'Coca Cola 500ml', quantity: 3, price: 5.50 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete information for order {order.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{order.id}</h3>
              <p className="text-sm text-gray-600">{order.date}</p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="font-medium mb-2">Customer Information</h4>
            <div className="space-y-1">
              <p><span className="font-medium">Name:</span> {order.customer}</p>
              <p><span className="font-medium">Phone:</span> {order.phone}</p>
              <p><span className="font-medium">Address:</span> {order.address || 'No address provided'}</p>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-3">Order Items</h4>
            <div className="space-y-2">
              {mockOrderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₵{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₵{(order.amount * 0.9).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>₵{(order.amount * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>₵{order.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderViewModal;
