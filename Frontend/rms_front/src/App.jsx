// import react library/components
import { useEffect, useState } from 'react'
import './App.css'
import Toasters from './components/Toasters'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// Importing components
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import Navigation from './components/Navigation/navbar'
import Product from './components/Product/Products'
import Sellers from "./components/seller/Sellers";
import ProductPage from './components/ProductPage';
import Forgot from './components/Login/Forgot'
import Reset from './components/Reset'
import Package from './components/package/Package'
import ArchivedPackages from './components/package/ArchivedPackages';

const ProtectedLayout = ({ children, onLogout }) => (
  <>
    <Navigation onLogout={onLogout} />
    {children}
  </>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>  {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        // 2. Ask the backend if the cookie we have is actually valid
        const response = await checkSession(); 
        if (response.status === 200) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        // 3. If backend says 401 (Unauthorized), we are definitely logged out
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  }

  const handleLogout = async () => {
    try {
      await logoutAdmin(); // Calls your backend logout route
      setIsLoggedIn(false); // Update React state
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Router>
      <Toasters/>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login onLogin={handleLogin}/>} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <Navigation />
            <Home />
          </ProtectedRoute>
        }/>
        
        <Route path='/package' element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <Navigation />
            <Package />
          </ProtectedRoute>
        }/>
        
        {/* ADD THIS ROUTE FOR ARCHIVED PACKAGES */}
        <Route path='/archived-packages' element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <Navigation />
            <ArchivedPackages />
          </ProtectedRoute>
        }/>
        
        <Route path="/product" element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <Navigation />
            <Product />
          </ProtectedRoute>
        }/>
        
        <Route path="/scan/:id" element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <Navigation />
            <ProductPage />
          </ProtectedRoute>
        }/>
        
        <Route path="/seller" element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <Navigation />
            <Sellers />
          </ProtectedRoute>
        }/>
        
        {/* Public routes */}
        <Route path="/forgot-password/" element={<Forgot />} />
        <Route path="/reset-password/" element={<Reset />} />
      </Routes>
    </Router>
  )
}

export default App