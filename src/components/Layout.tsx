import { ReactNode } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Nav />
    <main className="flex-1">{children}</main>
    <Footer />
    <CartDrawer />
  </div>
);

export default Layout;
