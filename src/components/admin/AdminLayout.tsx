import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, Store, Package, CreditCard,
  Settings, LogOut, Bell, Menu, X, ShieldCheck,
  AlertTriangle, GraduationCap, ChevronRight, LineChart,
  ShieldAlert, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard',     path: '/admin-portal',               icon: BarChart3 },
  { name: 'Users',         path: '/admin-portal/users',         icon: Users },
  { name: 'Stores',        path: '/admin-portal/stores',        icon: Store },
  { name: 'Disputes',      path: '/admin-portal/disputes',      icon: AlertTriangle },
  { name: 'Transactions',  path: '/admin-portal/transactions',  icon: CreditCard },
  { name: 'Analytics',     path: '/admin-portal/analytics',     icon: LineChart },
  { name: 'Institutions',  path: '/admin-portal/institutions',  icon: GraduationCap },
  { name: 'Notifications', path: '/admin-portal/notifications', icon: Bell },
  { name: 'Settings',      path: '/admin-portal/settings',      icon: Settings },
];

// Super-admin-only nav items
const superAdminNavItems = [
  { name: 'Admin Mgmt',   path: '/admin-portal/admin-management', icon: Crown },
  { name: 'Moderation',  path: '/admin-portal/moderation',       icon: ShieldAlert },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout, isSuperAdmin } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/admin-portal'
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const initials = admin
    ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
    : '??';

  const fullName = admin ? `${admin.firstName} ${admin.lastName}` : '';

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator',
    support: 'Support',
    finance: 'Finance',
  };

  const renderSidebarContent = (onNavClick?: () => void) => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-center xl:justify-start gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="hidden xl:block">
            <p className="text-sm font-bold text-gray-900 leading-none">Campuzon</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group',
                'justify-center xl:justify-start',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="hidden xl:block flex-1">{item.name}</span>
              {item.name === 'Disputes' && (
                <span className="hidden xl:flex ml-auto w-2 h-2 bg-red-500 rounded-full shrink-0" />
              )}
              {active && (
                <ChevronRight className="hidden xl:block ml-auto w-3.5 h-3.5 text-primary/60 shrink-0" />
              )}
            </Link>
          );
        })}

        {/* Super-admin only */}
        {isSuperAdmin && (
          <>
            <div className="my-2 mx-1 border-t border-gray-100" />
            <p className="hidden xl:block px-3 text-[10px] font-semibold text-gray-300 uppercase tracking-wider mb-1">Super Admin</p>
            {superAdminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onNavClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    'justify-center xl:justify-start',
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600')} />
                  <span className="hidden xl:block flex-1">{item.name}</span>
                  {active && <ChevronRight className="hidden xl:block ml-auto w-3.5 h-3.5 text-violet-500/60 shrink-0" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Admin profile */}
      <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
        {admin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center xl:justify-start gap-3 p-2 h-auto hover:bg-gray-50"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:flex flex-col items-start text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 w-full truncate">
                    {fullName || "Admin"}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {roleLabel[admin.role] ?? admin.role}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 mb-2" align="end" side="top">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium truncate">{fullName || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {roleLabel[admin.role] ?? admin.role}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin-portal/admins" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Admins
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans w-full max-w-[100vw] overflow-x-hidden">
      {/* ── Mobile Drawer Overlay ── */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <div 
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-[70] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* We need to force mobile drawer to behave like the expanded XL desktop sidebar so labels show up */}
        <div className="absolute right-3 top-4 z-[80]">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
        
        {/* We reuse rendering but force xl styles by wrapping in a custom class context if needed, 
            or we can just apply our own styles to show text. Since the original implementation 
            hides text below 'xl', we will apply a specific block so the mobile drawer shows text.
            To avoid messy CSS cascades, we'll redefine the mobile render or override styles. */}
        <div className="flex flex-col h-full bg-white mobile-sidebar-content">
          <style>{`
            .mobile-sidebar-content .hidden.xl\\:block { display: block !important; }
            .mobile-sidebar-content .hidden.xl\\:flex { display: flex !important; }
            .mobile-sidebar-content .justify-center.xl\\:justify-start { justify-content: flex-start !important; }
          `}</style>
          {renderSidebarContent(() => setSidebarOpen(false))}
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-16 xl:w-56 bg-white border-r border-gray-100 shadow-sm z-30 flex-col">
        {renderSidebarContent()}
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-16 xl:ml-56 w-full">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 -ml-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-bold text-gray-900 text-sm">Campuzon Admin</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 -mr-2" asChild>
            <Link to="/admin-portal/notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden min-h-[calc(100vh-60px)] lg:min-h-screen">
          <div className="max-w-full w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
