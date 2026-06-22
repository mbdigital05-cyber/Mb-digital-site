import React, { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { SERVICES } from "@/src/constants";
import * as Icons from "lucide-react";

export default function ServiceDetail() {
  const { id } = useParams();
  
  const service = SERVICES.find(s => s.id === id);

  useEffect(() => {
    if (service) {
      document.title = `${service.title} | Premium Services - MB Digital Abuja`;
    }
  }, [service]);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    message: "",
    companySize: "",
    softwareStack: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const IconComponent = (Icons as any)[service.icon] || Icons.Code;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, services: [service.id] }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "", companySize: "", softwareStack: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-[#0A0A0A] text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src={service.imageUrl} 
            alt={service.title} 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
          <div className="flex items-center space-x-3 mb-6">
            <IconComponent className="h-6 w-6 text-[#A1824A]" />
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A]">Specialty</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-serif tracking-tight mb-6 italic">
            {service.title}
          </h1>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl leading-relaxed">
            {service.shortDescription}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-3xl font-serif text-white mb-8 tracking-tight italic">
                Why this matters.
              </h2>
              <div className="text-sm text-gray-400 leading-relaxed space-y-6 mb-16">
                <p>
                  {service.longDescription}
                </p>
                <p>
                  In today's hyper-competitive landscape, generic solutions do not yield exceptional results. 
                  Our approach to {service.title.toLowerCase()} is rooted deeply in understanding the psychology 
                  of your end-user. By leveraging data-backed insights, we craft experiences that don't just 
                  capture attention—they drive meaningful engagement and convert prospects into loyal advocates.
                </p>
              </div>

              {/* Individual Form */}
              <div className="bg-[#161616] border border-white/5 p-8 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#A1824A]/50"></div>
                
                <h3 className="text-2xl font-serif text-white italic mb-2">Request {service.title}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-8">Direct inquiry for this service</p>
                
                {status === "success" ? (
                  <div className="bg-green-950/30 border border-green-900 p-8 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-serif italic text-white mb-2">Request Received</h3>
                    <p className="text-xs text-green-400/80 uppercase tracking-widest">We'll contact you about {service.title.toLowerCase()} shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-gray-600 rounded-none text-sm"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-gray-600 rounded-none text-sm"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-gray-600 rounded-none text-sm"
                        placeholder="+234 810 408 6523"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Service Focus (Pre-selected)</label>
                      <div className="px-4 py-3 bg-[#121212] border border-white/5 text-[#A1824A] font-serif italic mb-2">
                        {service.title}
                      </div>
                    </div>

                    {service.id === "business-automation" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Company Size</label>
                          <select
                            value={formData.companySize}
                            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                            className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-[#A1824A] text-white outline-none transition-all rounded-none text-sm appearance-none"
                          >
                            <option value="">Select size...</option>
                            <option value="1-10">1-10 Employees</option>
                            <option value="11-50">11-50 Employees</option>
                            <option value="51-200">51-200 Employees</option>
                            <option value="200+">200+ Employees</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Current Software Stack</label>
                          <input
                            type="text"
                            value={formData.softwareStack}
                            onChange={(e) => setFormData({ ...formData, softwareStack: e.target.value })}
                            className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-gray-600 rounded-none text-sm"
                            placeholder="e.g. HubSpot, QuickBooks"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Project Details *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-[#121212] border border-white/10 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-gray-600 rounded-none text-sm resize-none"
                        placeholder={`Tell us about your ${service.title.toLowerCase()} needs...`}
                      />
                    </div>
                    
                    {status === "error" && (
                      <p className="text-red-400 text-[10px] uppercase tracking-widest mt-2">Error submitting form. Please try again.</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-8 py-4 bg-[#A1824A] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-3" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Request Service <Send className="ml-3 h-3 w-3" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-5 bg-[#161616] p-8 lg:p-10 border border-white/5 h-fit sticky top-28">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Key Benefits</h3>
              <ul className="space-y-6 mb-10">
                {service.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-[#A1824A] font-serif italic mr-4 mt-1">0{idx + 1}</span>
                    <span className="text-sm text-gray-300 leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-8 border-t border-white/10">
                <p className="text-white text-sm font-serif italic">Need a comprehensive strategy involving multiple services?</p>
                <Link
                  to="/contact"
                  className="mt-6 w-full inline-flex items-center justify-center px-8 py-3 bg-transparent border border-[#A1824A]/50 text-[#A1824A] text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:bg-[#A1824A] hover:text-black"
                >
                  General Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
