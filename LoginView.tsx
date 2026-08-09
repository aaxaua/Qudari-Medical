import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Pill,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const LoginView: React.FC = () => {
  const {
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    resetPassword,
    authError,
    setAuthError,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setAuthError(null);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else if (mode === "signup") {
        if (!displayName.trim()) {
          setAuthError("Please enter your full name.");
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Please check your inbox.");
      }
    } catch (err: any) {
      // Error handled inside AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    setAuthError(null);
    setSuccessMsg(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      // Handled inside AuthContext
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl relative z-10">
        
        {/* Left Branding Panel (Hidden on small mobile, visible on md+) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
          <div className="space-y-6">
            {/* Logo Badge */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <Pill className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-black text-base text-white tracking-tight leading-none">
                  QADRI'S MEDICAL
                </h1>
                <p className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase mt-0.5">
                  PharmaERP Pro
                </p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                Smart Pharmaceutical Agency Management
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Real-time stock monitoring, batch tracking, automated GST billing, party ledgers & AI invoice generator.
              </p>
            </div>

            {/* Feature Bullet Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolated Private Cloud Workspace</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-medium">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated Party Outstanding Ledgers</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-medium">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant PDF Invoicing & Expiry Alerts</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-800/60 text-[11px] text-slate-500">
            © {new Date().getFullYear()} Qadri's Medical Agency. All rights reserved.
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-6 bg-slate-900/60">
          
          {/* Form Header Title */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && "Create Your Account"}
              {mode === "forgot" && "Reset Your Password"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {mode === "login" && "Sign in to access your inventory, billing & party ledgers."}
              {mode === "signup" && "Get started with your private pharmaceutical workspace."}
              {mode === "forgot" && "Enter your registered email to receive a password reset link."}
            </p>
          </div>

          {/* Google Sign-In Button (For Login & Signup Modes) */}
          {mode !== "forgot" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleSubmitting || submitting}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-xs flex items-center justify-center space-x-3 border border-slate-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {googleSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-1.5-.8-3.5 0-5z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                )}
                <span>
                  {googleSubmitting ? "Connecting Google..." : "Continue with Google"}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0">
                  Or email authentication
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>
            </div>
          )}

          {/* Feedback Banners */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Email / Pass Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name Input (Only on Sign Up) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Rayees Qadri"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Address Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@qadrimedical.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input (Not required on Forgot Mode) */}
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setAuthError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-bold text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "login" && "Sign In to Workspace"}
                    {mode === "signup" && "Create Free Account"}
                    {mode === "forgot" && "Send Reset Password Link"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch Toggle Footer */}
          <div className="pt-2 text-center text-xs text-slate-400 font-medium">
            {mode === "login" && (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setAuthError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-emerald-400 hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setAuthError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-emerald-400 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <p>
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setAuthError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-emerald-400 hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
