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
  MoreHorizontal,
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
import type {
  AddProductModalSavePayload,
  ProductModalMode,
} from "@/components/modals/AddProductModal";
import { useAuthStore } from "@/stores";
import type { Product, ProductStatus } from "@/types-new";
import {
  useMyStore,
  useStoreProducts,
  useDeleteProduct,
  useCurrency,
} from "@/hooks";
import { mockProducts } from "@/lib/mockData";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  SellerPageSearchFilters,
  SellerPageTemplate,
} from "../../components/SellerPageTemplate";
import { PillSidebar } from "@/components/ui/pill-sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const USE_PREVIEW_MOCK_DATA = true;

function createPreviewProducts(): Product[] {
  const previewStatuses: ProductStatus[] = [
    "active",
    "active",
    "draft",
    "sold_out",
    "paused",
    "active",
    "draft",
    "active",
    "sold_out",
    "paused",
    "active",
    "active",
  ];

  return mockProducts.slice(0, 12).map((product, index) => ({
    ...product,
    id: `preview-${product.id}-${index}`,
    status: previewStatuses[index % previewStatuses.length],
    quantity:
      previewStatuses[index % previewStatuses.length] === "sold_out"
        ? 0
        : previewStatuses[index % previewStatuses.length] === "paused"
          ? Math.max(2, product.quantity)
          : previewStatuses[index % previewStatuses.length] === "draft"
            ? Math.max(1, Math.min(product.quantity, 4))
            : product.quantity,
    soldCount: (product.soldCount || 0) + index * 3,
    viewCount: (product.viewCount || 0) + 120 + index * 37,
    comparePrice:
      product.comparePrice ?? (index % 2 === 0 ? product.price + 25 : null),
    dateCreated: new Date(Date.now() - index * 86400000).toISOString(),
  }));
}

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
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
      };
    case "draft":
      return {
        label: "Draft",
        color: "bg-gray-100 text-gray-700",
        icon: Clock,
      };
    case "sold_out":
      return {
        label: "Sold Out",
        color: "bg-red-100 text-red-700",
        icon: AlertCircle,
      };
    case "paused":
      return {
        label: "Paused",
        color: "bg-orange-100 text-orange-700",
        icon: Pause,
      };
    case "deleted":
      return {
        label: "Deleted",
        color: "bg-red-100 text-red-700",
        icon: AlertCircle,
      };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700", icon: Clock };
  }
};

export function SellerProductsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [previewProducts, setPreviewProducts] = useState<Product[]>(() =>
    createPreviewProducts(),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] =
    useState<ProductModalMode>("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const openAddProductModal = () => {
    setProductModalMode("add");
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductModalMode("edit");
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const openViewProductModal = (product: Product) => {
    setProductModalMode("view");
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    setProductModalMode("add");
  };

  const { data: store } = useMyStore();
  const { data: storeProducts, isLoading: productsLoading } = useStoreProducts(
    store?.id || "",
  );
  const deleteProduct = useDeleteProduct();
  const products = useMemo(
    () => (USE_PREVIEW_MOCK_DATA ? previewProducts : storeProducts || []),
    [previewProducts, storeProducts],
  );
  const isLoading = USE_PREVIEW_MOCK_DATA ? false : productsLoading;

  const filteredProducts = useMemo(() => {
    let productsList = [...products];

    if (statusFilter !== "all") {
      productsList = productsList.filter((p) => p.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      productsList = productsList.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    switch (sortBy) {
      case "oldest":
        productsList.sort(
          (a, b) =>
            new Date(a.dateCreated).getTime() -
            new Date(b.dateCreated).getTime(),
        );
        break;
      case "price-high":
        productsList.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        productsList.sort((a, b) => a.price - b.price);
        break;
      case "stock-low":
        productsList.sort((a, b) => a.quantity - b.quantity);
        break;
      case "best-selling":
        productsList.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case "newest":
      default:
        productsList.sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime(),
        );
    }

    return productsList;
  }, [products, searchQuery, statusFilter, sortBy]);

  const { formatGHS } = useCurrency();

  const statusCounts = useMemo(() => {
    const all = products;
    return {
      all: all.length,
      active: all.filter((p) => p.status === "active").length,
      draft: all.filter((p) => p.status === "draft").length,
      sold_out: all.filter((p) => p.status === "sold_out").length,
      paused: all.filter((p) => p.status === "paused").length,
      lowStock: all.filter((p) => p.quantity > 0 && p.quantity <= 5).length,
    };
  }, [products]);

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
      if (USE_PREVIEW_MOCK_DATA) {
        setPreviewProducts((prev) =>
          prev.filter((item) => item.id !== productToDelete.id),
        );
      } else {
        await deleteProduct.mutateAsync(productToDelete.id);
      }
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handlePreviewProductSave = async ({
    mode,
    productId,
    formData,
  }: AddProductModalSavePayload) => {
    if (!USE_PREVIEW_MOCK_DATA) return;

    if (mode === "add") {
      const id = `preview-generated-${Date.now()}`;
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const newProduct: Product = {
        id,
        storeID: store?.id || "preview-store",
        name: formData.name,
        slug: slug || id,
        description: formData.description,
        price: Number(formData.price),
        comparePrice: formData.comparePrice
          ? Number(formData.comparePrice)
          : null,
        quantity: Number(formData.quantity),
        minOrderQuantity: Number(formData.minOrderQuantity) || 1,
        maxOrderQuantity: formData.maxOrderQuantity
          ? Number(formData.maxOrderQuantity)
          : null,
        images: formData.images,
        thumbnail: formData.images[0] || null,
        category: formData.category as Product["category"],
        tags: formData.tags,
        status: formData.status,
        isActive: formData.status === "active",
        isFeatured: formData.isFeatured,
        rating: null,
        reviewCount: 0,
        soldCount: 0,
        viewCount: 0,
        dateCreated: new Date().toISOString(),
      };

      setPreviewProducts((prev) => [newProduct, ...prev]);
      return;
    }

    if (!productId) return;

    setPreviewProducts((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        if (mode === "view") {
          return {
            ...item,
            status: formData.status,
            isActive: formData.status === "active",
          };
        }

        return {
          ...item,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          comparePrice: formData.comparePrice
            ? Number(formData.comparePrice)
            : null,
          quantity: Number(formData.quantity),
          minOrderQuantity: Number(formData.minOrderQuantity) || 1,
          maxOrderQuantity: formData.maxOrderQuantity
            ? Number(formData.maxOrderQuantity)
            : null,
          category: formData.category as Product["category"],
          tags: formData.tags,
          images: formData.images,
          thumbnail: formData.images[0] || item.thumbnail,
          status: formData.status,
          isFeatured: formData.isFeatured,
          isActive: formData.status === "active",
        };
      }),
    );
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const selectAllProducts = () => {
    if (filteredProducts.length === 0) {
      setSelectedProducts([]);
      return;
    }

    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const sidebar = (
    <div className="space-y-6 xl:sticky xl:top-48">
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

      <div className="grid grid-cols-1 gap-3">
        {[
          // { label: "Total", value: statusCounts.all },
          // { label: "Active", value: statusCounts.active },
          // { label: "Draft", value: statusCounts.draft },
          { label: "Low Stock", value: statusCounts.lowStock },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-md md:rounded-2xl bg-gray-50 p-3 text-center"
          >
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
      description={`Manage your store products (${products.length} total)`}
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
            onClick={openAddProductModal}
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
        <div className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
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
                  onClick={openAddProductModal}
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
              checked={
                filteredProducts.length > 0 &&
                selectedProducts.length === filteredProducts.length
              }
              onChange={selectAllProducts}
              className="rounded border-gray-300"
              aria-label="Select all products"
            />
            <span>Select all ({filteredProducts.length})</span>
          </div>

          <div className="overflow-hidden rounded-md md:rounded-3xl border border-gray-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="w-14 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const statusConfig = getStatusConfig(product.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select product ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 overflow-hidden rounded-sm md:rounded-lg border border-gray-100 bg-gray-100">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[300px]">
                            <Link
                              to={`/products/${product.slug}`}
                              className="line-clamp-1 text-sm md:text-base font-medium text-gray-900 transition-colors hover:text-emerald-600"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.color}`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          <p className="font-semibold">
                            {formatGHS(product.price)}
                          </p>
                          {product.comparePrice && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatGHS(product.comparePrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.quantity === 0
                              ? "font-semibold text-red-500"
                              : "text-gray-900"
                          }
                        >
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{product.soldCount || 0}</TableCell>
                      <TableCell>{product.viewCount || 0}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full"
                              aria-label={`Open actions for ${product.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => openViewProductModal(product)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditProductModal(product)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        mode={productModalMode}
        product={selectedProduct}
        onSave={USE_PREVIEW_MOCK_DATA ? handlePreviewProductSave : undefined}
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
