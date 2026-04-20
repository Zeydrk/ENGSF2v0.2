import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiTruck,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown
} from 'react-icons/fi';

const Navigation = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/product', label: 'Products', icon: FiPackage },
    { path: '/seller', label: 'Sellers', icon: FiUsers },
    { path: '/package', label: 'Packages', icon: FiTruck },
  ];

  

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-amber-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button - Now on the left */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Logo/Brand - Centered on mobile */}
          <div className="flex items-center absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <Link 
              to="/" 
              className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-orange-700"
              onClick={closeAllMenus}
            >
              Inventory Management
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-amber-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isUserDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown - Only Sign Out */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-amber-100 py-2 z-50">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-amber-50 w-full text-left transition-colors duration-200"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-linear-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Placeholder for mobile to balance the layout */}
          <div className="flex md:hidden items-center">
            {user && (
              <div className="w-8 h-8 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu - Fixed background color */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay for mobile menu */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={closeAllMenus}
            />
            
            {/* Mobile menu content - Fixed white background */}
            <div className="md:hidden bg-white border-r border-amber-100 py-4 fixed top-0 left-0 bottom-0 w-64 z-50 shadow-lg">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-amber-100 bg-white">
                <div className="text-lg font-semibold text-amber-700">Menu</div>
                <button
                  onClick={closeAllMenus}
                  className="p-1 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 p-4 bg-white">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium bg-white ${
                        isActive
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      onClick={closeAllMenus}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* User Section - Mobile - Only Sign Out */}
              {user && (
                <div className="mt-auto pt-4 border-t border-amber-100 px-4 bg-white">
                  <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-amber-50 rounded-xl">
                    <div className="w-10 h-10 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl w-full text-left transition-colors duration-200 bg-white"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;