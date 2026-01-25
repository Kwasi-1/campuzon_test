import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
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
} from '@/pages';

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
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/stores/:slug" element={<StoreDetailPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-2fa" element={<VerifyTFAPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            
            {/* User Account Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/security" element={<TwoFactorSettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/payments" element={<PaymentMethodsPage />} />
            
            {/* Order Routes */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            
            {/* Messaging Routes */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:id" element={<ConversationPage />} />
            
            {/* Auth Callback */}
            <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
            
            {/* Become a Seller */}
            <Route path="/become-seller" element={<BecomeSellerPage />} />
            
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/products/new" element={<SellerAddProductPage />} />
            <Route path="/seller/products/:productId/edit" element={<SellerAddProductPage />} />
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
