import { Link } from "react-router-dom";

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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <img src={logo} alt="Campuzon" className="h-8 object-contain" />
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <span className="text-xl">×</span>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <div className="pb-2 mb-2 border-b border-border">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              Shop by Category
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                onClick={onClose}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <div className="pb-2 mb-2 border-b border-border">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              Quick Links
            </p>
            {mainCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.href}
                onClick={onClose}
                className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <Link
            to="/deals"
            onClick={onClose}
            className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            Daily Deals
          </Link>
          <Link
            to="/stores"
            onClick={onClose}
            className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            Campus Stores
          </Link>
          <Link
            to="/help"
            onClick={onClose}
            className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            Help & Contact
          </Link>
        </nav>
      </div>
    </>
  );
}
