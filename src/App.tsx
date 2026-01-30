import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootLayout, LayoutWithFooter, SellLayout } from "@/components/layout";
import {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  LoginPage,
  RegisterPage,
  StoresPage,
  StoreDetailPage,
  CompleteProfilePage,
  GoogleCallbackPage,
  VerifyTFAPage,
  TwoFactorSettingsPage,
  ProfilePage,
  SellerDashboardPage,
  SellerProductsPage,
  SellerAddProductPage,
  SellerOrdersPage,
  SellerMessagesPage,
  SellerSettingsPage,
  BecomeSellerPage,
  CheckoutPage,
  OrderConfirmationPage,
  OrdersPage,
  OrderDetailPage,
  WishlistPage,
  MessagesPage,
  ConversationPage,
  AddressesPage,
  PaymentMethodsPage,
  NotificationsPage,
  SettingsPage,
} from "@/pages";
import { StoreLayout } from "./components/layout/StoreLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Root Layout - Includes main header */}
          <Route element={<RootLayout />}>
            {/* Nested Layout with Footer - For home and products pages */}
            <Route element={<LayoutWithFooter />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Route>

            {/* Public Routes - Without footer */}
            <Route path="/products/:id" element={<ProductDetailPage />} />
            
            <Route path="/cart" element={<CartPage />} />

            {/* Auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-2fa" element={<VerifyTFAPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route
              path="/auth/google/callback"
              element={<GoogleCallbackPage />}
            />

            {/* User Account Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/settings/security"
              element={<TwoFactorSettingsPage />}
            />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/payments" element={<PaymentMethodsPage />} />

            {/* Order Routes */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />

            {/* Messaging Routes */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:id" element={<ConversationPage />} />

            {/* Become a Seller */}
          </Route>

          <Route path="" element={<StoreLayout />}>
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/stores/:slug" element={<StoreDetailPage />} />
            <Route path="/become-seller" element={<BecomeSellerPage />} />
          </Route>

          {/* Sell Route Layout - Completely isolated with unique header */}
          <Route element={<SellLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route
              path="/seller/products/new"
              element={<SellerAddProductPage />}
            />
            <Route
              path="/seller/products/:productId/edit"
              element={<SellerAddProductPage />}
            />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/messages" element={<SellerMessagesPage />} />
            <Route path="/seller/settings" element={<SellerSettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
