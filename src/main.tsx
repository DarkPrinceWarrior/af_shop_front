import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ShopProvider } from './state/store';
import './styles/globals.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <ShopProvider>
      <App />
    </ShopProvider>
  </StrictMode>,
);
