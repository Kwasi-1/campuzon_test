import { useState, ChangeEvent, useEffect, useMemo } from "react";
import { Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/shared/Modal";
import {
  CustomInputTextField,
  CustomSelectField,
  CustomTextareaField,
} from "@/components/shared/text-field";
import { useCreateProduct, useUpdateProduct } from "@/hooks";
import type { Product, ProductStatus } from "@/types-new";

const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion & Clothing" },
  { value: "books", label: "Books & Stationery" },
  { value: "food", label: "Food & Beverages" },
  { value: "beauty", label: "Health & Beauty" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "home", label: "Home & Living" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft - Not visible to customers" },
  { value: "active", label: "Active - Visible and purchasable" },
  { value: "paused", label: "Paused - Hidden until reactivated" },
  { value: "sold_out", label: "Sold Out - Temporarily unavailable" },
];

export type ProductModalMode = "add" | "edit" | "view";

export interface AddProductModalSavePayload {
  mode: ProductModalMode;
  productId?: string;
  formData: ProductFormData;
  productFiles: File[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: ProductModalMode;
  product?: Product | null;
  onSave?: (payload: AddProductModalSavePayload) => Promise<void> | void;
}

export interface ProductFormData {
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

const INITIAL_STATE: ProductFormData = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  quantity: "",
  minOrderQuantity: "1",
  maxOrderQuantity: "",
  category: "",
  tags: [],
  images: [],
  status: "draft",
  isFeatured: false,
};

const toFormData = (product: Product): ProductFormData => ({
  name: product.name,
  description: product.description,
  price: product.price.toString(),
  comparePrice: product.comparePrice?.toString() || "",
  quantity: product.quantity.toString(),
  minOrderQuantity: product.minOrderQuantity?.toString() || "1",
  maxOrderQuantity: product.maxOrderQuantity?.toString() || "",
  category: product.category || "",
  tags: product.tags || [],
  images:
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [],
  status: product.status,
  isFeatured: !!product.isFeatured,
});

export function AddProductModal({
  isOpen,
  onClose,
  mode = "add",
  product = null,
  onSave,
}: AddProductModalProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_STATE);
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");

  const isReadOnly = mode === "view";

  const modalMeta = useMemo(() => {
    if (mode === "edit") {
      return {
        title: "Edit Product",
        description: "Update product details and availability",
        submitLabel: "Save Changes",
      };
    }

    if (mode === "view") {
      return {
        title: "View Product",
        description: "Review product details and update status",
        submitLabel: "Update Status",
      };
    }

    return {
      title: "Add Product",
      description: "Create and publish a new product",
      submitLabel: "Create Product",
    };
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "add" || !product) {
      setFormData(INITIAL_STATE);
      setProductFiles([]);
      setTagInput("");
      return;
    }

    setFormData(toFormData(product));
    setProductFiles([]);
    setTagInput("");
  }, [isOpen, mode, product]);

  const handleProductImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;

    const files = e.target.files;
    if (!files) return;

    const incoming = Array.from(files);
    setProductFiles((prev) => [...prev, ...incoming]);

    incoming.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProductImage = (index: number) => {
    if (isReadOnly) return;

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setProductFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (isReadOnly) return;

    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    if (isReadOnly) return;

    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const submitProduct = async () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.quantity ||
      !formData.category
    ) {
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.comparePrice) {
      data.append("compare_price", formData.comparePrice);
    }
    data.append("quantity", formData.quantity);
    data.append("min_order_quantity", formData.minOrderQuantity);
    if (formData.maxOrderQuantity) {
      data.append("max_order_quantity", formData.maxOrderQuantity);
    }
    data.append("category", formData.category);
    data.append("status", formData.status);
    data.append("is_featured", String(formData.isFeatured));
    formData.tags.forEach((tag) => data.append("tags[]", tag));
    productFiles.forEach((file) => data.append("images", file));

    if (onSave) {
      await onSave({
        mode,
        productId: product?.id,
        formData,
        productFiles,
      });
    } else if (mode === "add") {
      await createProduct.mutateAsync(data);
    } else if (product?.id) {
      await updateProduct.mutateAsync({ id: product.id, data });
    }

    setFormData(INITIAL_STATE);
    setProductFiles([]);
    onClose();
  };

  const handleClose = () => {
    setFormData(INITIAL_STATE);
    setProductFiles([]);
    setTagInput("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalMeta.title}
      description={modalMeta.description}
      placement="right"
      size="xl"
      outsideClick={true}
    >
      <div className="space-y-4">
        <CustomInputTextField
          label="Product Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter product name"
          disabled={isReadOnly}
          required
        />

        <CustomTextareaField
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          rows={4}
          placeholder="Describe your product"
          disabled={isReadOnly}
          required
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CustomInputTextField
            label="Price (GHS)"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="0.00"
            disabled={isReadOnly}
            required
          />
          <CustomInputTextField
            label="Compare-at Price (GHS)"
            type="number"
            value={formData.comparePrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                comparePrice: e.target.value,
              }))
            }
            placeholder="0.00"
            disabled={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CustomInputTextField
            label="Quantity in Stock"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quantity: e.target.value }))
            }
            placeholder="0"
            disabled={isReadOnly}
            required
          />
          <CustomInputTextField
            label="Min Order Quantity"
            type="number"
            value={formData.minOrderQuantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minOrderQuantity: e.target.value,
              }))
            }
            placeholder="1"
            disabled={isReadOnly}
          />
        </div>

        <CustomInputTextField
          label="Max Order Quantity"
          type="number"
          value={formData.maxOrderQuantity}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              maxOrderQuantity: e.target.value,
            }))
          }
          placeholder="No limit"
          disabled={isReadOnly}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CustomSelectField
            label="Category"
            value={formData.category}
            isDisabled={isReadOnly}
            options={[
              { value: "", label: "Select category" },
              ...CATEGORY_OPTIONS,
            ]}
            inputProps={{
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                })),
            }}
            required
          />
          <CustomSelectField
            label="Status"
            value={formData.status}
            options={STATUS_OPTIONS}
            inputProps={{
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as ProductStatus,
                })),
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <label className="text-xs font-medium text-gray-500">Tags</label>
            <span className="text-xs text-gray-400">
              {formData.tags.length} tags
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              disabled={isReadOnly}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type and press Enter or click Add"
              className="flex-1 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              disabled={isReadOnly}
              className="rounded-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer font-medium hover:bg-gray-300"
                  onClick={isReadOnly ? undefined : () => removeTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Product Images
          </label>
          <label
            className={`flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm ${
              isReadOnly
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "cursor-pointer bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={isReadOnly}
              onChange={handleProductImageUpload}
            />
          </label>
          {formData.images.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {formData.images.map((image, idx) => (
                <div
                  key={`${image}-${idx}`}
                  className="relative overflow-hidden rounded-lg border border-gray-100"
                >
                  <img
                    src={image}
                    alt={`Product ${idx + 1}`}
                    className="h-20 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeProductImage(idx)}
                    disabled={isReadOnly}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                    aria-label={`Remove product image ${idx + 1}`}
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
          <input
            type="checkbox"
            id="featured"
            checked={formData.isFeatured}
            disabled={isReadOnly}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isFeatured: e.target.checked,
              }))
            }
            className="rounded"
          />
          <label htmlFor="featured" className="text-sm text-gray-600">
            Show this product in featured sections
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={submitProduct}
            disabled={createProduct.isPending || updateProduct.isPending}
            className="rounded-full"
          >
            {createProduct.isPending || updateProduct.isPending
              ? "Saving..."
              : modalMeta.submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
