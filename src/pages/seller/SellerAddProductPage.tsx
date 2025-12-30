import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Plus,
  Upload,
  Info,
  DollarSign,
  Package,
  Tag,
  FileText,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  Select,
  Breadcrumb,
  Alert,
  Badge,
} from '@/components/ui';
import { useAuthStore } from '@/stores';
import type { ProductStatus } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion & Clothing' },
  { value: 'books', label: 'Books & Stationery' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'beauty', label: 'Health & Beauty' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'home', label: 'Home & Living' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft - Not visible to customers' },
  { value: 'active', label: 'Active - Visible and purchasable' },
];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  quantity: string;
  minOrderQuantity: string;
  maxOrderQuantity: string;
  category: string;
  tags: string[];
  images: string[];
  status: ProductStatus;
  isFeatured: boolean;
}

// Mock existing product data for edit mode
const mockExistingProduct: ProductFormData = {
  name: 'iPhone 14 Pro Max',
  description: 'Latest iPhone with dynamic island, 48MP camera, and A16 Bionic chip. Perfect condition, comes with original accessories.',
  price: '5500',
  comparePrice: '6000',
  quantity: '12',
  minOrderQuantity: '1',
  maxOrderQuantity: '5',
  category: 'electronics',
  tags: ['apple', 'iphone', 'smartphone', 'new arrival'],
  images: [
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400',
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400',
  ],
  status: 'active',
  isFeatured: true,
};

export function SellerAddProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const isEditMode = !!productId;

  const [formData, setFormData] = useState<ProductFormData>(
    isEditMode
      ? mockExistingProduct
      : {
          name: '',
          description: '',
          price: '',
          comparePrice: '',
          quantity: '',
          minOrderQuantity: '1',
          maxOrderQuantity: '',
          category: '',
          tags: [],
          images: [],
          status: 'draft',
          isFeatured: false,
        }
  );

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated or not a store owner
  if (!isAuthenticated || !user?.isOwner) {
    navigate('/login');
    return null;
  }

  const handleChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);

    navigate('/seller/products');
  };

  const handleSaveDraft = async () => {
    setFormData((prev) => ({ ...prev, status: 'draft' }));
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    navigate('/seller/products');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumb
        items={[
          { label: 'Seller Dashboard', href: '/seller/dashboard' },
          { label: 'Products', href: '/seller/products' },
          { label: isEditMode ? 'Edit Product' : 'Add Product' },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : isEditMode ? 'Update Product' : 'Publish Product'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your product in detail..."
                  rows={5}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={[{ value: '', label: 'Select a category' }, ...CATEGORY_OPTIONS]}
                  className={errors.category ? 'border-red-500' : ''}
                />
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Images
            </h2>

            {errors.images && (
              <Alert variant="destructive" className="mb-4">
                {errors.images}
              </Alert>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Image previews */}
              {formData.images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-white text-xs rounded">
                      Main
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Upload button */}
              {formData.images.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add Image</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
              <Info className="h-4 w-4" />
              Upload up to 8 images. First image will be the main thumbnail.
            </p>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (GHS) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₵
                  </span>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Compare-at Price (GHS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₵
                  </span>
                  <Input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => handleChange('comparePrice', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Shows as original price with strikethrough
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity in Stock <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="0"
                  className={errors.quantity ? 'border-red-500' : ''}
                  min="0"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Min Order Quantity
                </label>
                <Input
                  type="number"
                  value={formData.minOrderQuantity}
                  onChange={(e) => handleChange('minOrderQuantity', e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Order Quantity
                </label>
                <Input
                  type="number"
                  value={formData.maxOrderQuantity}
                  onChange={(e) => handleChange('maxOrderQuantity', e.target.value)}
                  placeholder="No limit"
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </h2>

            <div className="flex gap-2 mb-3">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {formData.tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add tags to help customers find your product
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Product Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  options={STATUS_OPTIONS}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Featured Product</p>
                  <p className="text-sm text-muted-foreground">
                    Show this product in featured sections
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons (Mobile) */}
        <div className="flex gap-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  );
}
