import { Link } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";

interface Category {
  label: string;
  value: string;
}

interface MainSearchBarProps {
  logo: string;
  categories: Category[];
  searchQuery: string;
  selectedCategory: string;
  showCategoryMenu: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onToggleCategoryMenu: () => void;
  onToggleMobileMenu: () => void;
}

export function MainSearchBar({
  logo,
  categories,
  searchQuery,
  selectedCategory,
  showCategoryMenu,
  onSearchChange,
  onCategoryChange,
  onToggleCategoryMenu,
  onToggleMobileMenu,
}: MainSearchBarProps) {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-20">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Campuzon" className="h-10 object-contain" />
          </Link>

          {/* Shop by Category Dropdown */}
          <div className="relative hidden lg:block shrink-0">
            <button
              onClick={onToggleCategoryMenu}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-sm">Shop by category</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showCategoryMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={onToggleCategoryMenu}
                />
                <div className="absolute left-0 top-12 z-50 w-64 rounded-lg border border-border bg-background shadow-lg py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.value}
                      to={`/products?category=${cat.value}`}
                      onClick={onToggleCategoryMenu}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="hidden sm:block px-3 py-2.5 bg-muted border-r border-border text-sm focus:outline-none"
              >
                <option>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <input
                type="search"
                placeholder="Search for anything"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-background focus:outline-none"
              />
              <button className="px-6 py-2.5 bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors">
                Search
              </button>
            </div>
            <Link
              to="/search/advanced"
              className="hidden xl:inline text-sm text-primary hover:underline whitespace-nowrap"
            >
              Advanced
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
