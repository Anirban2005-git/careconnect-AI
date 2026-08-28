import React, { useState } from "react";
import { HeartPulse, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { isFirebaseConfigured } from "../../services/firebase";

type AuthView = "login" | "signup" | "forgot";

export function AuthPages() {
  const { login, loginWithGoogle, register, resetPassword, isLoading } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (view === "login") {
        await login(email, password || undefined);
      } else if (view === "signup") {
        await register(email, fullName, password || undefined);
      } else {
        await resetPassword(email);
        setSuccess("Password reset email sent. Check your inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100/60 flex flex-col font-sans antialiased overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1800"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover blur-[1px] scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-slate-100/45" />
      </div>

      <div className="relative z-10 bg-amber-50/95 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>
            <span className="font-bold">Medical Disclaimer:</span> CareConnect AI provides general health information and healthcare navigation. It does not provide medical diagnosis or replace a qualified healthcare professional.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-teal-600 to-cyan-500 shadow-lg shadow-teal-500/20 mb-4">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">CareConnect AI</h1>
            <p className="text-sm text-slate-500 mt-1">Intelligent Healthcare Navigation for India</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {view === "login" ? "Welcome Back" : view === "signup" ? "Create Account" : "Reset Password"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {view === "login"
                ? "Sign in to access your health dashboard"
                : view === "signup"
                ? "Join CareConnect AI for personalized healthcare navigation"
                : "Enter your email to receive a reset link"}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === "signup" && (
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                    placeholder="Ananya Roy"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                  placeholder="you@email.com"
                />
              </div>
              {view !== "forgot" && isFirebaseConfigured() && (
                <div>
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    required={isFirebaseConfigured()}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {(submitting || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Send Reset Link"}
              </button>
            </form>

            {view === "login" && (
              <button
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full mt-3 py-3 rounded-xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm disabled:opacity-60"
              >
                Continue with Google
              </button>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
              {view === "login" && (
                <>
                  <button
                    onClick={() => {
                      setSuccess("Please create your account first, then complete sign up.");
                      setView("signup");
                    }}
                    className="text-teal-700 font-semibold hover:underline"
                  >
                    Don't have an account? Sign up
                  </button>
                  <br />
                  {isFirebaseConfigured() && (
                    <button onClick={() => setView("forgot")} className="text-slate-600 hover:underline">
                      Forgot password?
                    </button>
                  )}
                </>
              )}
              {view === "signup" && (
                <button onClick={() => setView("login")} className="text-teal-700 font-semibold hover:underline">
                  Already have an account? Sign in
                </button>
              )}
              {view === "forgot" && (
                <button onClick={() => setView("login")} className="text-teal-700 font-semibold hover:underline">
                  Back to sign in
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>256-bit encrypted • ABHA & NDHM ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
