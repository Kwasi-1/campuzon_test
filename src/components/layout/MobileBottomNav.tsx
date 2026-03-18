import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, User, Heart, Flame } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useCartStore } from '@/stores';

const baseNavStart = [
  {
    path: '/',
    label: 'Shop',
    icon: Home,
    requiresAuth: false,
    exactMatch: true,
  },
  {
    path: '/products',
    label: 'Category',
    icon: LayoutGrid,
    requiresAuth: false,
    exactMatch: false,
  },
] as const;

const baseNavEnd = [
  {
    path: '/cart',
    label: 'Cart',
    icon: ShoppingCart,
    requiresAuth: false,
    exactMatch: false,
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    requiresAuth: true,
    exactMatch: false,
  },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Dynamic middle tab — built inside the component where hooks are available
  const middleTab = isAuthenticated
    ? { path: '/wishlist', label: 'Wishlist', icon: Heart, requiresAuth: true, exactMatch: false }
    : { path: '/products?sort=hot', label: 'Hot Deals', icon: Flame, requiresAuth: false, exactMatch: false };

  const navItems = [...baseNavStart, middleTab, ...baseNavEnd];

  const handleNavClick = (e: React.MouseEvent, path: string, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      navigate('/login', { state: { from: path } });
    }
  };

  const isTabActive = (item: typeof navItems[number]) => {
    if (item.exactMatch) {
      return location.pathname === item.path;
    }
    if (item.path === '/products') {
      const isTrends =
        location.pathname === '/products' &&
        location.search.includes('sort=popular');
      return location.pathname.startsWith('/products') && !isTrends;
    }
    const pathSegment = item.path.split('?')[0];
    return location.pathname.startsWith(pathSegment);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background backdrop-blur-sm border-t border-border safe-area-pb">
      <div className="flex items-stretch h-[58px]">
        {navItems.map((item) => {
          const isActive = isTabActive(item);
          const Icon = item.icon;
          const isCart = item.path === '/cart';
          const isProfile = item.path === '/profile';

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path, item.requiresAuth)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            >
              <div className="relative">
                {isProfile && isAuthenticated && user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.displayName || user.firstName}
                    className={`h-5 w-5 rounded-full object-cover ${
                      isActive ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background' : ''
                    }`}
                  />
                ) : (
                  <Icon
                    className={`h-5 w-5 transition-all ${
                      isActive ? 'text-foreground stroke-[2.5px]' : 'text-muted-foreground/70'
                    }`}
                  />
                )}

                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              {/* <span
                className={`text-[10px] leading-tight font-medium transition-colors ${
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span> */}

              {/* {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
              )} */}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}