import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";

/**
 * Nested Layout with Footer
 * Extends Root Layout by adding a footer
 * Used for specific pages: Home, Products, etc.
 */
export function LayoutWithFooter() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}
