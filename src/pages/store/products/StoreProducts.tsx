import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, Download, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";
import StorePageLayout from "@/components/store/StorePageLayout";
import StoreCustomTable from "@/components/store/StoreCustomTable";
import ProductModal from "@/components/store/ProductModal";
import BulkImportModal from "@/components/store/BulkImportModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import StorePagination from "@/components/store/StorePagination";
import { StoreProduct } from "@/types";
import storeService, {
  ProductFilters,
  StoreProduct as ServiceProduct,
} from "@/services/storeService";
import { toast } from "sonner";

const StoreProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("view");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast: toastHook } = useToast();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productIdMap, setProductIdMap] = useState<Record<number, string>>({});

  const itemsPerPage = 15;

  // Fetch products from API
  const fetchProducts = React.useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const filters: ProductFilters = {};

        // Apply search filter
        if (searchQuery) filters.search = searchQuery;

        const response = await storeService.getProducts(
          page,
          itemsPerPage,
          filters
        );

        if (response.success && response.data) {
          // Transform API data to match existing component interface
          const idMap: Record<number, string> = {};
          const transformedProducts: StoreProduct[] = response.data.map(
            (product: ServiceProduct) => {
              const numericId = Number.isNaN(parseInt(product.id))
                ? Math.floor(Math.random() * 1e9)
                : parseInt(product.id);
              idMap[numericId] = product.id; // keep original Mongo ObjectId
              return {
                id: numericId,
                name: product.name,
                sku: product.sku || `PRD-${String(product.id).slice(-6)}`,
                category: product.category,
                supplier: "Unknown Supplier",
                stock: product.stockQuantity || 0,
                price: product.price,
                image: product.images?.[0] || "/placeholder-product.png",
                status: product.isActive ? "Active" : "Inactive",
                description: product.description || "",
              } as StoreProduct;
            }
          );

          setProducts(transformedProducts);
          setProductIdMap(idMap);
          setTotalPages(response.pagination?.pages || 1);
          setTotalItems(response.pagination?.total || 0);
        }
      } catch (error: unknown) {
        const message =
          (error as { message?: string })?.message ||
          "Failed to fetch products";
        toast.error(message);
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage, searchQuery]
  );

  // Initial load
  useEffect(() => {
    void fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        void fetchProducts(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, fetchProducts]);

  // Sort products (client-side for now, can be moved to server-side later)
  const sortedProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      if (!sortColumn) return 0;

      const aVal = a[sortColumn as keyof StoreProduct];
      const bVal = b[sortColumn as keyof StoreProduct];

      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === "asc" ? comparison : -comparison;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return sorted;
  }, [products, sortColumn, sortDirection]);

  // For pagination display (since we're using server-side pagination)
  const paginatedProducts = sortedProducts;

  // Dashboard stats
  const dashboardStats = [
    { label: "Total Products", value: totalItems },
    {
      label: "Low Stock Items",
      value: products.filter((p) => p.stock < 20).length,
    },
    {
      label: "Out of Stock",
      value: products.filter((p) => p.stock === 0).length,
    },
    {
      label: "Active Products",
      value: products.filter((p) => p.status === "Active").length,
    },
  ];

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handleViewProduct = async (product: StoreProduct) => {
    try {
      // Fetch full product details from API
      const originalId = productIdMap[product.id];
      const fullProduct = await storeService.getProduct(
        originalId || String(product.id)
      );

      // Transform to match existing interface
      const transformedProduct: StoreProduct = {
        id: product.id,
        name: fullProduct.name,
        sku: fullProduct.sku || product.sku,
        category: fullProduct.category || product.category,
        supplier: "Unknown Supplier",
        stock: fullProduct.stockQuantity || 0,
        price: fullProduct.price,
        image:
          (fullProduct.images && fullProduct.images[0]) ||
          "/placeholder-product.png",
        status: fullProduct.isActive ? "Active" : "Inactive",
        description: fullProduct.description || "",
      };

      setSelectedProduct(transformedProduct);
      setModalMode("view");
      setModalOpen(true);
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to load product details";
      toast.error(message);
    }
  };

  const handleEditProduct = async (product: StoreProduct) => {
    try {
      // Fetch full product details from API
      const originalId = productIdMap[product.id];
      const fullProduct = await storeService.getProduct(
        originalId || String(product.id)
      );

      // Transform to match existing interface
      const transformedProduct: StoreProduct = {
        id: product.id,
        name: fullProduct.name,
        sku: fullProduct.sku || product.sku,
        category: fullProduct.category || product.category,
        supplier: "Unknown Supplier",
        stock: fullProduct.stockQuantity || 0,
        price: fullProduct.price,
        image:
          (fullProduct.images && fullProduct.images[0]) ||
          "/placeholder-product.png",
        status: fullProduct.isActive ? "Active" : "Inactive",
        description: fullProduct.description || "",
      };

      setSelectedProduct(transformedProduct);
      setModalMode("edit");
      setModalOpen(true);
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to load product details";
      toast.error(message);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    toast.error("Product deletion is not available yet from the store portal.");
  };

  const handleSaveProduct = async (updatedProduct: StoreProduct) => {
    toast.error("Product update is not available yet from the store portal.");
  };

  const handleAddNewProduct = async (
    newProductData: Omit<StoreProduct, "id" | "sku">
  ) => {
    toast.error("Product creation is not available yet from the store portal.");
  };

  const handleRefresh = () => {
    fetchProducts(currentPage);
  };

  const handleBulkImport = (importedProducts: StoreProduct[]) => {
    setProducts([...products, ...importedProducts]);
    // TODO: Implement actual bulk import API call
  };

  const handleBulkDelete = async () => {
    toast.error("Bulk delete is not available yet from the store portal.");
  };

  const handleBulkExport = () => {
    toastHook({
      title: "Export Started",
      description: "Selected products are being exported...",
    });
    // TODO: Implement actual export functionality
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock < 20) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 20) return `${stock} unit - Low`;
    return `${stock} unit - High`;
  };

  const bulkActions = selectedProducts.length > 0 && (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-medium">
        {selectedProducts.length} product
        {selectedProducts.length !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleBulkExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={handleBulkDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );

  const secondaryActions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Bulk Import
      </Button>
    </div>
  );

  return (
    <>
      <SEO
        title="Store Products"
        description="Manage your store's product inventory, pricing, and stock levels on Tobra platform."
        keywords="product management, inventory, stock control, store products"
      />

      <StorePageLayout title="Inventory" dashboardStats={dashboardStats}>
        <StoreCustomTable
          title="Product Inventory"
          subtitle="Manage your store's product catalog"
          searchPlaceholder="Search product..."
          showAddButton={true}
          addButtonText="Add Product"
          onAddClick={handleAddProduct}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[]}
          bulkActions={bulkActions}
          secondaryActions={secondaryActions}
          isEmpty={products.length === 0 && !isLoading}
          emptyMessage="No products found. Add your first product to get started."
          onSort={handleSort}
        >
          {isLoading ? (
            <TableSkeleton
              rows={itemsPerPage}
              columns={8}
              showCheckbox={true}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedProducts.length ===
                            paginatedProducts.length &&
                          paginatedProducts.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>PRODUCT NAME</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>CATEGORY</TableHead>
                    <TableHead>SUPPLIER</TableHead>
                    <TableHead>CURRENT STOCK</TableHead>
                    <TableHead>UNIT PRICE</TableHead>
                    <TableHead>ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {product.sku}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.supplier}</TableCell>
                      <TableCell>
                        <Badge className={getStockColor(product.stock)}>
                          {getStockText(product.stock)}
                        </Badge>
                      </TableCell>
                      <TableCell>₵{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditProduct(product)}
                            disabled={isUpdating === product.id.toString()}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isUpdating === product.id.toString()}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        mode={modalMode}
        onSave={handleSaveProduct}
        onAdd={handleAddNewProduct}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImport={handleBulkImport}
      />
    </>
  );
};

export default StoreProducts;
