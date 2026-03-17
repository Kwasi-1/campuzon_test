import {
  Outlet,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useAuthStore } from "@/stores";
import {
  User,
  Heart,
  ShoppingBag,
  Box,
  LogOut,
  MessageCircle,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";

export function ProfileLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Wishlist", icon: Heart, path: "/wishlist" },
    { label: "My Order", icon: ShoppingBag, path: "/orders" },
    { label: "Saved Address", icon: Box, path: "/addresses" },
    { label: "Messages", icon: MessageCircle, path: "/messages" },
    { label: "Payment Methods", icon: CreditCard, path: "/payments" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const messagesPadding = location.pathname === "/messages";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <Navigate to="/login" state={{ from: "/profile" }} replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-0 py-6 ">
        {/* Header Section */}
        <div className="hidden lg:flex flex-col md:flex-row md:items-end md:gap-36 gap-20 lg:gap-40 justify-between mb-8 pb-8 border-b border-gray-100 px-4 lg:px-8">
          <div>
            <p className="text-gray-500 text-sm mb-1">Good Morning,</p>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight w-full text-nowrap capitalize">
              {user.firstName} {user.lastName}
            </h1>
          </div>

          {/* Navigation Pills */}
          <div className="flex flexwrap items-center gap-2 overflow-y-auto scrollbar-hide ">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/profile" &&
                  location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-sm font-medium transition-all text-nowrap ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-white text-gray-700 border border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut
                className="h-4 w-4 text-gray-500 hover:text-red-600"
                strokeWidth={2}
              />
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div
          className={`mt-8 lg:px-8 ${messagesPadding ? "px-0 md:px-4" : "px-4"}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
