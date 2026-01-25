import { Link } from "react-router-dom";

interface MainCategory {
  label: string;
  href: string;
}

interface CategoryNavigationProps {
  categories: MainCategory[];
}

export function CategoryNavigation({ categories }: CategoryNavigationProps) {
  return (
    <div className="hidden lg:block border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
