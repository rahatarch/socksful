"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  X,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("socksful-user", JSON.stringify(data.user));
        router.push("/checkout");
      } else {
        // Switch to OTP verification UI
        setIsVerifying(true);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      localStorage.setItem("socksful-user", JSON.stringify(data.user));
      router.push("/checkout");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen font-jakarta flex flex-col">
      <Navbar />

      <section className="flex-grow flex items-center justify-center pt-32 pb-20 px-6 relative">
        <div className="w-full max-w-[400px]">
          {/* Back Button for OTP Step */}
          {isVerifying && (
            <button
              onClick={() => setIsVerifying(false)}
              className="absolute top-24 left-6 md:left-12 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest cursor-pointer"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {/* Headline Section */}
          <div className="text-center mb-10">
            <motion.h1
              key={
                isVerifying ? "verify-h1" : isLogin ? "login-h1" : "signup-h1"
              }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-3"
            >
              {isVerifying ? "Check Email." : isLogin ? "Sign In." : "Join Us."}
            </motion.h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              {isVerifying
                ? `Enter the 6-digit code sent to ${formData.email}`
                : isLogin
                  ? "Welcome back to SocksFul."
                  : "Start your premium comfort journey."}
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2"
              >
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <X size={12} />
                </div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Menu Switcher */}
          {!isVerifying && (
            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${isLogin ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${!isLogin ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"}`}
              >
                New Account
              </button>
            </div>
          )}

          {/* Forms */}
          <form
            onSubmit={isVerifying ? handleVerifyOtp : handleAuth}
            className="space-y-4"
          >
            {!isVerifying ? (
              <>
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <User
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                        size={18}
                      />
                      <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-medium"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="relative">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />
                  <input
                    required
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-medium"
                  />
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    autoFocus
                    required
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center text-3xl tracking-[0.5em] font-bold py-6 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center leading-relaxed">
                  Enter the verification code to activate your account.
                </p>
              </motion.div>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isVerifying
                    ? "Verify Account"
                    : isLogin
                      ? "Sign In"
                      : "Get OTP"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Password Recovery (Login Only) */}
          {isLogin && !isVerifying && (
            <div className="mt-6 text-center">
              <button className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand transition-colors cursor-pointer">
                Forgot password?
              </button>
            </div>
          )}

          {/* Social Logins */}
          {!isVerifying && (
            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-6">
                Or continue with
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                  <span className="font-bold text-lg">G</span>
                </div>
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors shadow-sm text-black">
                  <span className="font-bold text-xl"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
