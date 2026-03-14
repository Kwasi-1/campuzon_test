import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import Home from "./pages/client-new/home-page";
import Products from "./pages/client-new/products";
import ProductDetail from "./pages/client/products/ProductDetail";
import Cart from "./pages/client/orders/Cart";
import OrderTracking from "./pages/client/orders/OrderTracking";
import OrderHistory from "./pages/client/orders/OrderHistory";
import Wishlist from "./pages/client/products/Wishlist";
import Account from "./pages/client/account/Account";
import UnifiedLogin from "./pages/auth/UnifiedLogin";
import TwoFactorAuth from "./pages/auth/TwoFactorAuth";
import MultiStepSignup from "./pages/auth/MultiStepSignup";
import NotFound from "./pages/NotFound";
import ProductSearch from "./pages/client/products/ProductSearch";
import ContactUs from "./pages/client/contact/ContactUs";
import FAQs from "./pages/client/contact/FAQs";
import TermsConditions from "./pages/client/company_policy/TermsConditions";
import PrivacyPolicy from "./pages/client/company_policy/PrivacyPolicy";
import AboutUs from "./pages/client/about/AboutUs";
import OrderConfirmation from "./pages/client/orders/OrderConfirmation";

// Admin Portal Components
import AdminPortalLayout from "./pages/admin/AdminPortal";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminStores from "./pages/admin/stores/AdminStores";
import AdminProducts from "./pages/admin/products/AdminProducts";
import AdminTransactions from "./pages/admin/transactions/AdminTransactions";
import AdminSettings from "./pages/admin/settings/AdminSettings";
import StoreTransactions from "./pages/store/transactions/StoreTransactions";
import AdminNotifications from "./pages/admin/notifications/AdminNotifications";

// Super Admin Portal Components
import SuperAdminPortalLayout from "./pages/super-admin/SuperAdminPortal";
import UserActivity from "./pages/super-admin/user-activity/UserActivity";
import AdminManagement from "./pages/super-admin/admin-management/AdminManagement";
import AdminDisbursements from "./pages/admin/transactions/AdminDisbursements";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import SuperAdminLogin from "./pages/super-admin/SuperAdminLogin";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import { ProductDetailPage } from "./pages/client-new/products/pages/product-details/ProductDetailPage";
import { StoresPage } from "./pages/client-new/stores";
import { StoreDetailPage } from "./pages/client-new/stores/store-detail/StoreDetailPage";
import Login from "./pages/auth-new/Login";
import { ProfilePage } from "./pages/client-new/profile";
import { NextUIProvider } from "@nextui-org/react";
import { RegisterPage } from "./pages/auth-new/RegisterPage";
import { SettingsPage } from "./pages/client-new/profile/pages/settings/SettingsPage";
import { TwoFactorSettingsPage } from "./pages/client-new/profile/pages/security/TwoFactorSettingsPage";
import { NotificationsPage } from "./pages/client-new/profile/pages/notifications";
import { WishlistPage } from "./pages/client-new/profile/pages/wishlist/WishlistPage";
import { PaymentMethodsPage } from "./pages/client-new/profile/pages/payment-methods/PaymentMethodsPage";
import { CheckoutPage } from "./pages/client-new/profile/pages/orders/pages/check-out";
import { AddressesPage } from "./pages/client-new/profile/pages/addresses/AddressesPage";
import { MessagesPage } from "./pages/client-new/profile/pages/messages";
import { ConversationPage } from "./pages/client-new/profile/pages/messages/pages/ConversationPage";
import { SellLayout } from "./components/layout/SellLayout";
import {
  BecomeSellerPage,
  SellerAddProductPage,
  SellerDashboardPage,
  SellerMessagesPage,
  SellerOrdersPage,
  SellerProductsPage,
  SellerSettingsPage,
} from "./pages/seller";
import { ProfileLayout } from "./pages/client-new/profile/layout/ProfileLayout";
import { OrdersPage } from "./pages/client-new/profile/pages/orders";
import { OrderDetailPage } from "./pages/client-new/profile/pages/orders/pages/order-details";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <WishlistProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <NextUIProvider>
                    <ScrollToTop />
                    <Routes>
                      {/* Updated Auth pages without layout */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/2fa-verify" element={<TwoFactorAuth />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route
                        path="/become-seller"
                        element={<BecomeSellerPage />}
                      />
                      {/* Seller Routes */}
                      <Route element={<SellLayout />}>
                        <Route
                          path="/seller/dashboard"
                          element={<SellerDashboardPage />}
                        />
                        <Route
                          path="/seller/products"
                          element={<SellerProductsPage />}
                        />
                        <Route
                          path="/seller/products/new"
                          element={<SellerAddProductPage />}
                        />
                        <Route
                          path="/seller/products/:productId/edit"
                          element={<SellerAddProductPage />}
                        />
                        <Route
                          path="/seller/orders"
                          element={<SellerOrdersPage />}
                        />
                        <Route
                          path="/seller/messages"
                          element={<SellerMessagesPage />}
                        />
                        <Route
                          path="/seller/settings"
                          element={<SellerSettingsPage />}
                        />
                      </Route>

                      {/* Admin and Super Admin login routes (wrapped with AdminAuthProvider) */}
                      <Route
                        path="/admin/login"
                        element={
                          <AdminAuthProvider>
                            <AdminLogin />
                          </AdminAuthProvider>
                        }
                      />
                      <Route
                        path="/super-admin/login"
                        element={
                          <AdminAuthProvider>
                            <SuperAdminLogin />
                          </AdminAuthProvider>
                        }
                      />

                      {/* Super Admin Portal routes - wrapped with AdminAuthProvider */}
                      <Route
                        path="/super-admin-portal"
                        element={
                          <AdminAuthProvider>
                            <AdminProtectedRoute requireSuper>
                              <SuperAdminPortalLayout />
                            </AdminProtectedRoute>
                          </AdminAuthProvider>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="stores" element={<AdminStores />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route
                          path="transactions"
                          element={<AdminTransactions />}
                        />
                        <Route
                          path="user-activity"
                          element={<UserActivity />}
                        />
                        <Route
                          path="admin-management"
                          element={<AdminManagement />}
                        />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route
                          path="notifications"
                          element={<AdminNotifications />}
                        />
                      </Route>

                      {/* Admin Portal routes - wrapped with AdminAuthProvider */}
                      <Route
                        path="/admin-portal"
                        element={
                          <AdminAuthProvider>
                            <AdminProtectedRoute>
                              <AdminPortalLayout />
                            </AdminProtectedRoute>
                          </AdminAuthProvider>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="stores" element={<AdminStores />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route
                          path="transactions"
                          element={<AdminTransactions />}
                        />
                        <Route
                          path="disbursements"
                          element={<AdminDisbursements />}
                        />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route
                          path="notifications"
                          element={<AdminNotifications />}
                        />
                      </Route>
                      {/* Legacy admin auth routes - redirect to unified */}
                      <Route
                        path="/admin-portal/login"
                        element={<Navigate to="/login" replace />}
                      />

                      {/* Pages with main layout */}
                      <Route
                        path="/*"
                        element={
                          <Layout>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/products" element={<Products />} />
                              <Route
                                path="/categories"
                                element={<Products />}
                              />
                              <Route
                                path="/categories/:categoryName"
                                element={<Products />}
                              />
                              <Route path="/deals" element={<Products />} />
                              <Route
                                path="/product/:id"
                                element={<ProductDetailPage />}
                              />
                              <Route path="/cart" element={<Cart />} />
                              <Route
                                path="/track"
                                element={<OrderTracking />}
                              />
                              <Route
                                path="/track/:orderId"
                                element={<OrderConfirmation />}
                              />
                              <Route
                                path="/order-confirmation"
                                element={<OrderConfirmation />}
                              />
                              {/* <Route element={<ProfileLayout />}>
                                <Route
                                  path="/orders"
                                  element={<OrderHistory />}
                                />
                              </Route> */}
                              <Route
                                path="/wishlist-old"
                                element={<Wishlist />}
                              />
                              <Route path="/account" element={<Account />} />
                              <Route path="/contact" element={<ContactUs />} />
                              <Route path="/faqs" element={<FAQs />} />
                              <Route
                                path="/terms"
                                element={<TermsConditions />}
                              />
                              <Route
                                path="/privacy"
                                element={<PrivacyPolicy />}
                              />
                              <Route path="/about" element={<AboutUs />} />
                              <Route path="*" element={<NotFound />} />

                              <Route path="/stores" element={<StoresPage />} />
                              <Route
                                path="/stores/:slug"
                                element={<StoreDetailPage />}
                              />

                              {/* Profile pages wrapped in new layout */}
                              <Route element={<ProfileLayout />}>
                                <Route
                                  path="/profile"
                                  element={<ProfilePage />}
                                />
                                <Route
                                  path="/settings"
                                  element={<SettingsPage />}
                                />
                                <Route
                                  path="/settings/security"
                                  element={<TwoFactorSettingsPage />}
                                />
                                <Route
                                  path="/notifications"
                                  element={<NotificationsPage />}
                                />
                                <Route
                                  path="/wishlist"
                                  element={<WishlistPage />}
                                />
                                <Route
                                  path="/addresses"
                                  element={<AddressesPage />}
                                />
                                <Route
                                  path="/messages"
                                  element={<MessagesPage />}
                                />
                                <Route
                                  path="/messages/:id"
                                  element={<ConversationPage />}
                                />
                                <Route
                                  path="/payments"
                                  element={<PaymentMethodsPage />}
                                />
                                <Route
                                  path="/orders"
                                  element={<OrdersPage />}
                                />
                                <Route
                                  path="/orders/:id"
                                  element={<OrderDetailPage />}
                                />
                              </Route>

                              <Route
                                path="/checkout"
                                element={<CheckoutPage />}
                              />
                            </Routes>
                          </Layout>
                        }
                      />
                    </Routes>
                  </NextUIProvider>
                </BrowserRouter>
              </WishlistProvider>
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
