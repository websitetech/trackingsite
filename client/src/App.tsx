import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <AppRoutes />
      </Router>
    </CartProvider>
  );
}

export default App;
