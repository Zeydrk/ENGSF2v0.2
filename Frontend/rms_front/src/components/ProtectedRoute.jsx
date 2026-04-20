import { Route, Navigate } from "react-router-dom";


export default function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Important: must return children if authenticated
  return children;
}
