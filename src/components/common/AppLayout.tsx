import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
