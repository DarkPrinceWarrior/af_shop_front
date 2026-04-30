import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { ShopProvider } from '@/state/store';
import Layout from '@/Layout';
import CatalogPage from '@/pages/CatalogPage';
import CheckoutPage from '@/pages/CheckoutPage';
import SuccessPage from '@/pages/SuccessPage';
import './styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'orders/:orderNumber/success', Component: SuccessPage },
    ],
  },
]);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <ShopProvider>
      <RouterProvider router={router} />
    </ShopProvider>
  </StrictMode>,
);
