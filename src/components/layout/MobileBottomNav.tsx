import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Heart,
  Flame,
  Store,
  PlusCircle,
  MessageCircle,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Build nav items dynamically based on user status
  const navItems = [
    { path: '/', label: 'Home', icon: Home, requiresAuth: false },
    // Second item: Wishlist for logged in users, Hot Deals for guests
    isAuthenticated
      ? { path: '/wishlist', label: 'Wishlist', icon: Heart, requiresAuth: true }
      : { path: '/products?sort=hot', label: 'Hot Deals', icon: Flame, requiresAuth: false, isHot: true },
    // Middle item: My Store for owners, Sell for non-owners
    user?.isOwner 
      ? { path: '/seller/dashboard', label: 'My Store', icon: Store, requiresAuth: true, isStore: true }
      : { path: '/become-seller', label: 'Sell', icon: PlusCircle, requiresAuth: true, isSell: true },
    { path: '/messages', label: 'Messages', icon: MessageCircle, requiresAuth: true },
    { path: '/profile', label: 'Profile', icon: User, requiresAuth: true, isProfile: true },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      navigate('/login', { state: { from: path } });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, label, icon: Icon, requiresAuth, isProfile, isStore, isSell, isHot }) => {
          const isActive = path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(path.split('?')[0]);

          // Check if this is the profile tab and user has a profile image
          const showProfileImage = isProfile && isAuthenticated && user?.profileImage;

          return (
            <NavLink
              key={path}
              to={path}
              onClick={(e) => handleNavClick(e, path, requiresAuth)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                {showProfileImage ? (
                  <img
                    src={user.profileImage!}
                    alt={user.displayName || user.firstName}
                    className={`h-6 w-6 rounded-full object-cover ${
                      isActive ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                    }`}
                  />
                ) : isStore ? (
                  <div className={`h-10 w-10 -mt-4 rounded-full bg-primary flex items-center justify-center shadow-lg ${
                    isActive ? 'ring-2 ring-primary/50' : ''
                  }`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                ) : isSell ? (
                  <div className={`h-10 w-10 -mt-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg ${
                    isActive ? 'ring-2 ring-primary/50' : ''
                  }`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                ) : isHot ? (
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px] text-orange-500' : 'text-orange-500'}`} />
                ) : (
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                )}
                {/* Notification badge for messages */}
                {path === '/messages' && isAuthenticated && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] ${isStore || isSell ? 'mt-1' : ''} ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
