"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ["student", "partner", "admin"] 
}: { 
  children: React.ReactNode,
  allowedRoles?: string[] 
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          if (!allowedRoles.includes(role)) {
            // Redirect to appropriate dashboard based on role
            if (role === "admin") router.push("/admin");
            else if (role === "partner") router.push("/partner");
            else router.push("/dashboard");
          } else {
            setLoading(false);
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user role", error);
        setLoading(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;}
