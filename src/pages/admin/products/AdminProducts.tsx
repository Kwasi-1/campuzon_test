import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Package,
  Eye,
  AlertTriangle,
  Edit,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminTable from "@/components/admin/AdminTable";
import ProductModal from "@/components/admin/ProductModal";
import TableSkeleton from "@/components/ui/table-skeleton";
import adminDataService from "@/services/adminDataService";
import adminProductService from "@/services/adminProductService";
import { Product } from "@/types";

const AdminProducts = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "suspend">(
    "view"
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Use the enhanced getAllProducts method
        const list = await adminProductService.getAllProducts();
        // map to Product type expected by UI
        const products = list.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          store: p.store,
          category: p.category,
          description: "",
          stock: p.stock,
          status:
            p.status === "active"
              ? "Active"
              : p.status === "out_of_stock"
              ? "Out of Stock"
              : p.status === "pending_approval"
              ? "Under Review"
              : "Suspended",
          views: p.views ?? 0,
          sales: p.sales ?? 0,
        }));
        setProducts(products);
      } catch (error) {
        toast({
          title: "Failed to load products",
          description: (error as Error).message,
          variant: "destructive",
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [toast]);

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      product.status.toLowerCase().replace(" ", "-") ===
        statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStore =
      storeFilter === "all" ||
      product.store.toLowerCase().includes(storeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory && matchesStore;
  });

  const dashboardStats = [
    {
      label: "Total Products",
      value: products.length.toString(),
      subtext: `${filteredProducts.length} matching filters`,
    },
    {
      label: "Active Products",
      value: products.filter((p) => p.status === "Active").length.toString(),
      subtext: "91.8% active rate",
    },
    {
      label: "Under Review",
      value: products
        .filter((p) => p.status === "Under Review")
        .length.toString(),
      subtext: "Pending approval",
    },
    {
      label: "Out of Stock",
      value: products
        .filter((p) => p.status === "Out of Stock")
        .length.toString(),
      subtext: "Need restocking",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Suspended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Vegetables":
        return "bg-green-100 text-green-800";
      case "Fruits":
        return "bg-yellow-100 text-yellow-800";
      case "Bakery":
        return "bg-orange-100 text-orange-800";
      case "Grains":
        return "bg-brown-100 text-brown-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewProduct = (product: Product) => {
    console.log("view product", product.id);
    setSelectedProduct(product);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSuspendProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("suspend");
    setModalOpen(true);
  };

  const handleProductAction = async (
    action: string,
    productId: string | number
  ) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return;

    switch (action) {
      case "view":
        handleViewProduct(product);
        break;
      case "edit":
        handleEditProduct(product);
        break;
      case "analytics":
        handleViewProduct(product); // View modal has analytics tab
        break;
      case "approve":
        try {
          await adminProductService.setProductStatus(
            String(productId),
            "active"
          );
          setProducts(
            products.map((p) =>
              String(p.id) === String(productId)
                ? { ...p, status: "Active" }
                : p
            )
          );
          toast({
            title: "Product Approved",
            description: "Product has been approved and is now active.",
          });
        } catch (e) {
          toast({
            title: "Failed to approve product",
            description: (e as Error).message,
            variant: "destructive",
          });
        }
        break;
      case "suspend":
        handleSuspendProduct(product);
        break;
      default:
        console.log(`${action} product ${productId}`);
    }
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      await adminProductService.updateProduct(String(updatedProduct.id), {
        name: updatedProduct.name,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        category: updatedProduct.category,
        status: updatedProduct.status.toLowerCase(),
      });

      setProducts(
        products.map((p) =>
          String(p.id) === String(updatedProduct.id) ? updatedProduct : p
        )
      );
      toast({
        title: "Product Updated",
        description: "Product information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update product",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleExportProducts = async () => {
    try {
      const blob = await adminProductService.exportProducts("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Completed",
        description: "Product data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSuspendProductAction = async (
    productId: string | number,
    reason: string,
    duration: string
  ) => {
    try {
      await adminProductService.setProductStatus(
        String(productId),
        "suspended"
      );
      setProducts(
        products.map((p) =>
          String(p.id) === String(productId) ? { ...p, status: "Suspended" } : p
        )
      );
      toast({
        title: "Product Suspended",
        description: `Product has been suspended for ${duration}.`,
      });
    } catch (e) {
      toast({
        title: "Failed to suspend product",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "out-of-stock", label: "Out of Stock" },
        { value: "under-review", label: "Under Review" },
        { value: "suspended", label: "Suspended" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "all", label: "All Categories" },
        { value: "vegetables", label: "Vegetables" },
        { value: "fruits", label: "Fruits" },
        { value: "bakery", label: "Bakery" },
        { value: "grains", label: "Grains" },
      ],
      value: categoryFilter,
      onChange: setCategoryFilter,
    },
    {
      key: "store",
      label: "Store",
      options: [
        { value: "all", label: "All Stores" },
        { value: "supermart", label: "SuperMart Accra" },
        { value: "freshfoods", label: "Fresh Foods Ltd" },
        { value: "quickshop", label: "QuickShop Express" },
      ],
      value: storeFilter,
      onChange: setStoreFilter,
    },
  ];

  return (
    <>
      <SEO
        title="Product Management"
        description="Monitor and moderate products across all stores on the platform."
        keywords="product management, inventory oversight, product moderation"
      />

      <AdminPageLayout title="Products" dashboardStats={dashboardStats}>
        <AdminTable
          title="Product Management"
          description="Monitor and moderate all products across the platform"
          searchPlaceholder="Search products by name, store, or description..."
          onSearch={handleSearch}
          filters={filters}
          showDateFilter={true}
          secondaryActionButton={{
            label: "Export Products",
            onClick: handleExportProducts,
            icon: <Download className="w-4 h-4 mr-2" />,
          }}
        >
          {loading ? (
            <TableSkeleton rows={6} columns={8} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.store}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(product.category)}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ₵{product.price.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span
                          className={
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock < 20
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                        >
                          {product.stock}
                        </span>
                        {product.stock < 20 && product.stock > 0 && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Eye className="w-3 h-3 mr-1 text-gray-400" />
                          {product.views} views
                        </div>
                        <div className="text-sm text-gray-600">
                          {product.sales} sold
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleProductAction("view", product.id)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleProductAction("edit", product.id)
                            }
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleProductAction("analytics", product.id)
                            }
                          >
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {product.status === "Under Review" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleProductAction("approve", product.id)
                              }
                            >
                              Approve Product
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleProductAction("suspend", product.id)
                            }
                            className="text-red-600"
                          >
                            Suspend Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AdminTable>
      </AdminPageLayout>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        mode={modalMode}
        onSave={handleSaveProduct}
        onSuspend={handleSuspendProductAction}
      />
    </>
  );
};

export default AdminProducts;
