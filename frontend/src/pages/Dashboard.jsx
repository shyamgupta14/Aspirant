import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Book, Star, Activity, Zap, Terminal, Megaphone, X } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(365 * 24 * 60 * 60);
    const [stats, setStats] = useState({ completed: 0, total: 12, bookmarks: 0 });
    const [announcement, setAnnouncement] = useState(null);
    const [showAnn, setShowAnn] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        fetchStats();
        fetchAnn();
        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/auth/bookmarks');
            setStats(prev => ({ ...prev, bookmarks: res.data.length }));
        } catch (err) { console.error(err); }
    };

    const fetchAnn = async () => {
        try {
            const res = await api.get('/announcements');
            if (res.data) setAnnouncement(res.data);
        } catch (err) { console.error(err); }
    };

    const formatTime = (seconds) => {
        const d = Math.floor(seconds / (24 * 3600));
        const h = Math.floor((seconds % (24 * 3600)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return { d, h, m, s };
    };

    const { d, h, m, s } = formatTime(timeLeft);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-white min-h-screen relative">
            {/* Announcement Banner */}
            <AnimatePresence>
                {announcement && showAnn && (
                    <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-4xl px-4">
                        <div className="bg-blue-600 p-4 rounded-2xl flex items-center justify-between gap-6 shadow-[0_0_50px_rgba(37,99,235,0.4)] border border-blue-400">
                             <div className="flex items-center gap-4">
                                <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-bounce"><Megaphone size={20}/></span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System_Broadcast</p>
                                    <p className="font-bold tracking-tight text-white/90">{announcement.message}</p>
                                </div>
                             </div>
                             <button onClick={() => setShowAnn(false)} className="hover:bg-white/10 p-2 rounded-xl h-fit transition-all transition-colors"><X size={18}/></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 px-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <p className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Mission_Control_v0.5
                    </p>
                    <h1 className="text-7xl font-black tracking-tighter leading-[0.9]">Dashboard.</h1>
                </motion.div>
                <div className="flex gap-10">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Local Identity</p>
                        <p className="text-xl font-bold tracking-tight text-slate-200">@{user?.username || 'operator'}</p>
                    </div>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
                {[
                    { label: 'Days', val: d }, { label: 'Hrs', val: h },
                    { label: 'Min', val: m }, { label: 'Sec', val: s }
                ].map((unit, idx) => (
                    <motion.div key={idx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                        className="linear-card p-10 flex flex-col items-center justify-center relative group">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/0 group-hover:bg-blue-500/20 transition-all" />
                        <h2 className="text-7xl font-black tracking-tighter mb-1">{unit.val < 10 ? `0${unit.val}` : unit.val}</h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">{unit.label}</p>
                    </motion.div>
                ))}

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 linear-card p-12 flex flex-col md:flex-row gap-12 items-center">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <motion.circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="8" fill="transparent"
                                strokeDasharray={2 * Math.PI * 74}
                                initial={{ strokeDashoffset: 2 * Math.PI * 74 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 74 * (1 - stats.completed / stats.total) }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="text-blue-500" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black">{Math.round((stats.completed / stats.total) * 100)}%</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-blue-500 tracking-[0.4em] mb-4 flex items-center gap-2">
                             <Activity size={12} /> Syllabus_Sync
                        </p>
                        <h3 className="text-4xl font-black tracking-tighter mb-4 italic">Preparation Status.</h3>
                        <p className="text-slate-500 font-bold mb-6 text-sm leading-relaxed">Core topics synchronized. Advanced algorithms pending analysis.</p>
                        <div className="flex gap-6 pt-6 border-t border-white/5">
                             <div>
                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Left</p>
                                <p className="text-2xl font-black tracking-tighter">{stats.total - stats.completed}</p>
                             </div>
                             <div>
                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Saved</p>
                                <p className="text-2xl font-black tracking-tighter">{stats.bookmarks}</p>
                             </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                    className="lg:col-span-2 linear-card p-12 bg-blue-600/[0.02]">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black tracking-tight italic">Daily_Directives.</h3>
                        <Zap size={24} className="text-blue-500 animate-pulse" />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: '📁', label: 'Primary', topic: 'Paging', sub: 'OS' },
                            { icon: '💾', label: 'Secondary', topic: 'Normalization', sub: 'DBMS' },
                            { icon: '📡', label: 'Audit', topic: '5 PYQs', sub: 'Aptitude' }
                        ].map((d, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default">
                                <span className="text-2xl mb-4 block">{d.icon}</span>
                                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2">{d.label}</p>
                                <p className="font-bold text-lg mb-1">{d.topic}</p>
                                <p className="text-[10px] font-mono text-blue-500 uppercase">{d.sub}</p>
                            </div>
                        ))}
                     </div>
                </motion.div>
            </div>

            <footer className="flex gap-8 px-12 py-10 rounded-full bg-white/[0.03] border border-white/5 items-center">
                 <Terminal size={18} className="text-blue-500 animate-pulse" />
                 <p className="text-xs font-mono tracking-widest text-slate-600 uppercase overflow-hidden whitespace-nowrap">
                    WELCOME OPERATOR {user?.username?.toUpperCase()} // SIGNAL ACTIVE // DATA SYNC STABLE...
                 </p>
            </footer>
        </motion.div>
    );
}
