import { Link } from 'react-router-dom';
import { Bot, Target, Zap, Trophy, ArrowRight } from 'lucide-react';
import { useState } from "react";
export default function Landing() {
  const [backendMsg, setBackendMsg] = useState("");

  const pingBackend = async () => {
  try {
   const res = await fetch("https://ai-interviewer-app-pfe6.onrender.com/api/health");
    const data = await res.json();
    setBackendMsg(data.message || "Backend working perfectly 🚀");
  } catch (err) {
    setBackendMsg("❌ Backend not reachable / CORS issue");
  }
};
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-4">
                    <Bot size={16} />
                    <span>Powered by Google Gemini AI</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
                    Master Your Next <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Tech Interview</span>
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Practice with a highly intelligent AI interviewer. Get real-time feedback, score your answers, and analyze your resume to land your dream job.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
  <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25">
    Get Started Free <ArrowRight size={20} />
  </Link>

  <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all">
    Log in to Dashboard
  </Link>
</div>

{/* ✅ yaha add */}
<div className="mt-6 flex flex-col items-center gap-2">
  <button
    onClick={pingBackend}
    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
  >
    Test Backend Connection
  </button>

  {backendMsg && (
    <p className="text-indigo-300 text-sm">{backendMsg}</p>
  )}
</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24 relative z-10">
                {[
                    { icon: <Target className="text-blue-400" />, title: "Role-Specific Questions", desc: "Select your desired role, from Frontend to Data Science, and get tailored questions." },
                    { icon: <Zap className="text-amber-400" />, title: "Real-time Feedback", desc: "Instant scoring and constructive feedback on every answer you provide." },
                    { icon: <Trophy className="text-emerald-400" />, title: "Resume Gap Analysis", desc: "Upload your resume and get an AI analysis of missing skills for your target role." }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-slate-400">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
