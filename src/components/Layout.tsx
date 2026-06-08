import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";

const Layout = ({ children }: { children: ReactNode }) => {
  const loc = useLocation();
  const isHome = loc.pathname === "/";
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1" style={{ paddingTop: isHome ? 0 : 58 }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
};

export default Layout;
