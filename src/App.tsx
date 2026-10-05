import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ConfigProvider } from './context/ConfigContext';

import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { WishlistPage } from './pages/WishlistPage';
import { BagPage } from './pages/BagPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AccountAddressesPage } from './pages/AccountAddressesPage';
import { WalletPage } from './pages/WalletPage';
import { InsiderPage } from './pages/InsiderPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { GiftCardsPage } from './pages/GiftCardsPage';
import { CouponsPage } from './pages/CouponsPage';
import { SavedPaymentPage } from './pages/SavedPaymentPage';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';
import { CheckoutAddressPage } from './pages/CheckoutAddressPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ConfigProvider>
          <BrowserRouter>
          <Routes>
            {/* Dedicated Admin Management Console */}
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/*" element={<AdminPage />} />

            {/* Standard storefront shell routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="men" element={<ListingPage />} />
              <Route path="women" element={<ListingPage />} />
              <Route path="kids" element={<ListingPage />} />
              <Route path="clothing" element={<ListingPage />} />
              <Route path="clothes" element={<ListingPage />} />
              <Route path="shop" element={<ListingPage />} />
              <Route path="collection" element={<ListingPage />} />
              <Route path="all" element={<ListingPage />} />
              <Route path="category/:category" element={<ListingPage />} />
              <Route path=":gender/:category" element={<ListingPage />} />
              <Route path="product/:slug" element={<ProductDetailPage />} />
              <Route path="search" element={<SearchResultsPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="bag" element={<BagPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="shipping-policy" element={<ShippingPolicyPage />} />

              {/* Protected Account Portal Routes */}
              <Route
                path="account"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/addresses"
                element={
                  <ProtectedRoute>
                    <AccountAddressesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/insider"
                element={
                  <ProtectedRoute>
                    <InsiderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/gift-cards"
                element={
                  <ProtectedRoute>
                    <GiftCardsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/coupons"
                element={
                  <ProtectedRoute>
                    <CouponsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/saved-payment"
                element={
                  <ProtectedRoute>
                    <SavedPaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account/settings"
                element={
                  <ProtectedRoute>
                    <NotificationSettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Distraction-free Checkout Flow */}
            <Route path="checkout/address" element={<CheckoutAddressPage />} />
            <Route path="checkout/payment" element={<CheckoutPaymentPage />} />
            <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
          </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
