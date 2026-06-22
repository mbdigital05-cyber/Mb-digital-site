import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  useEffect(() => {
    document.title = "About Us | MB Digital - Premium Creative Agency in Abuja";
  }, []);

  return (
    <div className="pt-20">
      <section className="relative pt-40 pb-32 lg:pt-48 lg:pb-40 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2560&auto=format&fit=crop" 
            alt="About Banner" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block">About Us</span>
            <h1 className="text-4xl lg:text-6xl font-serif text-white tracking-tight mb-6 italic">
              We are <span className="text-[#A1824A]">MB Digital</span>
            </h1>
            <p className="text-base text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Founded on the belief that digital products should be as elegant as they are functional, 
              MB Digital has grown into a premier agency for brands that refuse to blend in.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#121212] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="flex gap-6 items-start">
                <div className="w-px h-full min-h-[100px] bg-[#A1824A]"></div>
                <div>
                  <h3 className="text-white uppercase tracking-widest text-xs font-bold mb-4">Our Mission</h3> 
                  <p className="leading-relaxed text-sm text-gray-400">
                    To bridge the gap between creative design and robust engineering, 
                    delivering solutions that drive measurable business growth through 
                    innovative technology and visionary design.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-px h-full min-h-[100px] bg-white/20"></div>
                <div>
                  <h3 className="text-white uppercase tracking-widest text-xs font-bold mb-4">Our Vision</h3> 
                  <p className="leading-relaxed text-sm text-gray-400">
                    To be the catalyst for the next generation of digital-first organizations,
                    shaping the future of online interactions by building experiences that 
                    matter and establishing robust structural blueprints.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 border border-[#A1824A]/30 transform translate-x-4 translate-y-4 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" 
                alt="MB Digital Abstract Art" 
                className="object-cover h-[500px] w-full border border-white/5 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block text-center">Process</span>
            <h2 className="text-3xl lg:text-4xl font-serif text-white mb-4 italic text-center">Our Methodology</h2>
            <p className="text-sm text-gray-400 text-center uppercase tracking-widest mx-auto max-w-sm">We don't guess. We research, prototype, and iterate.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-t border-white/5 bg-[#161616] group hover:border-[#A1824A]/50 transition-all text-center md:text-left">
              <div className="text-[#A1824A] font-serif italic text-4xl mb-6">01</div>
              <h3 className="text-lg font-serif text-white mb-3 tracking-wide">Discovery & Strategy</h3>
              <p className="text-xs text-gray-400 leading-relaxed">We immerse ourselves in your brand, understanding your audience, competitors, and goals to build a solid foundation.</p>
            </div>
            <div className="p-8 border-t border-white/5 bg-[#161616] group hover:border-[#A1824A]/50 transition-all text-center md:text-left">
              <div className="text-[#A1824A] font-serif italic text-4xl mb-6">02</div>
              <h3 className="text-lg font-serif text-white mb-3 tracking-wide">Design & Development</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Our cross-functional teams work in tandem to create striking designs backed by scalable, secure architecture.</p>
            </div>
            <div className="p-8 border-t border-white/5 bg-[#161616] group hover:border-[#A1824A]/50 transition-all text-center md:text-left">
              <div className="text-[#A1824A] font-serif italic text-4xl mb-6">03</div>
              <h3 className="text-lg font-serif text-white mb-3 tracking-wide">Optimization & Scale</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Launch is just the beginning. We continuously monitor, A/B test, and refine to maximize your ROI.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0A0A0A] text-center border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-serif italic text-white mb-8">Let's build something extraordinary.</h2>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black bg-[#A1824A] transition-colors hover:bg-[#D4AF37]"
          >
            Contact our team
          </Link>
        </div>
      </section>
    </div>
  );
}
