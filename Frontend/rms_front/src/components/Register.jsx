// Importing hooks
import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin"; 
import { Link, useNavigate} from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Main function
export default function Register() {
  // Hooks and states
  const loginService = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //   Setting handlers for input changes
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  }

  // Setting function for alert

  // Setting handler for input submission
  async function handleSubmit(e) {
    e.preventDefault();
    // check if the passwords match, if it does, it will not accept it
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please try again.", {
        className: "alert alert-error text-white",
      });
    }
    else{
        // Make sure to add the middleware after learning it this friday
        const user = { email, password };
        loginService.createAdmin(user)
        .then(res =>{
          toast.success("Registration Successful", {
            className: "alert alert-success text-white",
          })
        })
        .catch(res=>{
          toast.error("Registration failed. Please try again.", {
            className: "alert alert-error text-white",
          });
        })
    }
  }
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-base-200"
      data-theme="autumn"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold justify-center mb-4">
              Register
            </h2>

            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Enter your email"
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
                minLength={8}
                maxLength={20}
                // setup
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label" htmlFor="password">
                <span className="label-text font-semibold">Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder="Confirm your password"
                className="input input-bordered w-full"
                onChange={handleConfirmPasswordChange}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary w-full">
                Login
              </button>
            </div>

            <div className="form-control mt-4 text-center">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline text-red-500"
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
