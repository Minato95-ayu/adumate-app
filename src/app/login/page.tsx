"use client";
import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get role from URL query, default to student
  const roleQuery = searchParams.get("role") || "student";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Register new user
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          phone: user.phoneNumber || "",
          role: roleQuery,
          createdAt: new Date().toISOString()
        });
        
        if (roleQuery === "partner") router.push("/partner");
        else router.push("/dashboard");
      } else {
        // Existing user
        const userData = userSnap.data();
        if (userData.role === "partner") router.push("/partner");
        else if (userData.role === "admin") router.push("/admin");
        else router.push("/dashboard");
      }
      // Note: We deliberately DO NOT setLoading(false) here on success.
      // This keeps the spinner active while Next.js routes to the dashboard.
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
      setLoading(false); // Only stop loading if there is an error
    }
  };

  useEffect(() => {
    // Prefetch routes in background so redirection is instant
    router.prefetch("/dashboard");
    router.prefetch("/partner");
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,107,0,0.3)]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">
            Join as {roleQuery === "partner" ? "Partner" : "Student"}
          </h1>
          <p className="text-muted text-sm px-4">
            {roleQuery === "partner" 
              ? "List your services and reach thousands of students instantly." 
              : "Login with Google to access libraries, hostels, and more."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center text-muted text-xs mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy. 100% Free for MVP.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
