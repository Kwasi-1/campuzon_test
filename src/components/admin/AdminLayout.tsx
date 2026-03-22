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
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
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

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group justify-center',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="hidden xl:block flex-1">{item.name}</span>
              {item.name === 'Disputes' && (
                <span className="hidden xl:flex ml-auto w-2 h-2 bg-red-500 rounded-full" />
              )}
              {active && (
                <ChevronRight className="hidden xl:block ml-auto w-3.5 h-3.5 text-primary/60" />
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group justify-center',
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600')} />
                  <span className="hidden xl:block flex-1">{item.name}</span>
                  {active && <ChevronRight className="hidden xl:block ml-auto w-3.5 h-3.5 text-violet-500/60" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Admin profile */}
      <div className="px-3 py-3 border-t border-gray-100">
        {admin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-2 h-auto hover:bg-gray-50"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:flex flex-col items-start text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate w-full">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {roleLabel[admin.role] ?? admin.role}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end" side="top">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {roleLabel[admin.role] ?? admin.role}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin-portal/admins">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Admins
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
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
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* ── Mobile drawer ── */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-64 bg-white shadow-2xl flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent onNavClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 h-screen w-16 xl:w-56 bg-white border-r border-gray-100 shadow-sm z-30 flex flex-col">
          <SidebarContent />
        </aside>
      )}

      {/* ── Main content ── */}
      <div className={cn('flex-1 flex flex-col min-w-0', !isMobile && 'ml-16 xl:ml-56')}>
        {/* Mobile top bar */}
        {isMobile && (
          <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-bold text-gray-900 text-sm">Campuzon Admin</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </header>
        )}

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
