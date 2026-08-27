import { Navigate, Outlet } from "react-router";
import { getToken } from "../../lib/authStorage";

export function CheckAuth() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
