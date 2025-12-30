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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-2fa" element={<VerifyTFAPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings/security" element={<TwoFactorSettingsPage />} />
            <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
            
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
