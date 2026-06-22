import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/src/constants";
import * as Icons from "lucide-react";

export default function Services() {
  useEffect(() => {
    document.title = "Our Creative & Digital Services | MB Digital Abuja";
  }, []);

  return (
    <div className="pt-20">
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2560&auto=format&fit=crop" 
            alt="Services Banner" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block">Expertise</span>
          <h1 className="text-4xl lg:text-6xl font-serif text-white tracking-tight mb-6 italic">
            Our Services
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed uppercase tracking-widest max-w-xl mx-auto">
            From inception to scale, we provide end-to-end digital expertise. 
            Select a service below to see how we can accelerate your business.
          </p>
        </div>
      </section>

      <section className="pb-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {SERVICES.map((service, index) => {
               const IconComponent = (Icons as any)[service.icon] || Icons.Code;
               return (
                <div key={service.id} className="group flex flex-col md:flex-row bg-[#121212] border border-white/5 hover:border-[#A1824A]/50 transition-all duration-500">
                  <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden flex-shrink-0">
                    <img 
                      src={service.imageUrl} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-[#0A0A0A]/40 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                  <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative">
                    <div className="absolute top-8 right-8 text-[#A1824A] font-serif italic text-4xl opacity-20">
                      0{index + 1}
                    </div>
                    <div className="flex items-center space-x-3 mb-6">
                      <IconComponent className="h-5 w-5 text-[#A1824A]" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1824A]">Specialty</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-4 italic">{service.title}</h2>
                    <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-lg">{service.shortDescription}</p>
                    <div className="mt-auto">
                      <Link 
                        to={`/services/${service.id}`}
                        className="inline-flex items-center text-[10px] uppercase tracking-widest text-[#E5E5E5] border-b border-white/20 pb-1 hover:border-[#A1824A] hover:text-[#A1824A] transition-all"
                      >
                        Explore {service.title}
                      </Link>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
