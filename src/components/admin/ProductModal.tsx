
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, TrendingUp, TrendingDown, Eye, AlertTriangle, BarChart3 } from 'lucide-react';
import { Product, ProductStatus } from '@/types-new';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  mode: 'view' | 'edit' | 'suspend';
  onSave: (product: any) => void;
  onSuspend: (productId: any, reason: string, duration: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  mode,
  onSave,
  onSuspend
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    status: product?.status || 'active'
  });

  const [suspendData, setSuspendData] = useState({
    reason: '',
    duration: '7-days'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit' && product) {
      onSave({ ...product, ...formData });
    } else if (mode === 'suspend' && product) {
      onSuspend(product.id, suspendData.reason, suspendData.duration);
    }
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold_out': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'Product Details';
      case 'edit': return 'Edit Product';
      case 'suspend': return 'Suspend Product';
      default: return 'Product';
    }
  };

  // Mock analytics data
  const analyticsData = {
    totalViews: product?.viewCount || 0,
    totalSales: product?.soldCount || 0,
    conversionRate: product ? ((product.soldCount! / Math.max(product.viewCount!, 1)) * 100).toFixed(1) : '0',
    revenue: product ? (product.price * product.soldCount!).toFixed(2) : '0',
    weeklyViews: [45, 52, 38, 61, 42, 55, 48],
    weeklySales: [12, 18, 8, 22, 15, 19, 14]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'view' && product && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Product Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <p className="text-gray-600 mt-1">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Store</Label>
                      <p className="font-medium">{product.store?.name || "Unknown"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Price</Label>
                      <p className="font-medium text-xl">₵{product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Stock</Label>
                      <p className={`font-medium ${product.quantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Date Added</Label>
                      <p className="font-medium">{new Date(product.dateCreated || new Date()).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Views</Label>
                      <p className="font-medium flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {product.viewCount}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Sales</Label>
                      <p className="font-medium">{product.soldCount} sold</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-600">Total Views</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{analyticsData.totalViews}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600">Total Sales</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{analyticsData.totalSales}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-purple-600">Conversion Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{analyticsData.conversionRate}%</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-yellow-600">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700">₵{analyticsData.revenue}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Weekly Views Trend</h4>
                    <div className="space-y-2">
                      {analyticsData.weeklyViews.map((views, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm w-16">Day {index + 1}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(views / Math.max(...analyticsData.weeklyViews)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm w-8">{views}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Weekly Sales Trend</h4>
                    <div className="space-y-2">
                      {analyticsData.weeklySales.map((sales, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm w-16">Day {index + 1}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(sales / Math.max(...analyticsData.weeklySales)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm w-8">{sales}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {mode === 'suspend' && product && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Suspend Product: {product.name}</p>
                  <p className="text-sm text-red-600">This action will remove the product from public listings</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Suspension</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for suspension..."
                  value={suspendData.reason}
                  onChange={(e) => setSuspendData({ ...suspendData, reason: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={suspendData.duration} onValueChange={(value) => setSuspendData({ ...suspendData, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7-days">7 Days</SelectItem>
                    <SelectItem value="30-days">30 Days</SelectItem>
                    <SelectItem value="90-days">90 Days</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Grains">Grains</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₵)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold_out">Out of Stock</SelectItem>
                      <SelectItem value="draft">Under Review</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {mode !== 'view' && (
              <Button type="submit" className={mode === 'suspend' ? 'bg-red-600 hover:bg-red-700' : ''}>
                {mode === 'edit' ? 'Save Changes' : 'Suspend Product'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
