
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  description?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  mode: 'view' | 'edit' | 'add';
  onSave?: (product: Product) => void;
  onAdd?: (product: Omit<Product, 'id' | 'sku'>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  mode,
  onSave,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    supplier: '',
    price: 0,
    stock: 0,
    status: 'Active',
    image: '/placeholder.svg',
    description: ''
  });

  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: product.name,
        category: product.category,
        supplier: product.supplier,
        price: product.price,
        stock: product.stock,
        status: product.status,
        image: product.image,
        description: product.description || ''
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        category: '',
        supplier: '',
        price: 0,
        stock: 0,
        status: 'Active',
        image: '/placeholder.svg',
        description: ''
      });
    }
  }, [product, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit' && product && onSave) {
      onSave({
        ...product,
        ...formData
      });
    } else if (mode === 'add' && onAdd) {
      onAdd(formData);
    }
    
    onClose();
  };

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'Product Details';
      case 'edit': return 'Edit Product';
      case 'add': return 'Add New Product';
      default: return 'Product';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'view': return 'View product information and details';
      case 'edit': return 'Update product information';
      case 'add': return 'Add a new product to your inventory';
      default: return '';
    }
  };

  const isReadOnly = mode === 'view';

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 20) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="flex items-center space-x-4">
              <img 
                src={formData.image} 
                alt="Product"
                className="w-20 h-20 object-cover rounded-lg border"
              />
              {!isReadOnly && (
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                readOnly={isReadOnly}
                required={!isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {isReadOnly ? (
                <Input value={formData.category} readOnly />
              ) : (
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                readOnly={isReadOnly}
                required={!isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              {isReadOnly ? (
                <Badge className={formData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {formData.status}
                </Badge>
              ) : (
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₵)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                readOnly={isReadOnly}
                required={!isReadOnly}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              {isReadOnly ? (
                <div className="flex items-center space-x-2">
                  <Input value={formData.stock} readOnly />
                  <Badge className={getStockColor(formData.stock)}>
                    {formData.stock === 0 ? 'Out of Stock' : formData.stock < 20 ? 'Low Stock' : 'In Stock'}
                  </Badge>
                </div>
              ) : (
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  required
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              readOnly={isReadOnly}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit">
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
