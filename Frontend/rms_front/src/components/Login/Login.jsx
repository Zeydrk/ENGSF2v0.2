import { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useNavigate, Link, BrowserRouter } from 'react-router-dom';
import { 
  FiMail, 
  FiEye, 
  FiEyeOff,
  FiGithub,
  FiCheckSquare,
} from 'react-icons/fi';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Login.css";


export default function Login({onLogin}) {
  const loginService = useAdmin();
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); 
  }



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);


    const user = { email, password };
    loginService.fetchAdmins(user)
    .then(res =>{
      toast.success("Login Successful", {
        className: "alert alert-success text-white",
      });
      onLogin(); // Notify parent component of successful login
      setTimeout(() => {
        setIsLoading(false);
        navigate("/");
      }, 3000);
    })
    .catch(res=>{
       toast.error("Login failed. Please check your credentials.", {
        className: "alert alert-error text-white",
      });
      setIsLoading(false);
    })
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 login-container">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <span className="loading loading-spinner loading-xl text-white"></span>
          <p className="text-white mt-4 text-lg">Signing in...</p>
        </div>
      )}
      {/* Autumn decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="autumn-leaf leaf-slow" style={{ left: '10%', animationDelay: '0s' }}></div>
        <div className="autumn-leaf leaf-fast" style={{ left: '20%', animationDelay: '1s' }}></div>
        <div className="autumn-leaf leaf-slow leaf-delay-1" style={{ left: '30%' }}></div>
        <div className="autumn-leaf leaf-fast leaf-delay-2" style={{ left: '50%' }}></div>
        <div className="autumn-leaf leaf-slow leaf-delay-3" style={{ left: '70%' }}></div>
        <div className="autumn-leaf leaf-fast" style={{ left: '85%', animationDelay: '3s' }}></div>
        
        {/* Floating elements */}
        <div className="absolute top-16 left-12 w-6 h-6 bg-amber-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-16 w-8 h-8 bg-orange-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-red-400 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-7 h-7 bg-amber-500 rounded-full opacity-35 animate-bounce"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
 
        <div className="text-center">

          <h2 className="mt-6 text-center text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-lg text-amber-700 font-medium">
            Sign in to your account
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-3xl border border-amber-100/50 transform hover:shadow-amber-200/50 transition-all duration-300">
      
          <form className="space-y-7" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="register-input appearance-none block w-full px-5 py-4 border-2 border-amber-200 rounded-xl shadow-sm placeholder-amber-400 focus:outline-none focus:ring-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-gray-800 text-lg"
                  placeholder="your@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                {/* Enhanced Recoverability principle */}
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="register-input appearance-none block w-full px-5 py-4 border-2 border-amber-200 rounded-xl shadow-sm placeholder-amber-400 focus:outline-none focus:ring-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-gray-800 text-lg pr-10"
                  placeholder="Enter your password"
                />
                <div className="text-sm mt-2">
                  <Link to="/forgot-password" className="font-semibold text-amber-600 hover:text-amber-500 transition-colors duration-200 hover:underline ">
                    Forgot password?
                  </Link>
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-amber-400 hover:text-amber-500 transition-colors duration-200"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

          

      
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-amber-500 transform hover:scale-105 transition-all duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="registration-loading mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in to your account'
                )}
              </button>
            </div>
          </form>

        

          {/* Enhanced redirect section */}
          <div className="mt-9 text-center">
            <p className="text-base text-gray-700">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-amber-600 hover:text-amber-500 transition-colors duration-200 hover:underline text-lg">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="mt-8 text-center">
        <p className="text-xs text-amber-600/70">
          🔒 Your security is our priority. We use end-to-end encryption to protect your data.
        </p>
      </div>
    </div>
  )
}
