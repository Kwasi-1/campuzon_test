import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Store, Package, CreditCard, Truck, Settings, LogOut, Bell, Menu, X, Shield } from 'lucide-react';
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

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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

  const navigationItems = [
    { name: 'Dashboard', path: '/admin-portal', icon: BarChart3 },
    { name: 'Users', path: '/admin-portal/users', icon: Users },
    { name: 'Stores', path: '/admin-portal/stores', icon: Store },
    { name: 'Products', path: '/admin-portal/products', icon: Package },
    { name: 'Transactions', path: '/admin-portal/transactions', icon: CreditCard },
    { name: 'Disbursements', path: '/admin-portal/disbursements', icon: CreditCard },
    { name: 'Riders', path: '/admin-portal/riders', icon: Truck },
    { name: 'Notifications', path: '/admin-portal/notifications', icon: Bell },
    { name: 'Settings', path: '/admin-portal/settings', icon: Settings },
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
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
                    <p className="text-xs text-gray-500">System management</p>
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
                      {item.name === 'Notifications' && (
                        <Badge variant="secondary" className="ml-auto">5</Badge>
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
      <div className={`${isMobile ? 'hidden' : 'fixed w-24 xl:w-64'} h-screen bg-white shadow-sm border-r border-gray-200 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 borderb border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto xl:mx-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className='hidden xl:block'>
              <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-500">System management</p>
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
                className={`flex items-center space-x-3 text-sm px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto xl:mx-0" />
                <span className="font-medium hidden xl:block">{item.name}</span>
                {item.name === 'Notifications' && (
                  <Badge variant="secondary" className="ml-auto hidden xl:block">5</Badge>
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
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
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
                  5
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        <div className="absolute right-10 top-4 hidden lg:flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
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

export default AdminLayout;
