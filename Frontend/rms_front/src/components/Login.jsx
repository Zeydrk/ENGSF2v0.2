// Importing necessary libraries and hooks
import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate, Link, BrowserRouter as Router } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Register from "./Register";
import Forgot from "./Forgot";

export default function Login({ onLogin }) {
  const loginService = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //   Setting handlers for input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Setting handler for input submission
  async function handleSubmit(e) {
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
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-base-200"
      data-theme="autumn"
    >
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <span className="loading loading-spinner loading-xl text-white"></span>
          <p className="text-white mt-4 text-lg">Logging in...</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold justify-center mb-4">
              Login
            </h2>

            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Enter your Email"
                className="input input-bordered w-full"
                onChange={handleEmailChange}
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label" htmlFor="password">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>

            <div className="form-control mt-4 text-center">
              <p>
                Forget Password?{" "}
                <Link
                  to="/forgot-password"
                  className="underline text-red-500"
                  element={<Forgot />}
                >
                  Click Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}