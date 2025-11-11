import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { checkJwtExistsAndExpired } from "../services/AuthService";

function PublicRoute() {
  const auth = checkJwtExistsAndExpired();
  const location = useLocation();

  // Redirect authenticated users away from the login page
  if (auth) {
    return <Navigate to={location.state?.from || "/"} />;
  }

  // Render the child components if not authenticated
  return <Outlet />;
}

export default PublicRoute;
