import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Chrome for signed-in pages; auth routes sit outside it. */
export function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
