import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import TrackingForm from './components/TrackingForm';
import ActionButtons from './components/ActionButtons';
import LoginModal from './components/LoginModal';
import EstimateModal from './components/EstimateModal';
import ShipModal from './components/ShipModal';
import NewCustomerModal from './components/NewCustomerModal';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TrackingPage from './components/TrackingPage';
import UserPage from './components/UserPage';
import ShipmentPage from './pages/ShipmentPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import FAQPage from './pages/FAQPage';
import AdminDashboard from './pages/AdminDashboard';


interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

function AppRoutes() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showShip, setShowShip] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/'); // Redirect to landing page
    window.location.href = '/'; // Fallback: force reload to landing page
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleRegisterClick = () => {
    setShowNewCustomer(true);
  };



  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setShowLogin(false);
    navigate('/user');
  };

  return (
    <div className="App">
      <Header 
        user={user}
        onLogin={handleLoginClick}
        onRegister={handleRegisterClick}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={
          user ? <UserPage user={user} /> : (
            <>
              {/* Hero Section with LogiHub-style background */}
              <section className="hero-bg logihub-hero">
                <div 
                  className="hero-background-image"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: 'url(/toronto-delivery-vehicles-bg.jpg?v=2)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                    objectFit: 'cover',
                    zIndex: -1
                  }}
                ></div>
                <div className="hero-overlay"></div>
                
                {/* Centered Content */}
                <div className="hero-content-center">
                  <ActionButtons 
                    onEstimate={() => setShowEstimate(true)}
                    onShip={() => setShowShip(true)}
                  />
                  </div>
              </section>

              {/* Tracking Section with Company Quote */}
              <section className="tracking-section">
                <div className="tracking-container">
                  <div className="tracking-content-left">
                                     <div className="tracking-card">
                     <TrackingForm />
                   </div>
                  </div>
                  <div className="tracking-content-right">
                    <div className="company-quote-overlay">
                      <div className="who-we-are-tag">Who we are</div>
                      <h2 className="company-name">Noble-SpeedyTrac Inc.</h2>
                      <p className="company-description">
                        "At NobleSpeedytrac, we specialize in fast, reliable, and secure logistics solutions tailored to your business needs. From first mile to last mile, we ensure your cargo reaches its destination on time, every time."
                      </p>
                      <p className="company-tagline">
                        "Your trusted logistics partner — driven by precision, powered by innovation."
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              {/* Service Cards Section */}
              <section className="service-cards-section">
                <div className="service-cards-container">
                  <div className="service-card-item">
                    <div className="service-card-icon">
                      <span>📦</span>
                    </div>
                    <h3>Rapid Freight Services</h3>
                    <p>Fast and reliable shipping solutions for urgent deliveries</p>
                  </div>
                  <div className="service-card-item">
                    <div className="service-card-icon">
                      <span>🚚</span>
                    </div>
                    <h3>Secure Transportation</h3>
                    <p>Safe handling and transport of sensitive cargo</p>
                  </div>
                  <div className="service-card-item">
                    <div className="service-card-icon">
                      <span>⚡</span>
                    </div>
                    <h3>All Freight Solutions</h3>
                    <p>Comprehensive logistics for all your shipping needs</p>
                  </div>
                </div>
              </section>

              {/* Drive Your Business Forward Section */}
              <section className="business-forward-section">
                <div className="business-forward-container">
                  <div className="business-forward-content">
                    <h2>Drive Your Business Forward with NobleSpeedytrac</h2>
                    <div className="features-list">
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Same-day delivery options</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Real-time tracking</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Professional handling</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Competitive pricing</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>24/7 customer support</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>Specialized cargo handling</span>
                      </div>
                    </div>
                    <button className="cta-button" onClick={() => setShowShip(true)}>
                      Get Started
                    </button>
                  </div>
                  <div className="business-forward-image">
                    <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80" alt="Logistics Operations" />
                    <div className="experience-badge">
                      <span className="experience-years">15+</span>
                      <span className="experience-text">Years Experience</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Speed Precision Excellence Section */}
              <section className="spe-section">
                <div className="spe-container">
                  <div className="spe-item">
                    <h3>Speed</h3>
                    <div className="spe-arrow">→</div>
                  </div>
                  <div className="spe-item">
                    <h3>Precision</h3>
                    <div className="spe-arrow">→</div>
                  </div>
                  <div className="spe-item">
                    <h3>Excellence</h3>
                  </div>
                </div>
              </section>

              {/* What We Offer Section */}
              <section className="what-we-offer-section">
                <div className="what-we-offer-container">
                  <div className="section-header">
                    <h2>What We Offer</h2>
                    <button className="view-all-btn" onClick={() => setShowEstimate(true)}>
                      View All
                    </button>
                  </div>
                  <div className="offer-items">
                    <div className="offer-item">
                      <div className="offer-icon">
                        <span>📋</span>
                      </div>
                      <div className="offer-content">
                        <h3>Freight Consultation</h3>
                        <p>Expert advice on shipping solutions and logistics optimization</p>
                      </div>
                    </div>
                    <div className="offer-item">
                      <div className="offer-icon">
                        <span>📊</span>
                      </div>
                      <div className="offer-content">
                        <h3>Warehousing & Distribution</h3>
                        <p>Secure storage and efficient distribution network management</p>
                      </div>
                    </div>
                    <div className="offer-item">
                      <div className="offer-icon">
                        <span>🚛</span>
                      </div>
                      <div className="offer-content">
                        <h3>Supply Chain Management</h3>
                        <p>End-to-end supply chain solutions for optimal efficiency</p>
                      </div>
                    </div>
                    <div className="offer-item">
                      <div className="offer-icon">
                        <span>🎯</span>
                      </div>
                      <div className="offer-content">
                        <h3>E-commerce Integration</h3>
                        <p>Seamless integration with your online business operations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Statistics Section */}
              <section className="statistics-section">
                <div className="statistics-container">
                  <div className="testimonial-text">
                    <p>"We love reliable and strategic fleet and logistics services that streamlines our operations. Happy to work with NobleSpeedytrac!"</p>
                  </div>
                  <div className="statistics-grid">
                    <div className="stat-item">
                      <span className="stat-number">348+</span>
                      <span className="stat-label">Happy Clients</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">499+</span>
                      <span className="stat-label">Projects Completed</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">150+</span>
                      <span className="stat-label">Professional Team</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">99.9%</span>
                      <span className="stat-label">Success Rate</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Specialized Services Section */}
              <section className="specialized-services-section">
                <div className="specialized-container">
                  <div className="specialized-content">
                    <h2>Specialized Services</h2>
                    <div className="specialized-services">
                      <div className="specialized-item">
                        <span>Technology & Electronics</span>
                      </div>
                      <div className="specialized-item">
                        <span>Medical Supplies</span>
                      </div>
                      <div className="specialized-item">
                        <span>Manufacturing Products</span>
                      </div>
                      <div className="specialized-item">
                        <span>Confidential Documents</span>
                      </div>
                    </div>
                    <button className="specialized-cta" onClick={() => setShowEstimate(true)}>
                      Learn More
                    </button>
                  </div>
                  <div className="specialized-image">
                    <img src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80" alt="Specialized Services" />
                  </div>
                </div>
              </section>

              {/* Floating Action Button for Quick Tracking */}
              <div className="floating-action-btn" onClick={() => document.querySelector('.tracking-card')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="fab-icon">📦</span>
                <span className="fab-text">Track</span>
              </div>
            </>
          )
        } />
        <Route path="/user" element={user ? <UserPage user={user} /> : <div>Please log in to view your dashboard.</div>} />
        <Route path="/profile" element={user ? <ProfilePage /> : <div>Please log in to view your profile.</div>} />
        <Route path="/track/:trackingNumber" element={<TrackingPage />} />
        <Route path="/shipment" element={user ? <ShipmentPage /> : <div>Please log in to create a shipment.</div>} />
        <Route path="/cart" element={user ? <CartPage /> : <div>Please log in to view your cart.</div>} />
        <Route path="/payment" element={user ? <PaymentPage /> : <div>Please log in to make a payment.</div>} />
        <Route path="/payment-success" element={user ? <PaymentSuccessPage /> : <div>Please log in to view payment success.</div>} />
        <Route path="/orders" element={user ? <OrderHistoryPage /> : <div>Please log in to view your orders.</div>} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/admin" element={
          user && user.role === 'admin' ? 
            <AdminDashboard /> : 
            <div style={{ 
              minHeight: '100vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#f3f4f6',
              color: '#dc2626',
              fontSize: '1.25rem',
              textAlign: 'center',
              padding: '2rem'
            }}>
              {user ? 'Access denied. Admin privileges required.' : 'Please log in to access admin dashboard.'}
            </div>
        } />
      </Routes>
      {/* Footer / Bottom Banner */}
      <footer className="footer-banner">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">📦</span>
            <span className="footer-brand">NobleSpeedytrac</span>
          </div>
          <div className="footer-center">
            &copy; {new Date().getFullYear()} NobleSpeedytrac. All rights reserved.
          </div>
          <div className="footer-right">
            <span>Contact: <a href="mailto:info@noblespeedytrac.com">info@noblespeedytrac.com</a></span>
            <span> | </span>
            <span>+1 (555) 123-4567</span>
          </div>
        </div>
      </footer>
      {/* Modals */}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowNewCustomer(true);
          }}
        />
      )}
      {showEstimate && (
        <EstimateModal 
          onClose={() => setShowEstimate(false)}
        />
      )}
      {showShip && (
        <ShipModal 
          onClose={() => setShowShip(false)}
          user={user}
        />
      )}
      {showNewCustomer && (
        <NewCustomerModal 
          onClose={() => setShowNewCustomer(false)}
        />
      )}
    </div>
  );
}

export default AppRoutes; 