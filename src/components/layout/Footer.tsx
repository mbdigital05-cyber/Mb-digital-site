import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1 border-b border-white/10 pb-8 md:border-0 md:pb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <h1 className="text-2xl font-serif tracking-widest text-[#A1824A]">MB <span className="text-white">DIGITAL</span></h1>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              A full-service digital agency crafting experiences that matter. We help forward-thinking brands stand out.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1EbRBgFb1q/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#A1824A] hover:bg-[#A1824A]/10 transition-all">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://www.instagram.com/mbdigital05?igsh=MXRiMGF5ZnBuaDIyeg==" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#A1824A] hover:bg-[#A1824A]/10 transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/services/corporate-branding" className="hover:text-white transition-colors">Corporate Branding</Link></li>
              <li><Link to="/services/web-development" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/services/digital-advertising" className="hover:text-white transition-colors">Digital Marketing</Link></li>
              <li><Link to="/services/business-automation" className="hover:text-white transition-colors">Business Automation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#A1824A] mb-1">Email</span>
                <a href="mailto:info@mbdigital.com.ng" className="hover:text-white transition-colors">info@mbdigital.com.ng</a>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#A1824A] mb-1">Phone</span>
                <a href="tel:+2348104086523" className="hover:text-white transition-colors">+234 810 408 6523</a>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#A1824A] mb-1">Address</span>
                <span>Abuja, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500">
          <p>© {new Date().getFullYear()} MB Digital. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
