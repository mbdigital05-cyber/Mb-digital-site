import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    try {
      const subscribersCol = collection(db, "subscribers");
      const newSubscriberDoc = doc(subscribersCol);
      
      await setDoc(newSubscriberDoc, {
        email: email,
        status: "active",
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setEmail("");
      
      // Reset status after a few seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Newsletter submission error:", error);
      setStatus("error");
      try {
        handleFirestoreError(error, OperationType.CREATE, "subscribers/auto_gen");
      } catch (err) {
        // Logged internally
      }
    }
  };

  return (
    <section className="bg-[#121212] py-16 border-t border-white/5 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-full bg-[#A1824A]/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#A1824A] font-bold mb-4">
              Stay in the Loop
            </h2>
            <h3 className="text-3xl md:text-4xl font-serif text-white mb-6">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Get the latest insights on corporate branding, web development, and digital marketing delivered straight to your inbox.
            </p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex-1 relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-4 bg-transparent border border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-gray-600 rounded-none text-sm"
                disabled={status === "loading" || status === "success"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="flex items-center justify-center px-8 py-4 bg-[#A1824A] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : status === "success" ? (
                "Subscribed"
              ) : (
                <>
                  Subscribe <Send className="w-3.5 h-3.5 ml-2" />
                </>
              )}
            </button>
          </motion.form>

          {status === "success" && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#A1824A] text-xs mt-4"
            >
              Thank you for subscribing!
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
