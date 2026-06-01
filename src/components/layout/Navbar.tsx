import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Our Services", path: "/services" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-serif tracking-widest text-[#A1824A]">MB <span className="text-white">DIGITAL</span></h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-xs uppercase tracking-widest transition-colors hover:text-[#A1824A]",
                  location.pathname === link.path ? "text-[#A1824A] border-b border-[#A1824A] pb-1" : "text-gray-400"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-[#A1824A] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-[#D4AF37]"
            >
              Start a Project <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-white/10 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-3 text-[11px] uppercase tracking-widest",
                location.pathname === link.path
                  ? "bg-[#161616] text-[#A1824A]"
                  : "text-gray-400 hover:bg-[#121212]"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
