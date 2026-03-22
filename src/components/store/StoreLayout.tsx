import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Store,
  Package,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Icon } from "@iconify/react/dist/iconify.js";

interface StoreLayoutProps {
  children: React.ReactNode;
}

const StoreLayout: React.FC<StoreLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useStoreAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/store-portal/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const isActive = (path: string) => location.pathname === path;
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/store-portal/login");
  };

  const navigationItems = [
    { name: "Dashboard", path: "/store-portal", icon: BarChart3 },
    { name: "Products", path: "/store-portal/products", icon: Package },
    { name: "Orders", path: "/store-portal/orders", icon: Users },
    {
      name: "Transactions",
      path: "/store-portal/transactions",
      icon: CreditCard,
    },
    { name: "Notifications", path: "/store-portal/notifications", icon: Bell },
    { name: "Settings", path: "/store-portal/settings", icon: Settings },
  ];

  // Show loading or redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const isNotification =  location.pathname === "/store-portal/notifications" || location.pathname === "/store-portal/settings";

  const handleNotificationClick = () => {
    navigate('/store-portal/notifications');
  }

  return (
    <div className="min-h-screen flex">
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
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Store Portal</h1>
                    <p className="text-xs text-gray-500">Manage your store</p>
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
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.name === 'Orders' && (
                        <Badge variant="secondary" className="ml-auto">3</Badge>
                      )}
                      {item.name === 'Notifications' && (
                        <Badge variant="secondary" className="ml-auto">2</Badge>
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
      <div className={`${isMobile ? 'hidden' : ' fixed w-24 xl:w-64'} h-screen bg-white shadow-sm border-r border-gray-200 flex flex-col`}>
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center mx-auto xl:mx-0 justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className='hidden xl:block'>
              <h1 className="text-lg font-semibold text-gray-900">Store Portal</h1>
              <p className="text-xs text-gray-500">Manage your store</p>
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
                className={`flex items-center space-x-3 text-[15px] px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto xl:mx-0" />
                <span className="font-medium hidden xl:block">{item.name}</span>
                {item.name === 'Orders' && (
                  <Badge variant="secondary" className="ml-auto absolute xl:relative right-3 xl:right-0 -mt-6 xl:mt-0">3</Badge>
                )}
                {item.name === 'Notifications' && (
                  <Badge variant="secondary" className="ml-auto absolute xl:relative right-3 xl:right-0 -mt-6 xl:mt-0">2</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Icon icon="lets-icons:user" className="w-7 h-7 inline-block" />
                  </div>

                  <div className="text-left hidden xl:block  ml-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'ml-0' : 'ml-24 xl:ml-64'}`}>
        {/* Top Header */}
        <header className="bg-white block lg:hidden border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
              <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  2
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        <div className={`right-10 top-4 hidden items-center space-x-4 ${isNotification ? 'hidden' : 'lg:flex absolute'}`}>
          <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
              5
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

export default StoreLayout;
