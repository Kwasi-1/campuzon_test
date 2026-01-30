import { Link } from "react-router-dom";
import logo from "@/assets/images/CAMPUZONV2LT.png";
import { CATEGORY_OPTIONS } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 mt-auto border-t border-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Shop (Categories) */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-sm">Shop</h3>
            <ul className="space-y-2.5">
              {CATEGORY_OPTIONS.slice(0, 6).map((category) => (
                <li key={category.value}>
                  <Link
                    to={`/products?category=${category.value}`}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer (Quick Links) */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-sm">
              Customer
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Partnership
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Selling
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Providing
                </Link>
              </li>
              <li>
                <Link
                  to="/affiliate"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Affiliate
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect (Social Media) */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-sm">
              Connect
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  aria-label="Twitter"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-sm">
              Security
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/cookies"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/payment"
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Payment
                </Link>
              </li>
            </ul>
          </div>

          {/* Logo Section - Last column */}
          <div>
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="Campuzon"
                className="h-10 md:h-14 object-contain"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              Copyright {currentYear} Campuzon. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}