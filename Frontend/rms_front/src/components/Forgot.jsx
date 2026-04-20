// Importing necessary libraries and hooks
import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate, Link, BrowserRouter as Router } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";


export default function Forgot() {
  const loginService = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  }  
  
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const user = {email}
    const response = await loginService.forgotPassword(user);
    if(response){
        toast.info("Reset link sent to your email", {
            className: "alert alert-info text-white",
          });
        setTimeout(() => {
            setIsLoading(false);
            navigate("/login");
        }, 2500);
    }
    else{
        toast.error("Error in sending reset link", {
            className: "alert alert-error text-white",
            });
        setIsLoading(false);
        }
    }


  return (
    <div
      className="flex items-center justify-center min-h-screen bg-base-200"
      data-theme="autumn"
    >
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 z-50">
          <span className="loading loading-spinner loading-xl text-white"></span>
          <p className="text-white mt-4 text-lg">Loading...</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold justify-center mb-4">
              Confirm Email
            </h2>

            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="email"
                id="username"
                name="username"
                placeholder="Confirm your email address"
                className="input input-bordered w-full"
                onChange={handleEmailChange}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Submit"}
              </button>
            </div>

            <div className="form-control mt-4 text-center">
              <p>
                Go Back to{" "}
                <Link
                  to="/login"
                  className="underline text-red-500"
                  element={<Login />}
                >
                  Login Page
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
