import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getCookie } from "../../utils/cookies";

const ProtectedRoute = ({ element }) => {
  const { authenticated = false } = useSelector(state => state.auth);
  const c_authenticated = getCookie("authenticated")

  return authenticated || c_authenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;