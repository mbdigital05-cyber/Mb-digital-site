import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SERVICES } from "@/src/constants";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Contact() {
  const location = useLocation();
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    services: [] as string[],
    message: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    // If coming from a specific service page, pre-check it
    const stateUrlParams = location.state as { serviceId?: string } | null;
    if (stateUrlParams?.serviceId) {
      setFormData(prev => ({
        ...prev,
        services: [stateUrlParams.serviceId as string]
      }));
    }
  }, [location]);

  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => {
      const current = prev.services;
      const updated = current.includes(serviceId)
        ? current.filter(id => id !== serviceId)
        : [...current, serviceId];
        
      if (updated.length > 0) setValidationError("");
      return { ...prev, services: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.services.length === 0) {
      setValidationError("Please select at least one service.");
      return;
    }
    
    setIsSubmitting(true);
    setStatus("idle");
    setValidationError("");

    try {
      const contactsCol = collection(db, "contacts");
      const newContactDoc = doc(contactsCol);
      const contactId = newContactDoc.id;

      await setDoc(newContactDoc, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        services: formData.services,
        message: formData.message,
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", services: [], message: "" });
    } catch (error) {
      console.error("Firestore submit error:", error);
      setStatus("error");
      try {
        handleFirestoreError(error, OperationType.CREATE, `contacts/auto_gen`);
      } catch (err) {
        // Logged internally by utility, prevent breaking the client UI thread
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2560&auto=format&fit=crop" 
            alt="Contact Banner" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-4 block">Inquiries</span>
            <h1 className="text-4xl lg:text-6xl font-serif text-white tracking-tight mb-6 italic">
              Let's create something together.
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed uppercase tracking-widest mx-auto max-w-xl">
              Fill out the form below, and our team will get back to you within 24 hours to discuss your project.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h3 className="text-xl font-serif text-white mb-8 italic">Contact Information</h3>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-[#A1824A] mr-6 mt-1" />
                    <div>
                      <p className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-2">Email</p>
                      <a href="mailto:info@mbdigital.com.ng" className="text-sm text-gray-400 hover:text-[#A1824A] transition-colors">info@mbdigital.com.ng</a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-[#A1824A] mr-6 mt-1" />
                    <div>
                      <p className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-2">Phone</p>
                      <a href="tel:+2348104086523" className="text-sm text-gray-400 hover:text-[#A1824A] transition-colors">+234 810 408 6523</a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-[#A1824A] mr-6 mt-1" />
                    <div>
                      <p className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-2">Office</p>
                      <p className="text-sm text-gray-400 leading-relaxed">Abuja, Nigeria</p>
                    </div>
                  </div>
                </div>
              </div>

               <div className="pt-8 border-t border-white/10 block">
                  <h4 className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-4">Working Hours</h4>
                  <p className="text-sm text-gray-400">Monday - Friday: 9AM - 6PM EST</p>
               </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-[#121212] p-8 lg:p-12 border border-white/5 relative">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#A1824A]/50"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#A1824A]/50"></div>
              
              {status === "success" ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-[#161616] text-[#A1824A] rounded-full flex items-center justify-center border border-white/10 mb-6">
                    <Send className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3 italic">Message Received</h3>
                  <p className="text-sm text-gray-400 mb-8 mx-auto max-w-sm">Thank you for reaching out. A strategist will review your inquiry and be in touch shortly.</p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="px-6 py-3 border border-[#A1824A] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#A1824A] hover:text-black transition-all"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-transparent border-b border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-white/20 rounded-none"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-transparent border-b border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-white/20 rounded-none"
                        placeholder="jane@company.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border-b border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-white/20 rounded-none"
                      placeholder="+234 810 408 6523"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4">Required Services *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SERVICES.map((service) => (
                        <label key={service.id} className="flex items-center space-x-3 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service.id)}
                              onChange={() => handleServiceChange(service.id)}
                              className="w-4 h-4 border border-white/20 bg-transparent appearance-none checked:bg-[#A1824A] checked:border-[#A1824A] transition-colors peer cursor-pointer"
                            />
                            <svg className="absolute w-4 h-4 text-black hidden peer-checked:block pointer-events-none p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{service.title}</span>
                        </label>
                      ))}
                    </div>
                    {validationError && (
                      <p className="text-red-400 text-[10px] uppercase tracking-widest mt-3">{validationError}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Project Details *</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-transparent border-b border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-white/20 resize-none rounded-none"
                      placeholder="Tell us about your goals, timeline, and budget..."
                    ></textarea>
                  </div>

                  {status === "error" && (
                    <div className="p-4 bg-red-950/30 border border-red-900 text-red-400 text-xs tracking-wide">
                      An error occurred while sending your message. Please try again.
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center px-8 py-4 bg-[#A1824A] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" /> Transmitting...</>
                      ) : (
                        <>Submit Inquiry <Send className="ml-3 h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
