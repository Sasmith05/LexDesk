"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid username/email or password. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-zinc-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-zinc-800/10 rounded-full blur-3xl animate-pulse duration-[8000ms]" />

      {/* Login Card */}
      <div className="backdrop-blur-md bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-96 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Branding Header with Law Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 overflow-hidden bg-zinc-950 rounded-2xl flex items-center justify-center shadow-xl border border-zinc-800/80 mb-4 hover:scale-105 transition-transform duration-300">
            <img 
              src="/law_logo.png" 
              alt="LexDesk Logo" 
              className="h-full w-full object-cover" 
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">LexDesk</h1>
          <p className="text-zinc-500 text-xs mt-1.5 uppercase tracking-widest font-semibold">
            Practice Management Portal
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Dynamic Error Messaging */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username/Email Input Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                id="email"
                type="text"
                placeholder="e.g. admin, advocate, staff"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all placeholder:text-zinc-600 text-white"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all placeholder:text-zinc-600 text-white"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-950 font-bold py-3.5 px-4 rounded-xl text-sm shadow-md hover:shadow-white/5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden mt-6 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

