import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Users, Store, Package, CreditCard, Truck, Settings, LogOut, Bell, Menu, X, Shield, Activity, UserCog 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Super Admin has access to everything admin has, plus additional features
  const navigationItems = [
    { name: 'Dashboard', path: '/super-admin-portal', icon: BarChart3 },
    { name: 'Users', path: '/super-admin-portal/users', icon: Users },
    { name: 'Stores', path: '/super-admin-portal/stores', icon: Store },
    { name: 'Products', path: '/super-admin-portal/products', icon: Package },
    { name: 'Transactions', path: '/super-admin-portal/transactions', icon: CreditCard },
    { name: 'Riders', path: '/super-admin-portal/riders', icon: Truck },
    { name: 'User Activity', path: '/super-admin-portal/user-activity', icon: Activity },
    { name: 'Admin Management', path: '/super-admin-portal/admin-management', icon: UserCog },
    { name: 'Notifications', path: '/super-admin-portal/notifications', icon: Bell },
    { name: 'Settings', path: '/super-admin-portal/settings', icon: Settings },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex font-dashboard">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeSidebar} />
          <div className="relative flex-1 flex flex-col h-full w-full max-w-sm bg-white">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-10 w-10" />
              </Button>
            </div>
            {/* Mobile Sidebar Content */}
            <div className="flex-1 h-0 overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Super Admin</h1>
                    <p className="text-xs text-gray-500">Ultimate control</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.name === 'Notifications' && (
                        <Badge variant="secondary" className="ml-auto">3</Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`${isMobile ? 'hidden' : 'fixed w-24 xl:w-72'} h-screen bg-gradient-to-b from-[#3B2F2F] via-[#231F1A] to-[#3B2F2F] shadow-2xl border-r border-[#4B3621] flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-[#4B3621]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A9743B] to-[#7C4F20] rounded-xl flex items-center justify-center mx-auto xl:mx-0 shadow-lg">
              <Shield className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            <div className='hidden xl:block'>
              <h1 className="text-xl font-bold text-white tracking-wide">Super Admin</h1>
              <p className="text-sm text-[#D2B48C] font-medium">Ultimate Control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 text-sm px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-[#A9743B] to-[#7C4F20] text-white shadow-lg transform scale-[1.04]'
                    : 'text-[#E6D3B3] hover:bg-[#4B3621]/70 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto xl:mx-0 flex-shrink-0" />
                <span className="font-semibold hidden xl:block">{item.name}</span>
                {item.name === 'Notifications' && (
                  <Badge className="ml-auto hidden xl:block bg-red-500 hover:bg-red-600 text-white border-0">3</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#4B3621]">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-[#4B3621]/70 rounded-xl transition-all duration-200">
                  <Avatar className="h-10 w-10 mr-3 ring-2 ring-[#A9743B]/50">
                    <AvatarImage alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#A9743B] to-[#7C4F20] text-white font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-[#D2B48C]">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-[#A9743B] shadow-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal bg-gradient-to-r from-[#F5E6D3] to-[#E6D3B3]">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-[#7C4F20]">{user.name}</p>
                    <p className="text-xs leading-none text-[#A9743B]">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-[#A9743B] font-bold">
                      Super Administrator
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#A9743B]" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'ml-0' : 'ml-24 xl:ml-72'}`}>
        {/* Top Header */}
        <header className="bg-white block lg:hidden border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}
              <Link to="/" className="flex items-center space-x-2 font-display">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wide">tobra</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        <div className="absolute right-10 top-4 hidden lg:flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
              3
            </Badge>
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;