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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#09090b] via-[#121214] to-black text-white font-sans relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/6 left-1/6 h-[400px] w-[400px] bg-zinc-800/15 rounded-full blur-[120px] animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-1/6 right-1/6 h-[500px] w-[500px] bg-zinc-700/10 rounded-full blur-[140px] animate-pulse duration-[8000ms]" />

      {/* Login Card */}
      <div className="backdrop-blur-2xl bg-[#0e0e11]/80 border border-white/[0.08] p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-[400px] mx-4 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Branding Header with Law Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 overflow-hidden bg-black rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/[0.08] mb-4 transform hover:scale-105 hover:rotate-2 transition-all duration-300">
            <img 
              src="/law_logo.png" 
              alt="LexDesk Logo" 
              className="h-full w-full object-cover" 
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white bg-clip-text">LexDesk</h1>
          <p className="text-zinc-500 text-[10px] mt-1.5 uppercase tracking-[0.2em] font-extrabold">
            Practice Management Portal
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Dynamic Error Messaging */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username/Email Input Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
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
                className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-white/20 focus:ring-2 focus:ring-white/[0.04] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-all placeholder:text-zinc-600 text-white font-medium"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">
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
                className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-white/20 focus:ring-2 focus:ring-white/[0.04] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-all placeholder:text-zinc-600 text-white font-medium"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-zinc-950 hover:bg-zinc-100 active:bg-zinc-200 py-3.5 rounded-xl font-bold shadow-lg shadow-black/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validating...
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
