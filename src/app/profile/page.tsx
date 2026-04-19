"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { User, GraduationCap, Building, Clock, CreditCard, Save, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [semester, setSemester] = useState("");
  const [upiId, setUpiId] = useState("");
  const [timings, setTimings] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setName(data.name || "");
        setCollege(data.college || "");
        setSemester(data.semester || "");
        setUpiId(data.upiId || "");
        setTimings(data.timings || "");
        setAddress(data.address || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    setSuccess(false);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const updates: any = { name };
      
      if (userData.role === "student") {
        updates.college = college;
        updates.semester = semester;
      } else if (userData.role === "partner") {
        updates.upiId = upiId;
        updates.timings = timings;
        updates.address = address;
      }

      await updateDoc(userRef, updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <ProtectedRoute allowedRoles={["student", "partner", "admin"]}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Your Profile</h1>
              <p className="text-muted capitalize">Role: {userData?.role}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Common Field */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            {/* Student Specific Fields */}
            {userData?.role === "student" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <GraduationCap size={16} /> College Name
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IIT Delhi"
                    className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 4th"
                    className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Partner Specific Fields */}
            {userData?.role === "partner" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                      <CreditCard size={16} /> UPI ID (for direct payment)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="example@upi"
                      className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                      <Clock size={16} /> Business Timings
                    </label>
                    <input
                      type="text"
                      value={timings}
                      onChange={(e) => setTimings(e.target.value)}
                      placeholder="e.g. 9 AM - 8 PM"
                      className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <Building size={16} /> Full Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete location details"
                    rows={3}
                    className="w-full bg-background/50 border border-white/10 text-white rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20"
            >
              {saving ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : success ? (
                <><CheckCircle size={20} /> Saved Successfully</>
              ) : (
                <><Save size={20} /> Update Profile</>
              )}
            </button>
            {/* Student Learning Stats */}
            {userData?.role === "student" && (
              <div className="mt-12 pt-8 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle size={22} className="text-primary" /> Learning Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-muted text-xs uppercase tracking-widest mb-2">Tests Taken</p>
                    <h4 className="text-3xl font-black text-white">{userData?.testsTaken || 0}</h4>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-muted text-xs uppercase tracking-widest mb-2">Average Score</p>
                    <h4 className="text-3xl font-black text-primary">{userData?.avgScore || 0}%</h4>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-muted text-xs uppercase tracking-widest mb-2">AI Rank</p>
                    <h4 className="text-3xl font-black text-blue-400">#{userData?.rank || "N/A"}</h4>
                  </div>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
