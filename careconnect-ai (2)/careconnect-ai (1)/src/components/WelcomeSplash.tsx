import React from "react";
import { HeartPulse, ArrowRight } from "lucide-react";

interface WelcomeSplashProps {
  onFinished: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onFinished }) => {
  const enter = () => {
    onFinished();
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.28),transparent_58%)]" />
      <div className="relative w-full max-w-xl rounded-[2rem]p-[2px] bg-linear-to-r from-teal-300 via-cyan-400 to-emerald-300 shadow-[0_0_45px_rgba(45,212,191,0.45)] animate-pulse">
        <div className="rounded-[1.9rem] bg-slate-900 overflow-hidden">
          <div className="relative h-[min(62vh,430px)] min-h-82.5 flex items-end">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=85&w=1200"
              alt="Healthcare professional using digital healthcare technology"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/45 to-teal-950/10" />
            <div className="relative z-10 p-7 sm:p-10 w-full text-center text-white">
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_28px_rgba(45,212,191,0.8)]">
                <HeartPulse className="w-9 h-9" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-teal-200 font-bold mb-3">Your health, intelligently guided</p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">CareConnect AI</h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200">Healthcare navigation, symptom insight, and trusted care in one place.</p>
              <div className="mt-7">
                <button onClick={enter} className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/30 hover:bg-teal-300">
                  Enter CareConnect <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 text-center text-[10px] text-slate-400 bg-slate-950/80">
            <span>Secure healthcare navigation for India</span>
          </div>
        </div>
      </div>
    </main>
  );
};
