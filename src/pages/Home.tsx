import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { SERVICES, TESTIMONIALS } from "@/src/constants";
import * as Icons from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

export default function Home() {
  useEffect(() => {
    document.title = "MB Digital | Creative Strategy & Digital Agency in Abuja, Nigeria";
  }, []);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  
  // Create a parallax translation. Moves the background image down as user scrolls down.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section ref={ref} className="relative pt-40 pb-32 lg:pt-56 lg:pb-40 overflow-hidden bg-[#0A0A0A]">
        <motion.div style={{ y }} className="absolute inset-0 z-0 h-[120%] -top-[10%]">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        </motion.div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="max-w-3xl"
          >
            <motion.span 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block"
            >
              Creative Strategy Agency
            </motion.span>
            <motion.h1 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="text-5xl lg:text-7xl font-serif tracking-tight text-white mb-6 italic leading-tight"
            >
              We build <span className="text-[#A1824A]">digital experiences</span> that drive growth.
            </motion.h1>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="text-sm text-gray-400 mb-10 max-w-2xl leading-relaxed"
            >
              MB Digital is a full-service agency specializing in corporate branding, 
              scalable web products, and data-driven marketing.
            </motion.p>
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="flex flex-col sm:flex-row gap-8 sm:items-center"
            >
              <Link
                to="/contact"
                className="inline-flex justify-center px-8 py-3 bg-[#A1824A] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors"
              >
                Let's Talk
              </Link>
              <Link
                to="/services"
                className="inline-flex text-[11px] uppercase tracking-widest text-[#E5E5E5] border-b border-white/20 pb-1 hover:border-[#A1824A] hover:text-[#A1824A] transition-all w-max"
              >
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Snapshot */}
      <section className="py-24 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-serif text-white mb-4 italic">Our Core Services</h2>
            <p className="text-xs text-gray-400 uppercase tracking-[0.2em] max-w-sm">Comprehensive solutions for modern brands.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.slice(0, 3).map((service, idx) => {
              const IconComponent = (Icons as any)[service.icon] || Icons.Code;
              return (
                <Link 
                  key={service.id} 
                  to={`/services/${service.id}`}
                  className="group block p-8 border border-white/5 bg-[#161616] hover:border-[#A1824A]/50 transition-all"
                >
                  <div className="text-[10px] text-[#A1824A] mb-4 uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>0SRV — 0{idx + 1}</span>
                    <IconComponent className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3 italic">{service.title}</h3>
                  <p className="text-xs text-gray-400 mb-8 line-clamp-2 leading-relaxed">{service.shortDescription}</p>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-[#A1824A] transition-colors">
                    Learn more
                  </span>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-12">
            <Link to="/services" className="inline-block text-[11px] uppercase tracking-widest text-[#E5E5E5] border-b border-white/20 pb-1 hover:border-[#A1824A] hover:text-[#A1824A] transition-all">
              View all 7 services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-[#0D0D0D] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block">Why MB Digital</span>
              <h2 className="text-4xl lg:text-5xl font-serif text-white mb-6 italic leading-tight">Elevating brands through precision and creativity.</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                We believe in strategies that are as measurable as they are beautiful. Our approach is built on a foundation of data, brought to life through exceptional design, and executed with unrelenting focus.
              </p>
              
              <ul className="space-y-6">
                {[
                  {
                    title: "Data-Driven Strategy",
                    desc: "Every design choice and campaign is backed by solid data to ensure maximum ROI."
                  },
                  {
                    title: "World-Class Craft",
                    desc: "From pixel-perfect web experiences to compelling brand narratives, we don't compromise on quality."
                  },
                  {
                    title: "Holistic Approach",
                    desc: "We integrate marketing, design, and technology so your brand speaks with one unified voice."
                  }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="mt-1.5 mr-4 w-1.5 h-1.5 bg-[#A1824A] rounded-full shrink-0" />
                    <div>
                      <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[600px] w-full hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop" 
                alt="Strategy Meeting" 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
              />
              <div className="absolute inset-0 border border-white/10 m-4"></div>
              <div className="absolute bottom-10 -left-10 bg-[#161616] border border-[#A1824A]/20 p-8 max-w-sm">
                <p className="text-4xl font-serif text-[#A1824A] italic mb-2">150%</p>
                <p className="text-[10px] text-white uppercase tracking-widest font-bold mb-1">Average Growth</p>
                <p className="text-xs text-gray-400">Increase in inbound leads for our clients within the first quarter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block">Testimonials</span>
            <h2 className="text-4xl font-serif mb-4 italic">Trusted by Visionaries</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.id} className="relative p-8 bg-[#0D0D0D] border-l-2 border-[#A1824A]">
                <span className="absolute top-0 right-8 text-6xl font-serif text-white/5 leading-none">"</span>
                <p className="text-sm italic text-gray-300 leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>
                <div className="mt-auto flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full border border-white/10 mr-3 object-cover grayscale" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-tight text-white">{testimonial.name}</p>
                    <p className="text-[9px] text-[#A1824A] tracking-widest uppercase mt-0.5">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1A1A1A] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
          <span className="text-6xl font-serif text-[#A1824A] mb-6 block leading-none">"</span>
          <h2 className="text-4xl font-serif text-white mb-6 italic leading-tight">Ready to transform your digital legacy?</h2>
          <p className="text-sm text-gray-400 mb-10 max-w-lg leading-relaxed">Join the visionaries who have redefined their markets with MB Digital.</p>
          <Link
            to="/contact"
            className="px-8 py-3 border border-[#A1824A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#A1824A] hover:text-black transition-all"
          >
            Start the Conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
