// Importing necessary libraries and hooks
import { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { useNavigate, Link, BrowserRouter as Router } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FiMail, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";

export default function Forgot() {
  const loginService = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    const user = { email };
    const response = await loginService.forgotPassword(user);
    if (response) {
      toast.info("Reset link sent to your email", {
        className: "alert alert-info text-white",
      });
      setTimeout(() => {
        setIsLoading(false);
        navigate("/login");
      }, 2500);
    } else {
      toast.error("Error in sending reset link", {
        className: "alert alert-error text-white",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 login-container">
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <span className="loading loading-spinner loading-xl text-white"></span>
          <p className="text-white mt-4 text-lg">Loading...</p>
        </div>
      )}
      {/* Autumn decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="autumn-leaf leaf-slow"
          style={{ left: "10%", animationDelay: "0s" }}
        ></div>
        <div
          className="autumn-leaf leaf-fast"
          style={{ left: "20%", animationDelay: "1s" }}
        ></div>
        <div
          className="autumn-leaf leaf-slow leaf-delay-1"
          style={{ left: "30%" }}
        ></div>
        <div
          className="autumn-leaf leaf-fast leaf-delay-2"
          style={{ left: "50%" }}
        ></div>
        <div
          className="autumn-leaf leaf-slow leaf-delay-3"
          style={{ left: "70%" }}
        ></div>
        <div
          className="autumn-leaf leaf-fast"
          style={{ left: "85%", animationDelay: "3s" }}
        ></div>

        {/* Floating elements */}
        <div className="absolute top-16 left-12 w-6 h-6 bg-amber-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-16 w-8 h-8 bg-orange-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-red-400 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-7 h-7 bg-amber-500 rounded-full opacity-35 animate-bounce"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header with enhanced autumn styling */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-linear-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-2xl">?</span>
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
            Forgot Password
          </h2>
          <p className="mt-3 text-center text-lg text-amber-700 font-medium">
            Enter your email to reset your password
          </p>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-3xl border border-amber-100/50 transform hover:shadow-amber-200/50 transition-all duration-300">
          {/* Forgot Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  onChange={handleEmailChange}
                  className="register-input appearance-none block w-full px-5 py-4 border-2 border-amber-200 rounded-xl shadow-sm placeholder-amber-400 focus:outline-none focus:ring-3 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-gray-800 text-lg"
                  placeholder="your@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <p className="mt-2 text-xs text-amber-600">
                Enter the email address associated with your account
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-amber-500 transform hover:scale-105 transition-all duration-200 ${
                  isLoading
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:shadow-2xl"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="registration-loading mr-2"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-amber-600 hover:text-amber-500 font-semibold transition-colors duration-200 text-lg"
            >
              <FiArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-amber-600 hover:text-amber-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-amber-600/70">
              We'll send you a secure link to reset your password. The link
              expires in 1 hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
