import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  X,
  Keyboard,
  Compass,
  ArrowRight
} from "lucide-react";

interface SpeechTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const PREBUILT_VOICES = [
  { id: "Zephyr", name: "Zephyr (Smooth & Calmer)", gender: "Male" },
  { id: "Kore", name: "Kore (Bright & Professional)", gender: "Female" },
  { id: "Puck", name: "Puck (Energetic & Youthful)", gender: "Male" },
  { id: "Charon", name: "Charon (Warm & Grounded)", gender: "Male" },
  { id: "Fenrir", name: "Fenrir (Deep & Narrative)", gender: "Male" }
];

export default function VoiceAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [agentState, setAgentState] = useState<"idle" | "listening" | "thinking" | "speaking" | "muted">("idle");
  const [voiceMethod, setVoiceMethod] = useState<"neural" | "native">("neural");
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [showLog, setShowLog] = useState(true);
  const [subtitles, setSubtitles] = useState("");
  const [dialogHistory, setDialogHistory] = useState<SpeechTurn[]>([]);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  
  // Browser Speech Recognition Fallback Info
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);

  // Refs for audio and recognition
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const nativeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Check support for SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsRecognitionSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US"; // Standard English

      rec.onstart = () => {
        setAgentState("listening");
        setSubtitles("Mobi is listening to your voice...");
      };

      rec.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        if (!text) return;

        // Add user turn
        const userTurn: SpeechTurn = { id: Date.now().toString(), role: "user", text };
        setDialogHistory(prev => [...prev, userTurn]);
        setSubtitles(text);
        
        // Stop recognition and process
        setAgentState("thinking");
        await handleSendMessage(text);
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          setSubtitles("No speech detected. Say something!");
          setAgentState("idle");
          // Restart if active and not muted
          if (isCallActive && !isMuted) {
            setTimeout(() => {
              if (isCallActive && !isMuted) restartRecognition();
            }, 1000);
          }
        } else {
          setAgentState("idle");
          setSubtitles(`Recognition paused (${event.error})`);
        }
      };

      rec.onend = () => {
        // Recognition stops naturally after one sentence
        if (isCallActive && agentState === "listening") {
          setAgentState("idle");
        }
      };

      recognitionRef.current = rec;
    } else {
      setIsRecognitionSupported(false);
      setShowTextInput(true); // Default to text input fallback if SpeechRecognition is missing
    }

    // Cleanup on unmount
    return () => {
      stopVoice();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [isCallActive, isMuted, agentState]);

  // Keep dialog logs scrolled to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dialogHistory, subtitles]);

  // Auto-trigger speech synthesis when voice method triggers or changes
  const stopVoice = () => {
    // 1. Full stop for Gemini base64 neural PCM playback
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    // 2. Full stop for standard browser tts
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const restartRecognition = () => {
    if (!recognitionRef.current || !isCallActive || isMuted) return;
    try {
      recognitionRef.current.abort();
      setTimeout(() => {
        if (isCallActive && !isMuted) {
          recognitionRef.current.start();
        }
      }, 100);
    } catch (e) {
      console.warn("Could not start recognition:", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      stopVoice();
      setAgentState("thinking");
      setSubtitles("Mobi is analyzing your goals...");

      // Prepare conversation transcript history
      // Keep last 6 logs to avoid extreme payload sizes
      const historyContext = dialogHistory.slice(-6).map(h => ({
        role: h.role,
        text: h.text
      }));

      const chatRes = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyContext })
      });

      if (!chatRes.ok) throw new Error("Server error responding to inquiry");
      const chatData = await chatRes.json();
      const responseText = chatData.text;

      // Add assistant response to log
      const assistantTurn: SpeechTurn = { id: Date.now().toString() + "-ai", role: "assistant", text: responseText };
      setDialogHistory(prev => [...prev, assistantTurn]);
      setSubtitles(responseText);

      // Speak responsive text
      if (voiceMethod === "neural") {
         await synthesizeAndPlayNeural(responseText);
      } else {
         speakNative(responseText);
      }

    } catch (err: any) {
      console.error(err);
      setSubtitles("Connection glitch. Let's try again in a bit.");
      setAgentState("idle");
    }
  };

  // 1. High-Fidelity Gemini Neural Text-to-Speech Player
  const synthesizeAndPlayNeural = async (text: string) => {
    try {
      setAgentState("thinking");
      const res = await fetch("/api/assistant/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: selectedVoice })
      });

      if (!res.ok) throw new Error("TTS endpoint error");
      const data = await res.json();
      const base64Audio = data.audio;

      // Decode base64 raw PCM
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert raw 16-bit PCM bytes to Float32 array
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }
      
      const audioCtx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const buffer = audioCtx.createBuffer(1, float32Array.length, 24000); // 24kHz Mono Sample Rate
      buffer.copyToChannel(float32Array, 0);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        audioSourceRef.current = null;
        setAgentState("idle");
        // Start listening again naturally
        if (isCallActive && !isMuted && isRecognitionSupported && !showTextInput) {
          restartRecognition();
        }
      };
      
      audioSourceRef.current = source;
      setAgentState("speaking");
      source.start(0);

    } catch (e) {
      console.warn("Neural audio synthesis failed, using fallback custom voice.", e);
      speakNative(text);
    }
  };

  // 2. Client-Native Text-to-Speech Player
  const speakNative = (text: string) => {
    if (!window.speechSynthesis) {
      setAgentState("idle");
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Choose professional English speech voice accent profiles
    const engVoice = voices.find(v => v.lang.includes("en-NG")) || 
                     voices.find(v => v.lang.includes("en-GB")) || 
                     voices.find(v => v.lang.includes("en-US")) || 
                     voices[0];
                     
    if (engVoice) utterance.voice = engVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setAgentState("speaking");
    };
    
    utterance.onend = () => {
      setAgentState("idle");
      if (isCallActive && !isMuted && isRecognitionSupported && !showTextInput) {
        restartRecognition();
      }
    };
    
    utterance.onerror = () => {
      setAgentState("idle");
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // User manual Text submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const userText = textInput.trim();
    setTextInput("");

    const userTurn: SpeechTurn = { id: Date.now().toString(), role: "user", text: userText };
    setDialogHistory(prev => [...prev, userTurn]);
    setSubtitles(userText);

    await handleSendMessage(userText);
  };

  // Dial Strategy Call Session
  const startCall = () => {
    setIsCallActive(true);
    setAgentState("thinking");
    setSubtitles("Connecting live to MB Digital's AI strategy desk...");
    setDialogHistory([]);
    
    // Resume Audio Context to bypass browser blocks
    if (typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    setTimeout(() => {
      const welcomeMsg = "Hello! I am Mobi, your AI Creative Strategist. Let's make your digital dreams a reality today. How is your business doing or what projects can we brainstorm?";
      setSubtitles(welcomeMsg);
      setDialogHistory([
        { id: "welcome-ai", role: "assistant", text: welcomeMsg }
      ]);
      
      if (voiceMethod === "neural") {
        synthesizeAndPlayNeural(welcomeMsg);
      } else {
        speakNative(welcomeMsg);
      }
    }, 1500);
  };

  // Hang Up Call Session
  const endCall = () => {
    setIsCallActive(false);
    setAgentState("idle");
    stopVoice();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setSubtitles("");
    setDialogHistory([]);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setAgentState("listening");
      setSubtitles("Microphone live. Speak now.");
      if (isRecognitionSupported && !showTextInput) {
        restartRecognition();
      }
    } else {
      setIsMuted(true);
      setAgentState("muted");
      setSubtitles("Microphone muted. Mobi won't hear you.");
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    }
  };

  // Trigger recording manually
  const triggerManualRecord = () => {
    if (!isCallActive) return;
    if (isMuted) {
      setIsMuted(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setAgentState("listening");
      } catch (e) {
        restartRecognition();
      }
    }
  };

  return (
    <>
      {/* 1. Launcher Button (Floating Bottom-Left to avoid cluttering WhatsApp on the right) */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          id="mobi-voice-btn"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-full text-white font-medium shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] border border-orange-400/30 transition-all cursor-pointer"
        >
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="flex items-center justify-center relative">
            <Radio className="w-5 h-5 animate-pulse" />
          </span>
          <span className="text-sm font-sans tracking-wide">Live AI Voice Agent</span>
        </motion.button>
      </div>

      {/* 2. Interactive Call Dashboard (Drawer Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/80">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-2.5 rounded-xl text-white shadow-md">
                    <Sparkles className="w-5 h-5 text-orange-100" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-zinc-100 tracking-wide flex items-center gap-2">
                      Mobi 
                      <span className="text-xs bg-zinc-800 text-amber-500 font-mono px-2 py-0.5 rounded-md border border-zinc-700 font-normal">
                        Creative Strategist AI
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5">MB Digital Abuja Strategy Hotline</p>
                  </div>
                </div>
                <button
                  id="close-mobi-panel-btn"
                  onClick={() => {
                    endCall();
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-zinc-950/20 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Call Canvas Panel */}
              <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px] bg-radial-gradient from-zinc-900 via-zinc-950 to-zinc-950">
                {!isCallActive ? (
                  /* Start Call View */
                  <div className="text-center py-6 max-w-md">
                    <div className="relative w-24 h-24 mx-auto mb-6 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner group">
                      <div className="absolute inset-0 bg-transparent rounded-full group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
                      <div className="absolute inset-2 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full animate-pulse opacity-20" />
                      <Phone className="w-10 h-10 text-orange-500 relative" />
                    </div>
                    <h4 className="text-xl font-serif text-zinc-100 mb-2">Connect to our Creative Desk</h4>
                    <p className="text-sm text-zinc-400 mb-6 font-sans leading-relaxed">
                      Consult with Mobi, our high-performance AI Strategist. Brainstorm marketing budgets, logo branding, custom software, or campaign automation via voice.
                    </p>
                    <button
                      id="dial-mobi-btn"
                      onClick={startCall}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 font-semibold text-white tracking-wide rounded-full shadow-[0_4px_25px_rgba(234,88,12,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Phone className="w-5 h-5 fill-current" />
                      Start Strategy Session
                    </button>
                  </div>
                ) : (
                  /* Active Call View with Waves and Transcription feedback */
                  <div className="w-full flex flex-col items-center">
                    
                    {/* Visual Waves Halo */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                      
                      {/* Pulse Ring 1 (Speaking waves) */}
                      {agentState === "speaking" && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-orange-500/10 border-2 border-orange-500/20 animate-ping" />
                          <div className="absolute -inset-4 rounded-full bg-amber-500/5 border border-amber-500/10 animate-pulse scale-105" />
                        </>
                      )}

                      {/* Pulse Ring 2 (Listening waves) */}
                      {agentState === "listening" && (
                        <>
                          <div className="absolute inset-2 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 animate-pulse" />
                          <div className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-full animate-spin [animation-duration:10s]" />
                        </>
                      )}

                      {/* Pulse Ring 3 (Thinking ring) */}
                      {agentState === "thinking" && (
                        <div className="absolute inset-0 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
                      )}

                      {/* Avatar Disc */}
                      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-800 border border-zinc-700/65 flex flex-col items-center justify-center shadow-2xl">
                        <span className="text-3xl font-bold tracking-wider font-serif bg-gradient-to-r from-orange-500 to-amber-300 bg-clip-text text-transparent">MB</span>
                        <span className="text-xs text-zinc-400 tracking-widest font-mono mt-1">
                          {agentState.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Subtitle Teleprompter Bubble */}
                    <div className="w-full max-w-lg mb-6 bg-zinc-900/80 border border-zinc-850 px-5 py-4 rounded-2xl shadow-inner min-h-[64px] flex items-center justify-center text-center">
                      <p className="text-sm font-sans md:text-sm text-zinc-200 leading-relaxed font-light italic">
                        {subtitles || "Awaiting connection..."}
                      </p>
                    </div>

                    {/* Quick Topic Chips to ask */}
                    <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mb-6">
                      <span className="text-xs text-zinc-500 font-mono">Suggested Topics:</span>
                      <button 
                        onClick={() => handleSendMessage("Tell me about your corporate branding process")}
                        className="text-[11px] bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-sans px-2.5 py-1 rounded-full text-left transition-colors cursor-pointer"
                      >
                        Corporate Branding
                      </button>
                      <button 
                        onClick={() => handleSendMessage("How fast can you build a web application for me?")}
                        className="text-[11px] bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-sans px-2.5 py-1 rounded-full text-left transition-colors cursor-pointer"
                      >
                        Web Development speed
                      </button>
                      <button 
                        onClick={() => handleSendMessage("What results did NovaTech Africa get?")}
                        className="text-[11px] bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-sans px-2.5 py-1 rounded-full text-left transition-colors cursor-pointer"
                      >
                        testimonials & results
                      </button>
                    </div>

                    {/* Call Controls Bar */}
                    <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-850 p-4 rounded-full shadow-lg">
                      {/* Mute toggle */}
                      <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-colors relative cursor-pointer ${
                          isMuted
                            ? "bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500/30"
                            : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      {/* Manual Push-To-Speak / Record Trigger (for slow recognition or hands-on) */}
                      {isRecognitionSupported && !showTextInput && (
                        <button
                          onClick={triggerManualRecord}
                          disabled={agentState === "speaking" || agentState === "thinking" || isMuted}
                          className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-medium text-xs tracking-wider uppercase rounded-full flex items-center gap-2 shadow-md transition-all cursor-pointer"
                          title="Speak Now"
                        >
                          <Radio className="w-4 h-4" />
                          Push to Speak
                        </button>
                      )}

                      {/* Text Input Fallback Toggle */}
                      <button
                        onClick={() => setShowTextInput(!showTextInput)}
                        className={`p-4 rounded-full transition-colors cursor-pointer ${
                          showTextInput
                            ? "bg-orange-500/30 text-orange-400 border border-orange-500/50"
                            : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                        title="Text Chat Fallback"
                      >
                        <Keyboard className="w-5 h-5" />
                      </button>

                      {/* Hang up button */}
                      <button
                        id="hangup-mobi-btn"
                        onClick={endCall}
                        className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] transform hover:scale-105 cursor-pointer"
                        title="End Session"
                      >
                        <PhoneOff className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    {/* Text Fallback Form */}
                    {showTextInput && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleTextSubmit}
                        className="w-full max-w-lg mt-6 flex gap-2"
                      >
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Type your strategic goals here..."
                          className="flex-grow bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!textInput.trim() || agentState === "thinking"}
                          className="px-5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.form>
                    )}

                    {!isRecognitionSupported && (
                      <p className="text-[11px] text-zinc-500 font-mono mt-3 text-center">
                        Speech recognition is limited in this browser interface. Please use the Text board above to consult!
                      </p>
                    )}

                  </div>
                )}
              </div>

              {/* Advanced Settings Drawer (Accordion style) */}
              <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-900">
                <div className="flex flex-col gap-4">
                  {/* Option Line 1: Voice Method and Prebuilt Voicename */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-500">Audio Synthesis Engine:</span>
                      <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                        <button
                          onClick={() => {
                            stopVoice();
                            setVoiceMethod("neural");
                          }}
                          className={`px-2.5 py-1 text-[10px] uppercase font-semibold rounded-md transition-all cursor-pointer ${
                            voiceMethod === "neural"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Gemini High-Fid Neural
                        </button>
                        <button
                          onClick={() => {
                            stopVoice();
                            setVoiceMethod("native");
                          }}
                          className={`px-2.5 py-1 text-[10px] uppercase font-semibold rounded-md transition-all cursor-pointer ${
                            voiceMethod === "native"
                              ? "bg-zinc-800 text-zinc-300"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Native Browser Voice
                        </button>
                      </div>
                    </div>

                    {voiceMethod === "neural" && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-500">Select Voice Tone:</span>
                        <select
                          value={selectedVoice}
                          onChange={(e) => {
                            stopVoice();
                            setSelectedVoice(e.target.value);
                          }}
                          className="bg-zinc-900 border border-zinc-850 text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500 font-sans"
                        >
                          {PREBUILT_VOICES.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Toggle Log Tracker Accordion */}
                  <div>
                    <button
                      onClick={() => setShowLog(!showLog)}
                      className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono hover:text-zinc-400 py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Session Transcript Dialog Log ({dialogHistory.length})
                      </span>
                      {showLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showLog && (
                      <div 
                        ref={scrollRef}
                        className="mt-3 max-h-[140px] overflow-y-auto bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 scrollbar-none font-sans text-xs flex flex-col gap-2.5"
                      >
                        {dialogHistory.length === 0 ? (
                          <div className="text-center py-4 text-zinc-650">
                            No logs logged yet. Dial strategy call to start!
                          </div>
                        ) : (
                          dialogHistory.map((h) => (
                            <div 
                              key={h.id}
                              className={`flex flex-col gap-1 max-w-[85%] ${
                                h.role === "user" ? "self-end items-end" : "self-start items-start"
                              }`}
                            >
                              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">
                                {h.role === "user" ? "You (Client)" : "Mobi (Strategist)"}
                              </span>
                              <div className={`px-3 py-2 rounded-xl leading-relaxed ${
                                h.role === "user" 
                                  ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                                  : "bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-tl-none whitespace-pre-line"
                              }`}>
                                {h.text}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
