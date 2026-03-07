
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Copy, CreditCard, Package, Truck, Store, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  orderId: string;
  store: string;
  customer: string;
  amount: number;
  commission: number;
  status: string;
  paymentMethod: string;
  date: string;
  deliveryStatus: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const { toast } = useToast();

  if (!transaction) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock additional transaction details
  const transactionDetails = {
    customerEmail: 'customer@example.com',
    customerPhone: '+233 24 123 4567',
    storeAddress: '123 Main Street, Accra',
    deliveryAddress: '456 Oak Avenue, Accra',
    items: [
      { name: 'Fresh Tomatoes', quantity: 2, price: 10.00 },
      { name: 'Organic Bananas', quantity: 1, price: 8.00 },
      { name: 'Bread Loaf', quantity: 3, price: 9.75 }
    ],
    subtotal: 27.75,
    deliveryFee: 5.00,
    tax: 2.25,
    discount: 0.00,
    paymentDetails: {
      cardLast4: '****1234',
      authCode: 'AUTH123456',
      referenceNumber: 'REF789012'
    },
    timeline: [
      { time: '10:30 AM', event: 'Order placed', status: 'completed' },
      { time: '10:32 AM', event: 'Payment confirmed', status: 'completed' },
      { time: '10:35 AM', event: 'Order accepted by store', status: 'completed' },
      { time: '11:00 AM', event: 'Order prepared', status: 'completed' },
      { time: '11:15 AM', event: 'Pickup by rider', status: 'completed' },
      { time: '11:45 AM', event: 'Delivered to customer', status: 'completed' }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Transaction ID</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{transaction.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Order ID</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{transaction.orderId}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.orderId, 'Order ID')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Date & Time</Label>
                <p className="font-medium">{transaction.date}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Payment Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Delivery Status</Label>
                <div className="mt-1">
                  <Badge className={getDeliveryStatusColor(transaction.deliveryStatus)}>
                    {transaction.deliveryStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Payment Method</Label>
                <p className="font-medium">{transaction.paymentMethod}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Financial Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-700">₵{transaction.amount.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Platform Commission</p>
                <p className="text-2xl font-bold text-green-700">₵{transaction.commission.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Store Earnings</p>
                <p className="text-2xl font-bold text-purple-700">₵{(transaction.amount - transaction.commission).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{transaction.store}</p>
                <p className="text-sm text-gray-600">{transactionDetails.storeAddress}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{transaction.customer}</p>
                <p className="text-sm text-gray-600">{transactionDetails.customerEmail}</p>
                <p className="text-sm text-gray-600">{transactionDetails.customerPhone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-center">Quantity</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionDetails.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">₵{(item.price / item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-medium">₵{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t font-medium">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-right">₵{transactionDetails.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right">Delivery Fee:</td>
                    <td className="px-4 py-2 text-right">₵{transactionDetails.deliveryFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right">Tax:</td>
                    <td className="px-4 py-2 text-right">₵{transactionDetails.tax.toFixed(2)}</td>
                  </tr>
                  <tr className="text-lg">
                    <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                    <td className="px-4 py-2 text-right">₵{transaction.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <Separator />

          {/* Order Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Order Timeline
            </h3>
            <div className="space-y-3">
              {transactionDetails.timeline.map((event, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${event.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-gray-500">{event.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {transaction.paymentMethod !== 'Cash on Delivery' && (
            <>
              <Separator />
              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Card Number</Label>
                    <p className="font-mono">{transactionDetails.paymentDetails.cardLast4}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Authorization Code</Label>
                    <p className="font-mono">{transactionDetails.paymentDetails.authCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Reference Number</Label>
                    <p className="font-mono">{transactionDetails.paymentDetails.referenceNumber}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
