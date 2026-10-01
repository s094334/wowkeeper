import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { signOut } from "../api/system";
import { clearAuth, getUser, type StoredUser } from "../lib/authStorage";

const DEFAULT_USER: StoredUser = { name: "使用者", email: "" };

export function AppLayout() {
  const navigate = useNavigate();
  const user = getUser() ?? DEFAULT_USER;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("登出失敗", error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <Outlet />
      <Footer />
    </>
  );
}
