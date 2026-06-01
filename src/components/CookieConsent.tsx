import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", "custom");
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-[#121212] border border-white/10 p-6 shadow-2xl pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {showPreferences ? (
              <div className="w-full">
                <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Cookie Preferences</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">Strictly Necessary</h4>
                      <p className="text-xs text-gray-500">Required for the website to function.</p>
                    </div>
                    <div className="w-10 h-5 bg-[#A1824A] rounded-full relative cursor-not-allowed opacity-50">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">Analytics</h4>
                      <p className="text-xs text-gray-500">Help us improve by measuring usage.</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${preferences.analytics ? 'bg-[#A1824A]' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.analytics ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">Marketing</h4>
                      <p className="text-xs text-gray-500">Enable personalized advertisements.</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${preferences.marketing ? 'bg-[#A1824A]' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.marketing ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleSavePreferences}
                    className="px-6 py-2 bg-[#A1824A] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button 
                    onClick={() => setShowPreferences(false)}
                    className="px-6 py-2 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 pr-8">
                  <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-2">We respect your privacy</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                    We use cookies and similar technologies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button 
                    onClick={() => setShowPreferences(true)}
                    className="px-6 py-2 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors whitespace-nowrap"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={handleDecline}
                    className="px-6 py-2 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors whitespace-nowrap"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={handleAcceptAll}
                    className="px-6 py-2 bg-[#A1824A] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors whitespace-nowrap"
                  >
                    Accept All
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
