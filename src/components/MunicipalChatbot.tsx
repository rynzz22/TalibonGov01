import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Building2,
  FileText,
  MapPin,
  Calendar,
  Newspaper,
  CloudSun,
  ShieldAlert,
  PhoneCall,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  route?: string;
  actionText?: string;
  timestamp: string;
}

interface ChatbotIntent {
  id: string;
  category: string;
  icon: React.ReactNode;
  keywords: string[];
  title: string;
  response: string;
  route?: string;
  actionText?: string;
  sampleQuestion: string;
}

const CHATBOT_INTENTS: ChatbotIntent[] = [
  {
    id: "certificates",
    category: "📄 Certificates",
    icon: <FileText size={14} />,
    keywords: ["certificate", "certificates", "cedula", "clearance", "indigency", "birth", "death", "marriage", "ctc", "requirements", "processing", "time"],
    title: "Certificates & Clearances",
    response: "You can request official certificates (Cedula, Barangay Clearance, Indigency, Civil Registry records) online. View processing times, document requirements, and Citizen's Charter standards on the E-Services portal.",
    route: "/e-services",
    actionText: "Request Certificate",
    sampleQuestion: "How do I request a certificate or clearance?"
  },
  {
    id: "tourism",
    category: "🌴 Tourism",
    icon: <MapPin size={14} />,
    keywords: ["tourist", "tourism", "spot", "spots", "visit", "destination", "danajon", "reef", "beach", "cathedral", "attraction", "delicacy", "delicacies"],
    title: "Tourism & Destinations",
    response: "Discover Talibon's premier tourist spots, including the Blessed Trinity Cathedral, Danajon Bank double barrier reef, coastal promenades, island resorts, and local marine delicacies.",
    route: "/tourism/spots",
    actionText: "Explore Tourism",
    sampleQuestion: "What tourist spots can I visit in Talibon?"
  },
  {
    id: "barangay_info",
    category: "🏘️ Barangay Info",
    icon: <Building2 size={14} />,
    keywords: ["barangay", "barangays", "captain", "poblacion", "san", "island", "council", "local", "residency"],
    title: "Barangay Information",
    response: "Talibon comprises 25 Barangays across mainland and island territory. View assigned Barangay Captains, office addresses, local council profiles, and Barangay clearances.",
    route: "/about/barangays",
    actionText: "View 25 Barangays",
    sampleQuestion: "Where can I find information about Talibon's Barangays?"
  },
  {
    id: "officials",
    category: "🏛️ Officials",
    icon: <User size={14} />,
    keywords: ["official", "officials", "mayor", "vice mayor", "sangguniang", "bayan", "janette", "garcia", "councilor", "leadership", "executive"],
    title: "LGU Officials & Mayor",
    response: "View elected municipal officials including Hon. Mayor Janette A. Garcia, Vice Mayor, Sangguniang Bayan Members, and Department Heads in the Executive section.",
    route: "/executive/officials",
    actionText: "Meet LGU Officials",
    sampleQuestion: "Who are the elected officials of Talibon?"
  },
  {
    id: "citizens_charter",
    category: "📜 Citizen's Charter",
    icon: <HelpCircle size={14} />,
    keywords: ["charter", "citizens", "service", "standards", "requirements", "fee", "fees", "processing", "step", "guide", "bplo"],
    title: "Citizen's Charter",
    response: "Access complete municipal service standards, required documents, step-by-step procedures, fee assessments, and turnaround times in our Citizen's Charter.",
    route: "/transparency/citizens-charter",
    actionText: "Read Citizen's Charter",
    sampleQuestion: "Where can I view the Citizen's Charter requirements?"
  },
  {
    id: "downloadables",
    category: "📥 Downloadables",
    icon: <FileText size={14} />,
    keywords: ["download", "downloads", "form", "forms", "pdf", "file", "attachment", "application form", "document", "documents"],
    title: "Downloadable Forms",
    response: "Download official application forms, tax declaration request forms, zoning clearances, and downloadable PDF documents from our Downloads Center.",
    route: "/downloads",
    actionText: "Browse Downloadables",
    sampleQuestion: "Where can I download municipal application forms?"
  },
  {
    id: "business_permits",
    category: "💼 Business Permits",
    icon: <Building2 size={14} />,
    keywords: ["business", "permit", "permits", "building", "eboss", "zoning", "license", "renewal", "bplo", "locational"],
    title: "Business & Building Permits",
    response: "Apply for or renew your Business Permit (E-BOSS), Building Permit, or Zoning Clearance online without paying online. Track request progress directly.",
    route: "/e-services",
    actionText: "E-BOSS & Permits",
    sampleQuestion: "How do I apply for or renew a business permit?"
  },
  {
    id: "news",
    category: "📰 News",
    icon: <Newspaper size={14} />,
    keywords: ["news", "update", "updates", "article", "articles", "press", "release", "orts", "accomplishment", "bulletin"],
    title: "LGU News & Updates",
    response: "Stay informed with official press releases, municipal accomplishment reports, and ORTS updates directly from the Talibon Public Information Office.",
    route: "/news/articles",
    actionText: "Read LGU News",
    sampleQuestion: "Where can I read the latest LGU news?"
  },
  {
    id: "advisories",
    category: "📢 Advisories",
    icon: <ShieldAlert size={14} />,
    keywords: ["advisory", "advisories", "announcement", "notice", "warning", "emergency", "pinned", "alert", "utility"],
    title: "Public Advisories & Announcements",
    response: "View pinned municipal advisories, emergency alerts, water/power maintenance notices, and disaster safety warnings under Public Advisories.",
    route: "/news/advisories",
    actionText: "View Public Advisories",
    sampleQuestion: "Are there any active public advisories?"
  },
  {
    id: "weather",
    category: "🌦️ Weather",
    icon: <CloudSun size={14} />,
    keywords: ["weather", "forecast", "rain", "temperature", "humidity", "wind", "pagasa", "climate", "typhoon", "storm"],
    title: "Local Weather Report",
    response: "Check live local weather reports (temperature, humidity, wind speed, rain probability) directly on the Talibon Municipal Portal homepage.",
    route: "/",
    actionText: "Check Weather on Homepage",
    sampleQuestion: "What is the local weather forecast for Talibon?"
  },
  {
    id: "contact_info",
    category: "📞 Contact Info",
    icon: <PhoneCall size={14} />,
    keywords: ["contact", "phone", "email", "reach", "address", "hall", "directory", "location", "poblacion", "inquiry"],
    title: "Contact Information & Directory",
    response: "Reach LGU Talibon offices, visit the Municipal Hall at Poblacion, Talibon, Bohol, or call direct hotlines via our Department Directory.",
    route: "/executive/directory",
    actionText: "View Municipal Directory",
    sampleQuestion: "How do I contact LGU offices?"
  },
  {
    id: "office_hours",
    category: "⏰ Office Hours",
    icon: <Info size={14} />,
    keywords: ["hours", "office hours", "schedule", "open", "time", "operating", "work", "days", "holiday"],
    title: "Office Hours & Operating Schedule",
    response: "Municipal offices are open Monday to Friday, 8:00 AM to 5:00 PM (except official public holidays). Emergency response and disaster management teams operate 24/7.",
    route: "/executive/directory",
    actionText: "View Office Directory",
    sampleQuestion: "What are the office hours of the Municipal Hall?"
  }
];

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: "init-1",
  role: "bot",
  text: "Mabuhay! I am your Talibon Digital Assistant. How can I assist you today? Select a suggested topic below or type your question.",
  timestamp: "Just now"
};

export default function MunicipalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const matchIntent = (query: string): ChatbotIntent | null => {
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/gi, "");
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);

    let bestIntent: ChatbotIntent | null = null;
    let maxScore = 0;

    for (const intent of CHATBOT_INTENTS) {
      let score = 0;
      for (const keyword of intent.keywords) {
        if (cleanQuery.includes(keyword)) {
          score += 3;
        }
        for (const word of words) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 1;
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    return maxScore >= 2 ? bestIntent : null;
  };

  const handleSend = (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const intent = matchIntent(queryText);

    let botMsg: ChatMessage;

    if (intent) {
      botMsg = {
        id: "bot-" + Date.now(),
        role: "bot",
        text: intent.response,
        route: intent.route,
        actionText: intent.actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      botMsg = {
        id: "bot-" + Date.now(),
        role: "bot",
        text: "I'm sorry, I don't have an exact answer for that yet. Try selecting one of the topics below or ask about municipal services, tourism, certificates, news, weather, or contact info!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (!textToSend) setInput("");
  };

  const handleReset = () => {
    setMessages([INITIAL_BOT_MESSAGE]);
    setInput("");
  };

  const handleNavigate = (route?: string) => {
    if (route) {
      navigate(route);
      // On small screens, close the chat panel after navigating
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand-primary text-white p-4 sm:p-4 rounded-full shadow-2xl hover:shadow-brand-primary/40 flex items-center gap-3 group transition-all border border-white/20"
          aria-label="Open Municipal Assistant Chat"
        >
          <div className="relative">
            <Bot size={24} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-brand-primary rounded-full animate-pulse" />
          </div>
          <span className="hidden md:inline-block font-black text-xs uppercase tracking-wider pr-1">
            Talibon Assistant
          </span>
        </motion.button>
      </div>

      {/* Compact Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-[95] w-[calc(100vw-1.5rem)] sm:w-96 md:w-[420px] h-[520px] sm:h-[580px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-text via-slate-900 to-brand-text text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/20 border border-brand-primary/40 rounded-2xl flex items-center justify-center text-brand-accent">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight font-display flex items-center gap-1.5 text-white">
                    Talibon Assistant
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] rounded-full font-mono">Rule-Based</span>
                  </h3>
                  <p className="text-[10px] text-white/60 font-medium">Digital Navigation & Citizen Info</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Reset Conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-1 border border-brand-primary/20">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                        msg.role === "user"
                          ? "bg-brand-primary text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.route && msg.actionText && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            onClick={() => handleNavigate(msg.route)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                          >
                            <span>{msg.actionText}</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono px-1 block">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested Question Pills Bar */}
            <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto shrink-0 flex gap-2 no-scrollbar">
              {CHATBOT_INTENTS.slice(0, 5).map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleSend(intent.sampleQuestion)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 border border-slate-200/60"
                >
                  {intent.category}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about mayor, tourism, forms, permits..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 bg-brand-primary disabled:opacity-40 text-white rounded-xl hover:bg-brand-primary/90 transition-all cursor-pointer shrink-0"
                aria-label="Send query"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
