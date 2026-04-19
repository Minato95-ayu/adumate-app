"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CheckCircle, XCircle, DollarSign, Users, Clock } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [stats, setStats] = useState({ earnings: 0, students: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const qPending = query(collection(db, "services"), where("approved", "==", false));
      const snapPending = await getDocs(qPending);
      const pendingList = snapPending.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingServices(pendingList);

      const qStudents = query(collection(db, "users"), where("role", "==", "student"));
      const snapStudents = await getDocs(qStudents);
      
      const snapRequests = await getDocs(collection(db, "requests"));

      setStats({
        earnings: snapRequests.size * 19,
        students: snapStudents.size,
        pending: pendingList.length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "services", id), { approved: true });
      fetchAdminData();
    } catch(err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if(confirm("Are you sure you want to reject and delete this service?")) {
      try {
        await deleteDoc(doc(db, "services", id));
        fetchAdminData();
      } catch(err) {
        console.error(err);
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted mt-1">Approve services and monitor platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center"><DollarSign size={24}/></div>
              <p className="text-muted font-medium">Total Earnings</p>
            </div>
            <h2 className="text-5xl font-black text-white">₹{stats.earnings}</h2>
            <p className="text-sm text-primary mt-2">From ₹19 platform fees</p>
          </div>
          
          <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center"><Users size={24}/></div>
              <p className="text-muted font-medium">Active Students</p>
            </div>
            <h2 className="text-5xl font-black text-white">{stats.students}</h2>
          </div>

          <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center"><Clock size={24}/></div>
              <p className="text-muted font-medium">Pending Approvals</p>
            </div>
            <h2 className="text-5xl font-black text-orange-400">{stats.pending}</h2>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          Pending Services <span className="bg-orange-500/20 text-orange-400 text-sm px-3 py-1 rounded-full">{pendingServices.length}</span>
        </h2>
        
        {loading ? (
           <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : pendingServices.length === 0 ? (
          <div className="bg-card border border-white/5 rounded-3xl p-10 text-center shadow-xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
              <CheckCircle size={30} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-muted">No pending services to approve right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingServices.map(service => (
              <div key={service.id} className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">{service.type}</span>
                    <h3 className="text-xl font-bold text-white">{service.name}</h3>
                  </div>
                  <p className="text-muted text-sm mb-2">{service.description}</p>
                  <div className="flex gap-4 text-sm font-medium">
                    <span className="text-white">₹{service.price}</span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{service.location}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleReject(service.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-3 rounded-xl font-bold transition-colors">
                    <XCircle size={18}/> Reject
                  </button>
                  <button onClick={() => handleApprove(service.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 px-5 py-3 rounded-xl font-bold transition-colors">
                    <CheckCircle size={18}/> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
