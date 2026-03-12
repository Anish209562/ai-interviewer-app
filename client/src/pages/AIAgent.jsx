import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Briefcase,
  Eraser,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import API from '../services/api';

const QUICK_ACTIONS = [
  {
    label: 'Ask interview question',
    value: 'ask_interview_question',
    prompt: 'Ask me one strong interview question for my target role and tell me what a great answer should cover.',
  },
  {
    label: 'Improve my answer',
    value: 'improve_answer',
    prompt: 'Improve this interview answer for clarity, impact, and confidence:',
  },
  {
    label: 'Resume tips',
    value: 'resume_tips',
    prompt: 'Give me concise resume tips to improve my profile for software roles.',
  },
  {
    label: 'HR interview help',
    value: 'hr_interview_help',
    prompt: 'Help me prepare for HR interview questions like tell me about yourself, strengths, and why should we hire you.',
  },
  {
    label: 'Technical interview help',
    value: 'technical_interview_help',
    prompt: 'Help me prepare for a technical interview with practical guidance, likely questions, and answer strategy.',
  },
];

export default function AIAgent() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [techStack, setTechStack] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get('/agent/history');
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load assistant history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (messageText, quickAction = '') => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || sending) return;

    setSending(true);
    setError('');

    const optimisticUserMessage = {
      role: 'user',
      content: trimmedMessage,
      metadata: {
        quickAction,
        role: selectedRole,
        techStack,
        experienceLevel,
      },
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setMessage('');

    try {
      const { data } = await API.post('/agent/chat', {
        message: trimmedMessage,
        quickAction,
        role: selectedRole,
        techStack,
        experienceLevel,
      });

      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.slice(0, -1));
      setError(err.response?.data?.error || 'Failed to get assistant reply');
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    if (sending) return;

    try {
      setError('');
      await API.delete('/agent/history');
      setMessages([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to clear chat history');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(message);
  };

  const useQuickAction = async (action) => {
    setMessage(action.prompt);
    await sendMessage(action.prompt, action.value);
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300">
            <Sparkles size={16} />
            Career AI Assistant
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white">Your in-app interview and career coach</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Ask about interviews, resume improvements, project explanations, HR rounds, or role-specific preparation.
          </p>
        </div>

        <button
          onClick={clearChat}
          disabled={sending || (loading && messages.length === 0)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eraser size={16} />
          Clear Chat
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Wrench size={18} className="text-indigo-400" />
            Assistant Setup
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Target role</label>
              <input
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                placeholder="Frontend Developer"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition-colors focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Tech stack</label>
              <input
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="React, Node.js, MongoDB"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition-colors focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Experience level</label>
              <input
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                placeholder="Fresher / 2 years / Senior"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition-colors focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Briefcase size={14} />
              Quick Actions
            </h3>
            <div className="mt-4 grid gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.value}
                  onClick={() => useQuickAction(action)}
                  disabled={sending}
                  className="rounded-2xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-left text-sm font-medium text-slate-200 transition-all hover:border-indigo-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
          <div className="border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-300">
                <Bot size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-white">Career AI Assistant</h2>
                <p className="text-sm text-slate-400">Interview prep, answer refinement, resume help, and career guidance</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-3xl border border-slate-800 bg-slate-800/40 p-5 text-indigo-300">
                  <MessageSquare size={30} />
                </div>
                <h3 className="text-xl font-semibold text-white">Start your first conversation</h3>
                <p className="mt-2 max-w-xl text-slate-400">
                  Ask for mock interview questions, resume fixes, answer improvements, HR prep, or help explaining your projects.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((entry, index) => (
                  <div
                    key={`${entry.role}-${index}-${entry.content.slice(0, 16)}`}
                    className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {entry.role === 'assistant' && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm md:max-w-[75%] ${
                        entry.role === 'user'
                          ? 'rounded-br-md bg-emerald-600 text-white'
                          : 'rounded-bl-md border border-indigo-500/20 bg-indigo-500/10 text-slate-100'
                      }`}
                    >
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                        <ReactMarkdown>{entry.content}</ReactMarkdown>
                      </div>
                    </div>

                    {entry.role === 'user' && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                ))}

                {sending && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                      <Bot size={18} />
                    </div>
                    <div className="rounded-3xl rounded-bl-md border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        AI is typing...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 bg-slate-950/40 p-4 md:p-5">
            {error && (
              <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask the assistant about interview prep, resume tips, project explanations, or answer improvement..."
                className="min-h-[88px] flex-1 resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition-colors focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Send
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
