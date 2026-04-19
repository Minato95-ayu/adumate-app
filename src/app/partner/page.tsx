"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PlusCircle, Users, DollarSign, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function PartnerDashboard() {
  const [services, setServices] = useState<any[]>([]);
  const [studentRequests, setStudentRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ earnings: 0, totalStudents: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [newRequestAlert, setNewRequestAlert] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!auth.currentUser) return;
    try {
      // 1. Fetch Partner's Services
      const qServices = query(collection(db, "services"), where("partnerId", "==", auth.currentUser.uid));
      const snapServices = await getDocs(qServices);
      const myServices: any[] = snapServices.docs.map(d => ({ id: d.id, ...d.data() as any }));
      setServices(myServices);

      // 2. Fetch Incoming Requests for those services
      const qRequests = query(collection(db, "requests"), where("partnerId", "==", auth.currentUser.uid));
      const snapRequests = await getDocs(qRequests);
      const allRequests: any[] = snapRequests.docs.map(d => ({ id: d.id, ...d.data() as any }));
      
      // Enqueue service details into requests
      const enrichedRequests = allRequests.map(req => {
        const serviceData = myServices.find(s => s.id === req.serviceId);
        return { ...req, serviceName: serviceData?.name || "Unknown Service" };
      });

      // Filter pending requests for the UI list
      const pending = enrichedRequests.filter(req => req.status === "pending");
      setStudentRequests(pending);

      // Calculate Stats
      const approved = enrichedRequests.filter(req => req.status === "approved");
      const totalEarnings = approved.reduce((acc, req) => acc + Number(req.amount), 0);

      setStats({
        earnings: totalEarnings,
        totalStudents: approved.length,
        pendingRequests: pending.length
      });

    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Real-time listener for NEW requests
    if (!auth.currentUser) return;
    const q = query(collection(db, "requests"), where("partnerId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.status === "pending") {
            setNewRequestAlert(`Naya Student Aaya! Check kijiye.`);
            setTimeout(() => setNewRequestAlert(null), 5000);
          }
        }
      });
      // Also refresh the lists
      fetchDashboardData();
    });

    return () => unsubscribe();
  }, []);

  const handleRequest = async (requestId: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "requests", requestId), { status: newStatus });
      fetchDashboardData(); // Refresh list and stats
    } catch (error) {
      console.error("Error updating request", error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Real-time Notification Alert */}
        <AnimatePresence>
          {newRequestAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -100, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.5 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-primary text-white px-8 py-4 rounded-full font-black shadow-[0_0_40px_rgba(255,107,0,0.6)] border-2 border-white/20 flex items-center gap-3 animate-bounce"
            >
              <Users size={24} className="animate-pulse" />
              {newRequestAlert.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partner Dashboard</h1>
            <p className="text-muted mt-1">Manage services, track earnings, and approve students</p>
          </div>
          <Link href="/partner/add-service" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-[0_6px_0_#994000] active:translate-y-[4px] active:shadow-none">
            <PlusCircle size={20} />
            Add New Service
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 perspective-1000">
          {[
            { icon: <DollarSign size={28}/>, label: "Total Earnings", value: `₹${stats.earnings}`, color: "green" },
            { icon: <Users size={28}/>, label: "Active Students", value: stats.totalStudents, color: "blue" },
            { icon: <Clock size={28}/>, label: "Pending Requests", value: stats.pendingRequests, color: "orange" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6, type: "spring" }}
              whileHover={{ scale: 1.05, rotateY: 5, translateZ: 10 }}
              className={`bg-card/80 backdrop-blur-lg border ${stat.color === 'orange' && stats.pendingRequests > 0 ? 'border-primary shadow-[0_0_20px_rgba(255,107,0,0.3)] animate-pulse' : 'border-white/10'} rounded-3xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center gap-6 transform-style-preserve-3d relative overflow-hidden group`}
            >
              {stat.color === 'orange' && stats.pendingRequests > 0 && (
                <div className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
              )}
              <div className={`absolute top-[-20px] right-[-20px] w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-2xl group-hover:bg-${stat.color}-500/20 transition-colors`}></div>
              <div className={`w-14 h-14 bg-${stat.color}-500/20 text-${stat.color}-500 rounded-2xl flex items-center justify-center transform translate-z-10 shadow-[0_0_15px_rgba(var(--${stat.color}-rgb),0.3)]`}>
                {stat.icon}
              </div>
              <div className="transform translate-z-5">
                <p className="text-muted text-sm font-medium">{stat.label}</p>
                <h2 className="text-3xl font-black text-white">{stat.value}</h2>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Incoming Requests */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📥 Student Requests</h2>
            <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-[400px] overflow-y-auto custom-scrollbar relative">
              {loading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,107,0,0.5)]"></div></div>
              ) : studentRequests.length === 0 ? (
                <div className="text-center py-10 text-muted">
                  <CheckCircle size={50} className="mx-auto mb-4 text-white/10 drop-shadow-lg" />
                  <p className="text-lg">No new requests to process.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentRequests.map((req, idx) => (
                    <motion.div 
                      key={req.id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="bg-background/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-primary/20 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-white text-lg">{req.serviceName}</p>
                          <p className="text-xs text-muted mt-1 font-mono">ID: {req.studentId.substring(0,8)}</p>
                        </div>
                        <span className="text-primary font-black text-xl drop-shadow-[0_0_10px_rgba(255,107,0,0.3)]">₹{req.amount}</span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleRequest(req.id, "approved")} className="flex-1 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 hover:from-green-500 hover:to-green-600 hover:text-white text-green-400 font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                          <CheckCircle size={18}/> Approve
                        </button>
                        <button onClick={() => handleRequest(req.id, "rejected")} className="flex-1 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 hover:from-red-500 hover:to-red-600 hover:text-white text-red-400 font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm">
                          <XCircle size={18}/> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* My Services List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📂 My Services</h2>
            <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-[400px] overflow-y-auto custom-scrollbar space-y-4">
              {loading ? (
                 <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,107,0,0.5)]"></div></div>
              ) : services.length === 0 ? (
                <div className="text-center py-10 text-muted flex flex-col items-center">
                  <Package size={50} className="text-white/10 mb-4" />
                  <p className="text-lg">You haven't added any services.</p>
                  <Link href="/partner/add-service" className="text-primary hover:underline mt-2 inline-block font-bold">Create one now</Link>
                </div>
              ) : (
                services.map((service, idx) => (
                  <motion.div 
                    key={service.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                    className="bg-background/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex justify-between items-center shadow-lg hover:shadow-primary/10 transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-white text-lg">{service.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-primary/20 text-primary border border-primary/20 text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-[0_0_10px_rgba(255,107,0,0.2)]">{service.type}</span>
                        <span className="text-sm font-medium text-muted">₹{service.price}</span>
                      </div>
                    </div>
                    {service.approved ? (
                      <span className="text-green-400 bg-green-400/10 p-2.5 rounded-xl border border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]" title="Live"><CheckCircle size={22}/></span>
                    ) : (
                      <span className="text-orange-400 bg-orange-400/10 p-2.5 rounded-xl border border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.2)]" title="Pending Admin Approval"><Clock size={22}/></span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
