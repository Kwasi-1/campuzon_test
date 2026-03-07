
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const cartItemsCount = getTotalItems();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const tabs = [
    {
      name: 'Home',
      path: '/',
      icon: 'solar:home-2-broken',
      activeIcon: 'hugeicons:home-02'
    },
    {
      name: 'Shops',
      path: '/stores',
      icon: 'iconoir:shopping-bag',
      activeIcon: 'iconoir:shopping-bag'
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: 'cil:cart',
      activeIcon: 'bytesize:cart',
      badge: cartItemsCount > 0 ? cartItemsCount : null,
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: 'streamline-flex:dashboard-3',
      activeIcon: 'streamline-flex:dashboard-3'
    },
    {
      name: 'Account',
      path: user ? '/account' : '/login',
      icon: 'line-md:account',
      activeIcon: 'line-md:account'
    }
  ];

  const showBottomNavs = tabs.some(tab => location.pathname === tab.path);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg lg:hidden ${showBottomNavs ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-around px-1 py-3 safe-area-pb mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center px-2 py-1 transition-all duration-200 min-w-[64px] relative ${
                active 
                  ? 'text-primary' 
                  : 'text-gray-400'
              }`}
            >
              <div className="relative h-6 w-6 mb-1">
                <Icon 
                  icon={active ? tab.activeIcon : tab.icon} 
                  className="text-2xl h-6 w-6" 
                />
                {tab.badge && tab.badge > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs bg-primary text-white border-2 border-white rounded-full">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-[10px] font-medium ${
                active ? 'text-primary' : 'text-gray-500'
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
