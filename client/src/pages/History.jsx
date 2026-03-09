import { useState, useEffect } from 'react';
import API from '../services/api';
import { Loader2, History as HistoryIcon, ArrowRight, Calendar, User, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await API.get('/interviews/history');
                setSessions(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 w-12 h-12" /></div>;

    return (
        <div className="flex-grow max-w-5xl w-full mx-auto p-6 lg:p-12">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shadow-inner border border-slate-700">
                    <HistoryIcon size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Interview History</h1>
                    <p className="text-slate-400">Review past sessions and track your improvement</p>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-24 bg-slate-800/20 border border-slate-800 border-dashed rounded-3xl">
                    <p className="text-slate-500 text-lg">No interviews yet.</p>
                    <Link to="/dashboard" className="text-indigo-400 font-medium hover:underline mt-2 inline-block">Start your first interview</Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {sessions.map(session => {
                        const date = new Date(session.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });
                        const progress = (session.answers.length / session.questions.length) * 100;

                        return (
                            <div key={session._id} className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl hover:bg-slate-800/60 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                                <div className="space-y-4 flex-1 w-full">
                                    <div className="flex items-center justify-between md:justify-start gap-4">
                                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                            <User size={18} className="text-indigo-400" />
                                            {session.role}
                                        </h3>
                                        <span className="flex items-center gap-1.5 text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                                            <Calendar size={14} /> {date}
                                        </span>
                                    </div>

                                    <div className="flex gap-8 text-sm">
                                        <p className="text-slate-400">
                                            <span className="text-white font-medium mr-1">{session.answers.length}/{session.questions.length}</span>
                                            Questions Answered
                                        </p>
                                        <div className="h-4 w-px bg-slate-700"></div>
                                        <p className="text-slate-400 flex items-center gap-1.5">
                                            <Star size={14} className={session.score > 0 ? "text-amber-400" : "text-slate-600"} />
                                            <span className="text-white font-medium">{session.score}</span> / 10 Avg Score
                                        </p>
                                    </div>

                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <Link
                                    to={`/interview/${session._id}`}
                                    className="w-full md:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 focus:ring-2 ring-indigo-500/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-600"
                                >
                                    Review <ArrowRight size={18} />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
