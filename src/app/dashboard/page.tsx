"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceCard from "@/components/ServiceCard";
import { Search, Book, Home, Utensils, DoorOpen, GraduationCap, Briefcase, Bell, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const CATEGORIES = [
  { id: "all", name: "All", icon: <Search size={18} /> },
  { id: "library", name: "Library", icon: <Book size={18} /> },
  { id: "hostel", name: "Hostel", icon: <Home size={18} /> },
  { id: "mess", name: "Mess", icon: <Utensils size={18} /> },
  { id: "room", name: "Rooms", icon: <DoorOpen size={18} /> },
  { id: "tutor", name: "Tutors", icon: <GraduationCap size={18} /> },
  { id: "job", name: "Jobs", icon: <Briefcase size={18} /> },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch User Info
        const userPhone = auth.currentUser.phoneNumber;
        setUserName(userPhone ? userPhone : "Student");

        // Fetch Live Services
        const qServices = query(collection(db, "services"), where("approved", "==", true));
        const snapServices = await getDocs(qServices);
        const fetchedServices = snapServices.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(fetchedServices);

        // Fetch My Activity
        const qRequests = query(collection(db, "requests"), where("studentId", "==", auth.currentUser.uid));
        const snapRequests = await getDocs(qRequests);
        const fetchedRequests = snapRequests.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Match request service IDs to service names
        const enrichedRequests = fetchedRequests.map(req => {
          const serviceDetails = fetchedServices.find(s => s.id === req.serviceId);
          return { ...req, serviceName: serviceDetails?.name || "Unknown Service" };
        });
        setMyRequests(enrichedRequests);

      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => { fetchData(); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleJoin = async (service: any) => {
    if (!auth.currentUser) return alert("Please login first");
    try {
      await addDoc(collection(db, "requests"), {
        studentId: auth.currentUser.uid,
        serviceId: service.id,
        partnerId: service.partnerId,
        status: "pending",
        paymentStatus: "completed", 
        amount: service.price,
        platformFee: 19,
        createdAt: new Date().toISOString()
      });
      alert(`Request sent! ₹${service.price + 19} will be deducted upon approval.`);
      // Optimistic update
      setMyRequests([...myRequests, { serviceName: service.name, status: "pending", createdAt: new Date().toISOString() }]);
    } catch (e) {
      console.error(e);
      alert("Error processing request");
    }
  };

  const filteredServices = services.filter(service => {
    const matchesTab = activeTab === "all" || service.type === activeTab;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="flex justify-between items-center mb-8 perspective-1000"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-foreground drop-shadow-md">Hi {userName} 👋</h1>
            <p className="text-muted mt-1 text-lg">Find your perfect study setup</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/5 p-3 rounded-full hover:bg-white/10 transition-colors relative shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Bell size={24} className="text-foreground" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8 perspective-1000"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-muted" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search libraries, hostels, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/80 backdrop-blur-xl border border-white/10 text-foreground text-lg rounded-2xl focus:ring-2 focus:ring-primary block pl-12 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all transform hover:translate-z-5"
          />
        </motion.div>

        {/* Categories Quick Access */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex overflow-x-auto pb-6 mb-10 gap-4 custom-scrollbar perspective-1000"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              whileHover={{ scale: 1.05, rotateY: 10, translateZ: 10 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.05) }}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl whitespace-nowrap transition-colors font-medium min-w-[110px] transform-style-preserve-3d ${
                activeTab === cat.id 
                  ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-[0_10px_20px_rgba(255,107,0,0.4)] border border-primary/50" 
                  : "bg-card/60 backdrop-blur-md text-muted hover:bg-white/10 border border-white/10 shadow-lg hover:shadow-xl"
              }`}
            >
              <div className={`${activeTab === cat.id ? "text-white" : "text-primary"} transform translate-z-10`}>
                {cat.icon}
              </div>
              <span className="text-sm transform translate-z-5">{cat.name}</span>
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              📍 Nearby Services
            </h2>
            
            {loading ? (
               <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,107,0,0.5)]"></div></div>
            ) : filteredServices.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card/50 backdrop-blur-lg rounded-3xl border border-white/10 p-10 text-center shadow-2xl"
              >
                <Search size={40} className="mx-auto mb-4 text-muted/50" />
                <h3 className="text-xl font-bold">No services found</h3>
                <p className="text-muted mt-2">Try adjusting your search filters.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
                {filteredServices.map((service, index) => (
                  <motion.div 
                    key={service.id} 
                    initial={{ opacity: 0, y: 50, rotateX: 20 }} 
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }} 
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                    whileHover={{ scale: 1.02, rotateY: 5, rotateX: -2, translateZ: 20 }}
                    className="transform-style-preserve-3d"
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

          {/* Sidebar: My Activity */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              📊 My Activity
            </h2>
            <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] h-fit relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              {myRequests.length === 0 ? (
                <div className="text-center py-10 text-muted">
                  <p>You haven't joined any services yet.</p>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {myRequests.map((req, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: -5 }}
                      className="flex justify-between items-center p-4 bg-background/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-md hover:shadow-primary/10 transition-all cursor-default"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{req.serviceName}</p>
                        <p className="text-xs text-muted mt-1">₹{req.amount} + ₹19 fee</p>
                      </div>
                      {req.status === "approved" ? (
                        <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                          <CheckCircle size={12} /> Joined
                        </span>
                      ) : req.status === "rejected" ? (
                        <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-lg text-xs font-bold">
                          Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(251,146,60,0.2)]">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
