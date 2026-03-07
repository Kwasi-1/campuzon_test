
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  description?: string;
}

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg lg:p-7">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            View complete product information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">{product.category}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold">₵{product.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock</p>
              <p className="font-semibold">{product.stock} units</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge 
              variant={product.status === 'Active' ? 'default' : 'secondary'}
              className={product.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : ''}
            >
              {product.status}
            </Badge>
          </div>
          
          {product.description && (
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-sm">{product.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewModal;
