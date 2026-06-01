import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Mail, Phone, Calendar, RefreshCw, Layers, LogOut } from "lucide-react";
import { SERVICES } from "@/src/constants";
import { auth, db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  message: string;
  createdAt: string;
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedService, setSelectedService] = useState<string | "all">("all");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.email?.toLowerCase() === "mb@mbdigital.com.ng") {
          setUser(currentUser);
          setLoginError("");
        } else {
          // Wrong domain or email
          signOut(auth);
          setUser(null);
          setLoginError(`Access Denied: ${currentUser.email} is not authorized to view this page.`);
        }
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }
    
    setLoginError("");
    setIsLoggingIn(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the success / email check
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setLoginError("Invalid email or password.");
      } else {
        setLoginError("Failed to sign in securely. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const contactsCol = collection(db, "contacts");
      const q = query(contactsCol, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let dateStr = new Date().toISOString();
        if (docData.createdAt) {
          if (typeof docData.createdAt.toDate === "function") {
            dateStr = docData.createdAt.toDate().toISOString();
          } else if (docData.createdAt.seconds) {
            dateStr = new Date(docData.createdAt.seconds * 1000).toISOString();
          } else {
            dateStr = new Date(docData.createdAt).toISOString();
          }
        }
        return {
          id: doc.id,
          name: docData.name,
          email: docData.email,
          phone: docData.phone,
          services: docData.services || [],
          message: docData.message,
          createdAt: dateStr,
        } as Submission;
      });

      setSubmissions(data);
    } catch (err) {
      setError("Could not load submissions. Missing required access or session expired.");
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.LIST, "contacts");
      } catch (e) {
        // Logged internally
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;
    
    if (selectedService !== "all") {
      filtered = filtered.filter(sub => sub.services.includes(selectedService));
    }
    
    if (startDate) {
      // Normalize start date to beginning of day
      const start = new Date(startDate + "T00:00:00").getTime();
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.createdAt).getTime();
        return subDate >= start;
      });
    }
    
    if (endDate) {
      // Normalize end date to end of day
      const end = new Date(endDate + "T23:59:59").getTime();
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.createdAt).getTime();
        return subDate <= end;
      });
    }
    
    return filtered;
  }, [submissions, selectedService, startDate, endDate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 text-[#A1824A] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative flex flex-col justify-center items-center px-4 overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2560&auto=format&fit=crop" 
            alt="Admin Banner" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent"></div>
        </div>
        <div className="w-full max-w-sm bg-[#121212] p-8 border border-white/10 relative z-10">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#A1824A]/50"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#A1824A]/50"></div>
          
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.5em] text-[#A1824A] mb-2 block">System</span>
            <h1 className="text-2xl font-serif text-white italic">Admin Login</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <p className="text-xs text-gray-400 text-center uppercase tracking-widest leading-relaxed">
              Sign in with your admin credentials
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-white/20 rounded-none"
                  placeholder="mb@mbdigital.com.ng"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-3">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-[#A1824A] text-white outline-none transition-all placeholder:text-white/20 rounded-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-950/30 border border-red-900 p-3 text-center">
                <p className="text-red-400 text-[10px] uppercase tracking-widest">{loginError}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center px-8 py-4 bg-[#A1824A] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2560&auto=format&fit=crop" 
            alt="Admin Dashboard Banner" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#A1824A] mb-2 block">System</span>
            <h1 className="text-4xl font-serif text-white italic">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user.displayName || "Admin User"}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center text-[10px] uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Manage inquiries securely</p>
          </div>
          <button
            onClick={fetchSubmissions}
            disabled={isLoading}
            className="flex items-center text-xs bg-transparent border border-white/20 px-6 py-3 text-white uppercase tracking-widest hover:border-[#A1824A] hover:text-[#A1824A] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900 text-red-400 p-4 text-xs tracking-wide mb-8">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Service Filter Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#121212] border border-white/5 p-4 sticky top-28">
              <div className="mb-8">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 pl-4">Filter by Date</h3>
                <div className="space-y-4 px-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#A1824A] mb-2">Start Date</label>
                    <input 
                      type="date"
                      value={startDate}
                      className="w-full px-3 py-2 bg-[#161616] border border-white/10 text-xs text-gray-300 focus:border-[#A1824A] outline-none [color-scheme:dark]"
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-[#A1824A] mb-2">End Date</label>
                    <input 
                      type="date"
                      value={endDate}
                      className="w-full px-3 py-2 bg-[#161616] border border-white/10 text-xs text-gray-300 focus:border-[#A1824A] outline-none [color-scheme:dark]"
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => { setStartDate(""); setEndDate(""); }}
                      className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/30 transition-all font-bold"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 pl-4 pt-6 border-t border-white/10">Filter by Service</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedService("all")}
                  className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-widest transition-colors ${
                    selectedService === "all" ? "bg-[#161616] text-[#A1824A] border-l-2 border-[#A1824A]" : "text-gray-400 hover:bg-[#161616] hover:text-white"
                  }`}
                >
                  All Inquiries
                </button>
                {SERVICES.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full text-left px-4 py-3 text-[11px] uppercase tracking-widest transition-colors ${
                      selectedService === service.id ? "bg-[#161616] text-[#A1824A] border-l-2 border-[#A1824A]" : "text-gray-400 hover:bg-[#161616] hover:text-white"
                    }`}
                  >
                    {service.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Submissions List */}
          <div className="flex-1">
            {isLoading && !error ? (
              <div className="flex justify-center items-center h-64 border border-white/5 bg-[#121212]">
                <Loader2 className="h-8 w-8 text-[#A1824A] animate-spin" />
              </div>
            ) : filteredSubmissions.length === 0 && !error ? (
              <div className="bg-[#121212] p-12 text-center border border-white/5 h-64 flex flex-col justify-center">
                <Mail className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-white italic">No submissions found</h3>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
                  {selectedService === "all" ? "When clients fill out the contact form, they will appear here." : "No inquiries for this specific service yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-[#121212] p-8 border border-white/5 hover:border-[#A1824A]/30 transition-all relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#A1824A]/30"></div>
                    
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="font-serif text-white text-xl italic leading-tight">{sub.name}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#A1824A] border border-[#A1824A]/30 px-2 py-1">Lead</span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-[11px] text-gray-400 uppercase tracking-wider">
                        <Mail className="h-3 w-3 mr-3 text-[#A1824A]" />
                        <a href={`mailto:${sub.email}`} className="hover:text-white truncate transition-colors">{sub.email}</a>
                      </div>
                      {sub.phone && (
                        <div className="flex items-center text-[11px] text-gray-400 uppercase tracking-wider">
                          <Phone className="h-3 w-3 mr-3 text-[#A1824A]" />
                          <a href={`tel:${sub.phone}`} className="hover:text-white transition-colors">{sub.phone}</a>
                        </div>
                      )}
                       <div className="flex items-center text-[11px] text-gray-400 uppercase tracking-wider">
                        <Calendar className="h-3 w-3 mr-3 text-[#A1824A]" />
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Services Tags */}
                    {sub.services && sub.services.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {sub.services.map(srvId => {
                          const srv = SERVICES.find(s => s.id === srvId);
                          return srv ? (
                            <span key={srvId} className="flex items-center text-[9px] uppercase tracking-widest text-black bg-[#A1824A]/80 px-2 py-1">
                              <Layers className="w-2.5 h-2.5 mr-1" />
                              {srv.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-sm text-gray-300 leading-relaxed italic line-clamp-4">{sub.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
