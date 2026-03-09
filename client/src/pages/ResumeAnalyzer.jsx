import { useState } from 'react';
import API from '../services/api';
import { Loader2, FileText, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ResumeAnalyzer() {
    const [resumeText, setResumeText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        if (!resumeText.trim()) return;
        setLoading(true);
        setAnalysis(null);
        try {
            const { data } = await API.post('/resume/analyze', { resumeText });
            setAnalysis(data);
        } catch (err) {
            console.error(err);
            alert('Failed to analyze resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow max-w-6xl w-full mx-auto p-6 lg:p-12 flex flex-col md:flex-row gap-12">
            <div className="flex-1 flex flex-col">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/20">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Resume Analyzer</h1>
                    <p className="text-slate-400">Paste your raw resume text to get an instant AI evaluation of your key skills and missing gaps.</p>
                </div>

                <textarea
                    className="flex-grow w-full min-h-[400px] bg-slate-900/50 border border-slate-700 rounded-3xl p-6 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner font-mono text-sm leading-relaxed"
                    placeholder="Paste your plain text resume here... e.g. 'John Doe. Experienced Frontend Developer. Skills: React, Node.js, CSS...'"
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                />

                <button
                    onClick={analyze}
                    disabled={!resumeText.trim() || loading}
                    className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    {loading ? <><Loader2 className="animate-spin" size={24} /> Analyzing Profile...</> : <><Play className="fill-current" size={20} /> Analyze Resume</>}
                </button>
            </div>

            <div className="w-full md:w-[450px] flex flex-col">
                <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                    Analysis Results {analysis && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Ready</span>}
                </h2>

                <div className="flex-grow bg-slate-800/30 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle gradient bg */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                    {!analysis && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                            <FileText size={48} className="mb-4 text-slate-700" opacity={0.5} />
                            <p>Paste your resume and hit Analyze.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4">
                            <Loader2 size={48} className="animate-spin" />
                            <p className="animate-pulse font-medium">Extracting data via Groq...</p>
                        </div>
                    )}

                    {analysis && !loading && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-emerald-400" /> Extracted Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.skills?.length > 0 ? analysis.skills.map((skill, i) => (
                                        <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            {skill}
                                        </span>
                                    )) : <p className="text-slate-500">No specific technical skills found.</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-amber-400" /> Gap Analysis
                                </h3>
                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 text-slate-300 text-sm leading-relaxed border-l-4 border-l-amber-500">
                                    <ReactMarkdown>{analysis.gapAnalysis}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
