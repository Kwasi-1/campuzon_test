import { useState, ChangeEvent } from "react";
import { Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/shared/Modal";
import {
  CustomInputTextField,
  CustomSelectField,
  CustomTextareaField,
} from "@/components/shared/text-field";
import { useCreateProduct } from "@/hooks";

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
];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  status: "draft" | "active";
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

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const createProduct = useCreateProduct();
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_STATE);
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleProductImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setProductFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
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
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const submitAddProduct = async () => {
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

    await createProduct.mutateAsync(data);
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
      title="Add Product"
      description="Create and publish a new product"
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
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CustomSelectField
            label="Category"
            value={formData.category}
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
                  status: e.target.value as "draft" | "active",
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
                  onClick={() => removeTag(tag)}
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
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:bg-gray-100">
            <Upload className="mr-2 h-4 w-4" />
            Upload images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
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
            onClick={submitAddProduct}
            disabled={createProduct.isPending}
            className="rounded-full"
          >
            {createProduct.isPending ? "Saving..." : "Create Product"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
