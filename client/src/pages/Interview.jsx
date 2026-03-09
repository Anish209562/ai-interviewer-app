import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Send, User, Bot, Loader2, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Interview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answerInput, setAnswerInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [chatLog, setChatLog] = useState([]); // [{ role: 'ai' | 'user', text: '', isFeedback: false }]
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data } = await API.get(`/interviews/${id}`);
                setSession(data);

                // Reconstruct chat log
                const log = [];
                data.answers.forEach((ans, i) => {
                    const q = data.questions.find(q => q.id === ans.questionId);
                    log.push({ role: 'ai', text: q.question, isFeedback: false });
                    log.push({ role: 'user', text: ans.answer, isFeedback: false });
                    const fb = data.feedback.find(f => f.questionId === ans.questionId);
                    if (fb) {
                        log.push({
                            role: 'ai',
                            text: `**Score: ${fb.score}/10**\n\n${fb.feedback}`,
                            isFeedback: true
                        });
                    }
                });
                setChatLog(log);
                setCurrentQuestionIndex(data.answers.length);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answerInput.trim() || submitting || currentQuestionIndex >= session.questions.length) return;

        const currentQ = session.questions[currentQuestionIndex];
        setSubmitting(true);

        // Optimistic UI
        const newUserMsg = { role: 'user', text: answerInput, isFeedback: false };
        setChatLog(prev => [...prev, newUserMsg]);
        setAnswerInput('');

        try {
            const { data } = await API.post(`/interviews/${id}/answer`, {
                questionId: currentQ.id,
                answer: newUserMsg.text
            });

            const aiFeedbackMsg = {
                role: 'ai',
                text: `**Score: ${data.evaluation.score}/10**\n\n${data.evaluation.feedback}`,
                isFeedback: true
            };

            setChatLog(prev => [...prev, aiFeedbackMsg]);
            setCurrentQuestionIndex(data.sessionDetails.answersCount);
            setSession(prev => ({ ...prev, score: data.sessionDetails.currentScore }));

        } catch (err) {
            console.error(err);
            alert('Failed to submit answer');
            // Rollback optimistic
            setChatLog(prev => prev.slice(0, -1));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500 w-12 h-12" /></div>;
    if (!session) return <div className="flex-grow flex items-center justify-center p-6 text-xl">Session not found.</div>;

    const isComplete = currentQuestionIndex >= session.questions.length;

    return (
        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar sidebar-status */}
            <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col overflow-y-auto hidden md:flex">
                <h2 className="text-xl font-bold mb-6 text-white">{session.role} Interview</h2>

                <div className="space-y-4 flex-grow">
                    {session.questions.map((q, i) => {
                        const isAnswered = i < currentQuestionIndex;
                        const isCurrent = i === currentQuestionIndex;
                        return (
                            <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${isCurrent ? 'bg-indigo-600/20 border border-indigo-500/30' :
                                    isAnswered ? 'bg-slate-800/50 opacity-70' : 'bg-slate-800/20'
                                }`}>
                                <div className={`mt-0.5 rounded-full p-1 ${isAnswered ? 'bg-emerald-500/20 text-emerald-400' :
                                        isCurrent ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-500'
                                    }`}>
                                    {isAnswered ? <CheckCircle2 size={16} /> : isCurrent ? <Play size={16} fill="currentColor" /> : <Loader2 size={16} className={isCurrent ? 'animate-spin' : ''} />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${isCurrent ? 'text-indigo-300' : isAnswered ? 'text-emerald-300' : 'text-slate-400'}`}>
                                        Question {i + 1}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.question}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isComplete && (
                    <div className="mt-8 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-center">
                        <p className="text-slate-400 text-sm mb-1">Final Score</p>
                        <p className="text-4xl font-black text-white">{session.score}<span className="text-lg text-slate-500">/10</span></p>
                        <button onClick={() => navigate('/dashboard')} className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950/50">
                <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 flex flex-col pt-8">
                    {chatLog.map((msg, i) => (
                        <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-emerald-600' :
                                    msg.isFeedback ? 'bg-amber-600' : 'bg-indigo-600'
                                }`}>
                                {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                            </div>
                            <div className={`p-5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-slate-200 rounded-tr-sm' :
                                    msg.isFeedback ? 'bg-amber-500/10 border border-amber-500/20 text-slate-300 rounded-tl-sm' :
                                        'bg-indigo-600/10 border border-indigo-500/20 text-slate-200 rounded-tl-sm'
                                }`}>
                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}

                    {!isComplete && !submitting && (
                        <div className="flex gap-4 max-w-3xl">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-slate-200 rounded-tl-sm shadow-sm">
                                <p className="leading-relaxed font-medium">{session.questions[currentQuestionIndex].question}</p>
                            </div>
                        </div>
                    )}

                    {submitting && (
                        <div className="flex gap-4 max-w-3xl">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
                                <Bot size={20} className="text-white animate-pulse" />
                            </div>
                            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-400 rounded-tl-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Evaluating answer...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {isComplete ? (
                    <div className="p-6 bg-slate-900 border-t border-slate-800 text-center text-slate-400">
                        Interview complete. Great job! Navigate to dashboard or history to review.
                    </div>
                ) : (
                    <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800">
                        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end">
                            <textarea
                                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-6 pr-16 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[80px] max-h-[200px]"
                                placeholder="Type your answer here..."
                                value={answerInput}
                                onChange={e => setAnswerInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (answerInput.trim()) handleSubmit(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!answerInput.trim() || submitting}
                                className="absolute right-3 bottom-3 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all"
                            >
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                        <p className="text-center text-xs text-slate-500 mt-3 hidden md:block">Press Enter to send, Shift + Enter for new line</p>
                    </div>
                )}
            </div>
        </div>
    );
}
