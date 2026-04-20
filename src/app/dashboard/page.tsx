"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ServiceCard from "@/components/ServiceCard";
import { Search, Book, Home, Utensils, DoorOpen, GraduationCap, Briefcase, Bell, Clock, CheckCircle, Brain, Zap, User, LogIn, Target, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ViralToolModal from "@/components/ViralToolModal";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", name: "All", icon: <Search size={18} /> },
  { id: "ai-test", name: "AI Test", icon: <Brain size={18} />, path: "/test" },
  { id: "library", name: "Library", icon: <Book size={18} /> },
  { id: "hostel", name: "Hostel", icon: <Home size={18} /> },
  { id: "mess", name: "Mess", icon: <Utensils size={18} /> },
  { id: "room", name: "Rooms", icon: <DoorOpen size={18} /> },
  { id: "tutor", name: "Tutors", icon: <GraduationCap size={18} /> },
  { id: "job", name: "Jobs", icon: <Briefcase size={18} /> },
];

const EXAMS = [
  { id: "jee", label: "JEE / IIT", icon: "⚡" },
  { id: "neet", label: "NEET", icon: "🧬" },
  { id: "class10", label: "Class 10", icon: "📗" },
  { id: "class12", label: "Class 12", icon: "📘" },
  { id: "upsc", label: "UPSC", icon: "🇮🇳" },
  { id: "ssc", label: "SSC / Bank", icon: "🏦" },
  { id: "gate", label: "GATE", icon: "🔬" },
  { id: "other", label: "Other", icon: "🎯" },
];

const VIRAL_TOOLS = [
  { id: "doubt", name: "AI Doubt Solver", desc: "Photo khicho, solution pao", icon: "📸", color: "from-purple-500/20 to-indigo-500/20", border: "border-purple-500/30", path: null },
  { id: "1v1", name: "1v1 Challenge", desc: "Dosto ko harao", icon: "⚔️", color: "from-red-500/20 to-orange-500/20", border: "border-red-500/30", path: null },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("Guest");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [savingExam, setSavingExam] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setUserName(firebaseUser.displayName || firebaseUser.phoneNumber || "Student");
        // Load saved exam preference from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.examTarget) setSelectedExam(data.examTarget);
          }
        } catch { }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch services (public - no login required)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const qServices = query(collection(db, "services"), where("approved", "==", true));
        const snapServices = await getDocs(qServices);
        const fetchedServices: any[] = snapServices.docs.map(d => ({ id: d.id, ...d.data() as any }));
        setServices(fetchedServices);
      } catch { } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch user requests (only when logged in)
  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      try {
        const qRequests = query(collection(db, "requests"), where("studentId", "==", user.uid));
        const snapRequests = await getDocs(qRequests);
        const reqs: any[] = snapRequests.docs.map(d => ({ id: d.id, ...d.data() as any }));
        setMyRequests(reqs);
      } catch { }
    };
    fetchRequests();
  }, [user]);

  const handleSaveExam = async (examId: string) => {
    setSelectedExam(examId);
    if (!user) return; // Save locally if not logged in
    setSavingExam(true);
    try {
      await setDoc(doc(db, "users", user.uid), { examTarget: examId }, { merge: true });
    } catch { } finally {
      setSavingExam(false);
    }
  };

  const handleJoin = async (service: any) => {
    if (!user) {
      router.push("/login?role=student");
      return;
    }
    try {
      await addDoc(collection(db, "requests"), {
        studentId: user.uid,
        serviceId: service.id,
        partnerId: service.partnerId,
        status: "pending",
        paymentStatus: "completed",
        amount: service.price,
        platformFee: 19,
        createdAt: new Date().toISOString()
      });
      alert(`Request sent! ₹${service.price + 19} will be deducted upon approval.`);
      setMyRequests(prev => [...prev, { serviceName: service.name, status: "pending" }]);
    } catch (e) {
      alert("Error processing request");
    }
  };

  const filteredServices = services.filter(service => {
    const matchesTab = activeTab === "all" || service.type === activeTab;
    const matchesSearch = service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const examLabel = EXAMS.find(e => e.id === selectedExam);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* === HERO SECTION === */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {user ? (
          /* LOGGED IN HERO */
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Hi {userName.split(" ")[0]} 👋
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                {examLabel ? `Preparing for ${examLabel.icon} ${examLabel.label}` : "Apna exam target set karo 👇"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button whileHover={{ scale: 1.1 }} className="bg-white/5 p-2 sm:p-3 rounded-full hover:bg-white/10 relative">
                <Bell size={20} className="text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </motion.button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
            </div>
          </div>
        ) : (
          /* GUEST HERO - Login Prompt */
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-orange-500/5 to-transparent border border-primary/20 rounded-3xl p-5 sm:p-6">
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 opacity-5">
              <User size={120} />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1">Welcome to Adumate! 🎓</h1>
                <p className="text-slate-300 text-xs sm:text-sm">Login karo — apna exam save karo, aur AI features use karo</p>
              </div>
              <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                <Link href="/login?role=student"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-black px-5 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 text-sm">
                  <LogIn size={16} /> Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* === EXAM TARGET SELECTOR === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 bg-card/50 border border-white/10 rounded-3xl p-4 sm:p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-primary" />
          <h2 className="font-black text-white text-[10px] sm:text-xs uppercase tracking-widest">
            Exam Target {!user && <span className="hidden sm:inline text-muted-foreground font-normal ml-2">(Login to save)</span>}
          </h2>
          {savingExam && <span className="text-[10px] text-primary ml-auto">Saving...</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMS.map(exam => (
            <button
              key={exam.id}
              onClick={() => handleSaveExam(exam.id)}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                selectedExam === exam.id
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-white"
              }`}
            >
              <span>{exam.icon}</span> {exam.label}
            </button>
          ))}
        </div>
        {selectedExam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
            <Zap size={16} className="text-primary" />
            <p className="text-sm text-primary font-bold">
              {examLabel?.label} ka AI test do →
            </p>
            <button onClick={() => router.push(`/test?topic=${encodeURIComponent(examLabel?.label || selectedExam)}`)}
              className="ml-auto text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-hover transition-all">
              Start Now
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* === KNOWLEDGE FINDER (3D CARDS) === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            icon: "🧠",
            title: "AI Test Hub",
            desc: "Topic likho — AI quiz banayega aur concept samjhayega",
            color: "from-blue-600/20 to-indigo-600/20",
            border: "border-blue-500/30",
            path: "/test",
            btn: "Start Test"
          },
          {
            icon: "🔍",
            title: "Resource Finder",
            desc: "Videos, Notes, aur Telegram channels ek jagah dhundo",
            color: "from-purple-600/20 to-pink-600/20",
            border: "border-purple-500/30",
            path: "/search?q=Newton's Laws",
            btn: "Search Now"
          },
          {
            icon: "📍",
            title: "Service Map",
            desc: "Nearby Libraries, Hostels aur Tutors mapping",
            color: "from-orange-600/20 to-red-600/20",
            border: "border-orange-500/30",
            path: "/map",
            btn: "Open Map"
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => router.push(card.path)}
            className={`p-6 rounded-[2rem] bg-gradient-to-br ${card.color} border ${card.border} backdrop-blur-xl cursor-pointer group shadow-xl`}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-black text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">{card.desc}</p>
            <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all">
              {card.btn} →
            </div>
          </motion.div>
        ))}
      </div>

      {/* === GLOBAL SEARCH === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative mb-4"
      >
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="text-primary" size={22} />
        </div>
        <input
          type="text"
          id="global-search"
          placeholder="🔍  Search: 'Class 10 Newton Laws', 'JEE Maths', 'React tutorial'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          className="w-full bg-card/80 backdrop-blur-2xl border-2 border-white/10 text-foreground text-base rounded-3xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 block pl-14 pr-36 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all"
        />
        <button
          onClick={() => searchQuery.trim() && router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
          className="absolute right-3 inset-y-0 my-auto h-10 bg-primary hover:bg-primary-hover text-white font-black px-5 rounded-2xl transition-all text-sm shadow-lg shadow-primary/20"
        >
          Search 🚀
        </button>
      </motion.div>

      {/* Quick search chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(selectedExam === "jee"
          ? ["JEE Maths", "JEE Physics", "JEE Chemistry", "JEE PYQ"]
          : selectedExam === "neet"
          ? ["NEET Biology", "NEET Chemistry", "NEET Physics", "NEET PYQ"]
          : selectedExam === "class10"
          ? ["Class 10 Science", "Class 10 Maths", "Class 10 Social", "Class 10 English"]
          : selectedExam === "class12"
          ? ["Class 12 Physics", "Class 12 Maths", "Class 12 Chemistry", "Class 12 Biology"]
          : ["Class 10 Physics", "JEE Maths", "Python basics", "English Grammar", "GK India"]
        ).map(chip => (
          <button
            key={chip}
            onClick={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
            className="text-xs px-4 py-2 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-primary rounded-full transition-all font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* === VIRAL TOOLS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {VIRAL_TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            onClick={() => { if (tool.path) router.push(tool.path); else setSelectedTool(tool.id); }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + (i * 0.1) }}
            whileHover={{ y: -6, scale: 1.02 }}
            className={`p-6 rounded-3xl bg-gradient-to-br ${tool.color} border ${tool.border} backdrop-blur-lg cursor-pointer group relative overflow-hidden`}
          >
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">
              {tool.icon}
            </div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">{tool.name}</h3>
              <p className="text-sm text-slate-300">{tool.desc}</p>
            </div>
            <div className="mt-4 text-xs font-bold text-primary flex items-center gap-1">
              LAUNCH NOW <ChevronRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* === CATEGORIES === */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex overflow-x-auto pb-4 mb-8 gap-3 custom-scrollbar"
      >
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.id}
            onClick={() => { if ((cat as any).path) router.push((cat as any).path); else setActiveTab(cat.id); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + (i * 0.05) }}
            className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl whitespace-nowrap transition-colors font-medium min-w-[100px] ${
              activeTab === cat.id
                ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-[0_8px_20px_rgba(255,107,0,0.3)] border border-primary/50"
                : "bg-card/60 backdrop-blur-md text-muted hover:bg-white/10 border border-white/10"
            }`}
          >
            <div className={`${activeTab === cat.id ? "text-white" : "text-primary"}`}>{cat.icon}</div>
            <span className="text-xs">{cat.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* === SERVICES GRID + ACTIVITY SIDEBAR === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Services */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📍 Nearby Services</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-lg rounded-3xl border border-white/10 p-10 text-center">
              <Search size={40} className="mx-auto mb-4 text-muted/50" />
              <h3 className="text-xl font-bold">No services found</h3>
              <p className="text-muted mt-2">Try adjusting filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <ServiceCard
                    type={service.type}
                    name={service.name}
                    description={service.description}
                    price={service.price}
                    location={service.location}
                    seats={service.seats}
                    image={service.images?.[0]}
                    onJoin={() => handleJoin(service)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📊 My Activity</h2>
          <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            {!user ? (
              <div className="text-center py-8">
                <User size={36} className="mx-auto text-muted/50 mb-3" />
                <p className="text-muted-foreground text-sm mb-4">Login karo apni activity dekhne ke liye</p>
                <Link href="/login?role=student"
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-hover transition-all">
                  <LogIn size={14} /> Login Now
                </Link>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Abhi tak koi service join nahi ki.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-between items-center p-4 bg-background/80 rounded-2xl border border-white/5"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{req.serviceName || "Service"}</p>
                      <p className="text-xs text-muted mt-0.5">₹{req.amount} + ₹19 fee</p>
                    </div>
                    {req.status === "approved" ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle size={12} /> Joined</span>
                    ) : req.status === "rejected" ? (
                      <span className="text-red-400 text-xs font-bold">Rejected</span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-400 text-xs font-bold"><Clock size={12} /> Pending</span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Viral Modal */}
      <ViralToolModal toolId={selectedTool} onClose={() => setSelectedTool(null)} />
    </div>
  );
}
