"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, CheckCircle, Crosshair, MapPin } from "lucide-react";
import Link from "next/link";

export default function AddServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "library",
    name: "",
    description: "",
    price: "",
    location: "",
    lat: "",
    lon: "",
    phone: "",
    website: "",
    instagram: "",
    facebook: "",
    youtube: "",
    whatsapp: "",
    seats: "",
    imageUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS is not available in this browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          lat: String(pos.coords.latitude),
          lon: String(pos.coords.longitude)
        }));
        setLoading(false);
      },
      () => {
        setLoading(false);
        alert("Location permission denied. You can enter latitude and longitude manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const geocodeLocation = async () => {
    if (!formData.location.trim()) {
      alert("Please enter location first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(formData.location)}`);
      const data = await res.json();
      if (!data.lat || !data.lon) throw new Error("Not found");
      setFormData(prev => ({
        ...prev,
        lat: String(data.lat),
        lon: String(data.lon)
      }));
    } catch {
      alert("Location pin nahi mila. GPS use karo ya lat/lon manually paste karo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      let lat = Number(formData.lat);
      let lon = Number(formData.lon);

      if ((!lat || !lon) && formData.location.trim()) {
        try {
          const res = await fetch(`/api/geocode?city=${encodeURIComponent(formData.location)}`);
          const data = await res.json();
          lat = Number(data.lat);
          lon = Number(data.lon);
        } catch { }
      }

      await addDoc(collection(db, "services"), {
        partnerId: auth.currentUser.uid,
        type: formData.type,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        lat: lat || null,
        lon: lon || null,
        phone: formData.phone,
        website: formData.website,
        instagram: formData.instagram,
        facebook: formData.facebook,
        youtube: formData.youtube,
        whatsapp: formData.whatsapp,
        social: {
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          youtube: formData.youtube,
          whatsapp: formData.whatsapp,
        },
        seats: formData.seats ? Number(formData.seats) : null,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        approved: false, // Admin needs to approve
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/partner");
      }, 2000);
    } catch (error) {
      console.error("Error adding service: ", error);
      alert("Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/partner" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {success ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Service Submitted!</h2>
              <p className="text-muted text-lg">Your service is pending admin approval.</p>
              <p className="text-sm text-primary mt-4">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Add New Service</h1>
                <p className="text-muted mt-2">Fill in the details. Once approved, it will be visible to students.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Service Type</label>
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleChange}
                      className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all appearance-none"
                    >
                      <option value="library">Library</option>
                      <option value="hostel">Hostel</option>
                      <option value="mess">Mess</option>
                      <option value="room">Room</option>
                      <option value="tutor">Tutor</option>
                      <option value="job">Job</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name / Title</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name} 
                      onChange={handleChange}
                      placeholder="e.g. Sunrise Boys Hostel"
                      className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea 
                    name="description" 
                    required
                    rows={3}
                    value={formData.description} 
                    onChange={handleChange}
                    placeholder="Describe amenities, rules, timings etc..."
                    className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      name="price" 
                      required
                      value={formData.price} 
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      required
                      value={formData.location} 
                      onChange={handleChange}
                      placeholder="e.g. Mukherjee Nagar, Delhi"
                      className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-background/60 border border-white/10 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
                        <MapPin size={16} className="text-primary" />
                        Exact Map Pin
                      </label>
                      <p className="text-xs text-muted">Google/Zomato jaisa accurate marker ke liye GPS pin save karo.</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={useCurrentLocation} disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-bold transition-all">
                        <Crosshair size={13} /> Use GPS
                      </button>
                      <button type="button" onClick={geocodeLocation} disabled={loading || !formData.location.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-lg text-xs font-bold transition-all disabled:opacity-40">
                        <MapPin size={13} /> Pin From Address
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        name="lat"
                        value={formData.lat}
                        onChange={handleChange}
                        placeholder="e.g. 28.7041"
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        name="lon"
                        value={formData.lon}
                        onChange={handleChange}
                        placeholder="e.g. 77.1025"
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Total Seats / Vacancies (Optional)</label>
                    <input 
                      type="number" 
                      name="seats" 
                      value={formData.seats} 
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Image URL (Temporary)</label>
                    <input 
                      type="url" 
                      name="imageUrl" 
                      value={formData.imageUrl} 
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-background border border-white/10 text-foreground text-base rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-4 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-background/60 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-1">Contact & Social Profiles</h3>
                  <p className="text-xs text-muted mb-4">Ye details map popup aur pin card mein dikhenge.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Phone / Call Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91..."
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">WhatsApp Link / Number</label>
                      <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="https://wa.me/91..."
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Website</label>
                      <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..."
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Instagram</label>
                      <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..."
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Facebook</label>
                      <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..."
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">YouTube</label>
                      <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/..."
                        className="w-full bg-card border border-white/10 text-foreground text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent p-3 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/25"
                  >
                    {loading ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
