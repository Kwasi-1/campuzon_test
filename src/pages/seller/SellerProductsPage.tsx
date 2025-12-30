import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Select,
  EmptyState,
  Breadcrumb,
  Modal,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductStatus } from '@/types';

// Mock products data
const mockSellerProducts: Product[] = [
  {
    id: 'prod-1',
    storeID: 'store-1',
    name: 'iPhone 14 Pro Max',
    slug: 'iphone-14-pro-max',
    description: 'Latest iPhone with dynamic island',
    price: 5500,
    comparePrice: 6000,
    quantity: 12,
    minOrderQuantity: 1,
    maxOrderQuantity: 5,
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400'],
    thumbnail: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=200',
    category: 'electronics',
    tags: ['apple', 'iphone', 'smartphone'],
    status: 'active',
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 45,
    soldCount: 128,
    viewCount: 1250,
    dateCreated: '2024-10-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    storeID: 'store-1',
    name: 'AirPods Pro 2nd Gen',
    slug: 'airpods-pro-2nd-gen',
    description: 'Active noise cancellation',
    price: 850,
    comparePrice: 950,
    quantity: 35,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400'],
    thumbnail: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200',
    category: 'electronics',
    tags: ['apple', 'airpods', 'audio'],
    status: 'active',
    isActive: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 67,
    soldCount: 89,
    viewCount: 890,
    dateCreated: '2024-11-01T10:00:00Z',
  },
  {
    id: 'prod-3',
    storeID: 'store-1',
    name: 'MacBook Air M2',
    slug: 'macbook-air-m2',
    description: 'Thin and powerful laptop',
    price: 8200,
    comparePrice: null,
    quantity: 0,
    minOrderQuantity: 1,
    maxOrderQuantity: 2,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
    category: 'electronics',
    tags: ['apple', 'macbook', 'laptop'],
    status: 'sold_out',
    isActive: true,
    isFeatured: false,
    rating: 4.9,
    reviewCount: 28,
    soldCount: 42,
    viewCount: 650,
    dateCreated: '2024-09-20T10:00:00Z',
  },
  {
    id: 'prod-4',
    storeID: 'store-1',
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Flagship Android phone',
    price: 4800,
    comparePrice: 5200,
    quantity: 8,
    minOrderQuantity: 1,
    maxOrderQuantity: 3,
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'],
    thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200',
    category: 'electronics',
    tags: ['samsung', 'galaxy', 'smartphone'],
    status: 'draft',
    isActive: false,
    isFeatured: false,
    rating: null,
    reviewCount: 0,
    soldCount: 0,
    viewCount: 45,
    dateCreated: '2024-12-20T10:00:00Z',
  },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'paused', label: 'Paused' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'stock-low', label: 'Low Stock' },
  { value: 'best-selling', label: 'Best Selling' },
];

const getStatusConfig = (status: ProductStatus) => {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle };
    case 'draft':
      return { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Clock };
    case 'sold_out':
      return { label: 'Sold Out', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle };
    case 'paused':
      return { label: 'Paused', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Pause };
    case 'deleted':
      return { label: 'Deleted', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
  }
};

export function SellerProductsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...mockSellerProducts];

    // Filter by status
    if (statusFilter !== 'all') {
      products = products.filter((p) => p.status === statusFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        products.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'stock-low':
        products.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'best-selling':
        products.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    }

    return products;
  }, [searchQuery, statusFilter, sortBy]);

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate('/login');
    return null;
  }

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // In a real app, this would call an API
    console.log('Deleting product:', productToDelete?.id);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Seller Dashboard', href: '/seller/dashboard' },
          { label: 'Products' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your store products ({mockSellerProducts.length} total)
          </p>
        </div>

        <Link to="/seller/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
              className="w-full md:w-40"
            />

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={SORT_OPTIONS}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between"
        >
          <span className="text-sm font-medium">
            {selectedProducts.length} product(s) selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <EyeOff className="h-4 w-4 mr-1" />
              Deactivate
            </Button>
            <Button variant="outline" size="sm" className="text-red-600">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-16 w-16" />}
          title={searchQuery || statusFilter !== 'all' ? 'No matching products' : 'No products yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first product to start selling'
          }
          action={
            <Link to="/seller/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={selectedProducts.length === filteredProducts.length}
              onChange={selectAllProducts}
              className="rounded border-border"
            />
            <span>Select all ({filteredProducts.length})</span>
          </div>

          {/* Product Cards */}
          {filteredProducts.map((product, index) => {
            const statusConfig = getStatusConfig(product.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="mt-1 rounded border-border"
                      />

                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/products/${product.slug}`}
                              className="font-medium hover:text-primary transition-colors line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>

                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Price: </span>
                            <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                            {product.comparePrice && (
                              <span className="text-muted-foreground line-through ml-1">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stock: </span>
                            <span className={product.quantity === 0 ? 'text-red-500 font-semibold' : ''}>
                              {product.quantity}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sold: </span>
                            <span>{product.soldCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Views: </span>
                            <span>{product.viewCount}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          <Link to={`/seller/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link to={`/products/${product.slug}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
