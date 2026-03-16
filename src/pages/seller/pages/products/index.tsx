import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { AddProductModal } from "@/components/modals";
import { useAuthStore } from "@/stores";
import type { Product, ProductStatus } from "@/types-new";
import {
  useMyStore,
  useStoreProducts,
  useDeleteProduct,
  useCurrency,
} from "@/hooks";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  SellerPageSearchFilters,
  SellerPageTemplate,
} from "../../components/SellerPageTemplate";
import { PillSidebar } from "@/components/ui/pill-sidebar";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "stock-low", label: "Low Stock" },
  { value: "best-selling", label: "Best Selling" },
];

const getStatusConfig = (status: ProductStatus) => {
  switch (status) {
    case "active":
      return {
        label: "Active",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      };
    case "draft":
      return {
        label: "Draft",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
        icon: Clock,
      };
    case "sold_out":
      return {
        label: "Sold Out",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: AlertCircle,
      };
    case "paused":
      return {
        label: "Paused",
        color:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        icon: Pause,
      };
    case "deleted":
      return {
        label: "Deleted",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: AlertCircle,
      };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700", icon: Clock };
  }
};

export function SellerProductsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data: store } = useMyStore();
  const { data: mockProducts, isLoading } = useStoreProducts(store?.id || "");
  const deleteProduct = useDeleteProduct();

  const filteredProducts = useMemo(() => {
    let products = [...(mockProducts || [])];

    if (statusFilter !== "all") {
      products = products.filter((p) => p.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    switch (sortBy) {
      case "oldest":
        products.sort(
          (a, b) =>
            new Date(a.dateCreated).getTime() -
            new Date(b.dateCreated).getTime(),
        );
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "stock-low":
        products.sort((a, b) => a.quantity - b.quantity);
        break;
      case "best-selling":
        products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "newest":
      default:
        products.sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime(),
        );
    }

    return products;
  }, [mockProducts, searchQuery, statusFilter, sortBy]);

  const { formatGHS } = useCurrency();

  const statusCounts = useMemo(() => {
    const all = mockProducts || [];
    return {
      all: all.length,
      active: all.filter((p) => p.status === "active").length,
      draft: all.filter((p) => p.status === "draft").length,
      sold_out: all.filter((p) => p.status === "sold_out").length,
      paused: all.filter((p) => p.status === "paused").length,
      lowStock: all.filter((p) => p.quantity > 0 && p.quantity <= 5).length,
    };
  }, [mockProducts]);

  if (!isAuthenticated || !user?.isOwner) {
    navigate("/login");
    return null;
  }

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct.mutateAsync(productToDelete.id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const sidebar = (
    <div className="space-y-6 xl:sticky xl:top-32">
      <PillSidebar
        options={[
          { key: "all", label: "All Products", count: statusCounts.all },
          { key: "active", label: "Active", count: statusCounts.active },
          { key: "draft", label: "Draft", count: statusCounts.draft },
          {
            key: "sold_out",
            label: "Sold Out",
            count: statusCounts.sold_out,
          },
          { key: "paused", label: "Paused", count: statusCounts.paused },
        ]}
        activeKey={statusFilter}
        onChange={setStatusFilter}
      />

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total", value: statusCounts.all },
          { label: "Active", value: statusCounts.active },
          { label: "Draft", value: statusCounts.draft },
          { label: "Low Stock", value: statusCounts.lowStock },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-gray-50 p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <SellerPageTemplate
      title="Products"
      description={`Manage your store products (${(mockProducts || []).length} total)`}
      headerActions={
        <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:flex-nowrap">
          <SellerPageSearchFilters
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search products..."
            selectValue={sortBy}
            onSelectChange={setSortBy}
            selectPlaceholder="Sort by"
            selectOptions={SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Button
            className="gap-2 rounded-full bg-[#1C1C1E] text-white hover:bg-black"
            onClick={() => setIsAddProductOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      }
      sidebar={sidebar}
    >
      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-primary/10 rounded-2xl flex items-center justify-between"
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
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border border-gray-100 bg-white rounded-[28px] overflow-hidden shadow-sm">
          <div className="text-center py-16 flex flex-col justify-center h-full items-center">
            <EmptyState
              icon={<Package className="h-16 w-16" />}
              title={
                searchQuery || statusFilter !== "all"
                  ? "No matching products"
                  : "No products yet"
              }
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first product to start selling"
              }
              action={
                <Button
                  className="gap-2 rounded-full bg-[#1C1C1E] text-white hover:bg-black"
                  onClick={() => setIsAddProductOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={selectedProducts.length === filteredProducts.length}
              onChange={selectAllProducts}
              className="rounded border-gray-300"
              aria-label="Select all products"
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
                <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="mt-1 rounded border-gray-300"
                      aria-label={`Select product ${product.name}`}
                    />

                    {/* Product Image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/products/${product.slug}`}
                            className="line-clamp-1 text-base font-semibold text-gray-900 transition-colors hover:text-emerald-600"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                            {product.description}
                          </p>
                        </div>

                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Stats Row */}
                      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-gray-500">Price: </span>
                          <span className="font-semibold text-gray-900">
                            {formatGHS(product.price)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-gray-400 line-through ml-1">
                              {formatGHS(product.comparePrice)}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Stock: </span>
                          <span
                            className={
                              product.quantity === 0
                                ? "text-red-500 font-semibold"
                                : "text-gray-900"
                            }
                          >
                            {product.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sold: </span>
                          <span className="text-gray-900">
                            {product.soldCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Views: </span>
                          <span className="text-gray-900">
                            {product.viewCount}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                        <Link to={`/seller/products/${product.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/products/${product.slug}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete{" "}
            <strong>{productToDelete?.name}</strong>? This action cannot be
            undone.
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
    </SellerPageTemplate>
  );
}
