import { useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Briefcase, Code, Database, Server, PenTool, Loader2 } from 'lucide-react';

const ROLES = [
    { id: 'Frontend Developer', icon: <PenTool size={24} className="text-pink-400" /> },
    { id: 'Backend Developer', icon: <Server size={24} className="text-emerald-400" /> },
    { id: 'Fullstack Developer', icon: <Code size={24} className="text-indigo-400" /> },
    { id: 'Data Scientist', icon: <Database size={24} className="text-blue-400" /> },
    { id: 'Product Manager', icon: <Briefcase size={24} className="text-amber-400" /> },
];

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    const startInterview = async () => {
        if (!selectedRole) return;
        setLoading(true);
        try {
            const { data } = await API.post('/interviews/start', { role: selectedRole });
            navigate(`/interview/${data._id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to start interview');
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow max-w-5xl w-full mx-auto p-6 lg:p-12">
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
                <p className="text-slate-400 text-lg">Ready for your next practice session? Select a role below to begin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {ROLES.map((role) => (
                    <div
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`cursor-pointer group p-6 rounded-2xl border transition-all ${selectedRole === role.id
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]'
                                : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedRole === role.id ? 'bg-indigo-500/20' : 'bg-slate-900/50 group-hover:bg-slate-700/50'
                            }`}>
                            {role.icon}
                        </div>
                        <h3 className="font-semibold text-lg text-slate-100">{role.id}</h3>
                        <p className="text-sm text-slate-400 mt-2">5 technical questions tailored for this track.</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={startInterview}
                    disabled={!selectedRole || loading}
                    className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all ${!selectedRole || loading
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95'
                        }`}
                >
                    {loading ? <><Loader2 className="animate-spin" /> Preparing AI...</> : 'Start Interview'}
                </button>
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-white">Need a resume review?</h3>
                        <p className="text-slate-400 max-w-lg">Get an instant AI-powered breakdown of your skills, highlighting exactly what you need to improve for top tech roles.</p>
                    </div>
                    <button onClick={() => navigate('/resume')} className="whitespace-nowrap px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors">
                        Analyze Resume
                    </button>
                </div>
            </div>
        </div>
    );
}
