import { Link } from "react-router-dom";
import { X } from "lucide-react";

interface Category {
  label: string;
  value: string;
}

interface MainCategory {
  label: string;
  href: string;
}

interface MobileMenuProps {
  logo: string;
  isOpen: boolean;
  categories: Category[];
  mainCategories: MainCategory[];
  onClose: () => void;
}

export function MobileMenu({
  logo,
  isOpen,
  categories,
  mainCategories,
  onClose,
}: MobileMenuProps) {
  if (!isOpen) return null;

  // Filter tabs for mobile
  const filterTabs = [
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Children", value: "children" },
    { label: "Brand", value: "brand" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <img src={logo} alt="Campuzon" className="h-8 object-contain" />
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {/* Quick Links */}
          {mainCategories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              onClick={onClose}
              className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium"
            >
              {cat.label}
            </Link>
          ))}

          <hr className="my-3 border-border" />

          {/* Filter Tabs */}
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Filter by
          </p>
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              to={`/products?filter=${tab.value}`}
              onClick={onClose}
              className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              {tab.label}
            </Link>
          ))}

          <hr className="my-3 border-border" />

          {/* Categories */}
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Categories
          </p>
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              onClick={onClose}
              className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              {cat.label}
            </Link>
          ))}

          <hr className="my-3 border-border" />

          {/* Additional Links */}
          <Link
            to="/blog"
            onClick={onClose}
            className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            Blogs
          </Link>
          <Link
            to="/faq"
            onClick={onClose}
            className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            FAQs
          </Link>
          <Link
            to="/stores"
            onClick={onClose}
            className="block px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            Campus Stores
          </Link>
        </nav>
      </div>
    </>
  );
}
