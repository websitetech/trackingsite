import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
