import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, PlayCircle, FileText, Target, ChevronRight, Hash, Globe, Layers, Database, Cpu } from 'lucide-react';

export default function LearningLab() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [activeTopic, setActiveTopic] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarks, setBookmarks] = useState([]);
    const [tab, setTab] = useState('explore'); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subRes = await api.get('/subjects');
                setSubjects(subRes.data);
                if (subRes.data.length > 0) setActiveSubject(subRes.data[0]);
                const bookRes = await api.get('/auth/bookmarks');
                setBookmarks(bookRes.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const toggleBookmark = async (topicName) => {
        try {
            const res = await api.post('/auth/bookmark', { topicName });
            setBookmarks(res.data);
        } catch (err) { console.error(err); }
    };

    const allTopics = subjects.flatMap(s => s.chapters.flatMap(c => c.topics.map(t => ({ ...t, subject: s.name, chapter: c.name }))));
    const filteredTopics = allTopics.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const bookmarkedList = allTopics.filter(t => bookmarks.includes(t.name));

    const getSubjectIcon = (name) => {
        if (name.includes('OS')) return <Layers size={18} />;
        if (name.includes('DBMS')) return <Database size={18} />;
        if (name.includes('Design')) return <Cpu size={18} />;
        return <Globe size={18} />;
    };

    return (
        <div className="flex flex-col min-h-screen text-white bg-transparent">
            {/* Ultra-Modern Header */}
            <header className="sticky top-0 z-40 glass-blur border-b border-white/5 px-12 py-10 flex flex-col xl:flex-row justify-between items-center gap-10">
                <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 gap-2 backdrop-blur-3xl shadow-xl">
                    <button onClick={() => setTab('explore')} className={`px-10 py-3.5 rounded-xl font-bold transition-all ${tab === 'explore' ? 'bg-white text-black shadow-lg translate-y-[-1px]' : 'text-slate-500 hover:text-white'}`}>Explore_Nodes</button>
                    <button onClick={() => setTab('saved')} className={`px-10 py-3.5 rounded-xl font-bold transition-all ${tab === 'saved' ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)]' : 'text-slate-500 hover:text-white'}`}>Saved_Terminal</button>
                </div>
                <div className="relative w-full max-w-xl group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-all" size={20} />
                    <input type="text" placeholder="Access topic node via metadata search..."
                        className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-700"
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* ── SEARCH RESULTS ── */}
                <AnimatePresence mode="wait">
                    {searchQuery ? (
                        <motion.div key="search" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-y-auto p-12 space-y-12">
                            <h2 className="text-5xl font-black mb-12 italic tracking-tighter">Search_Fragments.</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTopics.slice(0, 15).map((topic, i) => (
                                    <TopicNode key={i} topic={topic} onSelect={setActiveTopic} onBookmark={toggleBookmark} isBookmarked={bookmarks.includes(topic.name)} getIcon={getSubjectIcon} />
                                ))}
                            </div>
                        </motion.div>
                    ) : tab === 'explore' ? (
                        <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex overflow-hidden">
                            {/* Pro-style Sub-Nav */}
                            <div className="w-80 border-r border-white/5 glass-blur p-10 space-y-4 overflow-y-auto hidden xl:block relative z-10">
                                <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.5em] mb-8">Network_Nodes</p>
                                {subjects.map(s => (
                                    <button key={s._id} onClick={() => setActiveSubject(s)}
                                        className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all font-bold group ${activeSubject?._id === s._id ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}`}>
                                        <span className={`${activeSubject?._id === s._id ? 'text-black' : 'text-blue-500'} transition-colors`}>{getSubjectIcon(s.name)}</span>
                                        <span className="flex-1 text-left">{s.name}</span>
                                        <ChevronRight size={16} className={`${activeSubject?._id === s._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
                                    </button>
                                ))}
                            </div>

                            {/* Content Display */}
                            <div className="flex-1 overflow-y-auto p-12 space-y-16">
                                <div className="mb-20">
                                    <p className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-3">
                                        <Hash size={12} /> NODE_{activeSubject?._id?.slice(-6)}
                                    </p>
                                    <h1 className="text-7xl font-black tracking-tighter mb-4 italic">{activeSubject?.name}.</h1>
                                    <p className="text-slate-500 font-bold text-lg max-w-xl">Comprehensive repository of verified topics and mission directives.</p>
                                </div>
                                <div className="space-y-24">
                                    {activeSubject?.chapters.map((ch, i) => (
                                        <div key={i}>
                                            <h3 className="text-2xl font-black mb-8 italic flex items-center gap-4 text-slate-300">
                                                <span className="text-blue-500/40 font-mono text-sm underline decoration-blue-500/20 underline-offset-8">NODE_CH_{i+1}</span>
                                                {ch.name}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {ch.topics.map((t, idx) => (
                                                    <div key={idx} onClick={() => setActiveTopic(t)} className="linear-card group p-8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-blue-500 transition-all mt-4 mr-4">
                                                            <PlayCircle size={32} />
                                                        </div>
                                                        <p className="text-blue-500 font-black text-[9px] uppercase tracking-widest mb-2 italic">Module_Link_{t.id}</p>
                                                        <h4 className="text-xl font-bold tracking-tight mb-2 group-hover:text-white transition-colors">{t.name}</h4>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto p-16 space-y-12">
                            <h2 className="text-5xl font-black italic tracking-tighter mb-16">Archived_Memory. ({bookmarkedList.length})</h2>
                            {bookmarkedList.length === 0 ? (
                                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] opacity-40 italic">
                                    <Search size={48} className="mb-6 opacity-20" />
                                    <p className="text-xl font-bold">Your secure archive is empty. Add topic nodes to save sync points.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {bookmarkedList.map((topic, i) => (
                                        <TopicNode key={i} topic={topic} onSelect={setActiveTopic} onBookmark={toggleBookmark} isBookmarked={true} getIcon={getSubjectIcon} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Pro Video Player Overlay */}
            <AnimatePresence>
                {activeTopic && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center p-12 bg-black/90 backdrop-blur-[40px]">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }} className="w-full max-w-6xl linear-card bg-[#000] p-10 relative border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] z-0" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <p className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-2 italic">Active_Session_Node: {activeTopic.id}</p>
                                        <h2 className="text-4xl font-black tracking-tighter italic">{activeTopic.name}</h2>
                                    </div>
                                    <button onClick={() => setActiveTopic(null)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">✖</button>
                                </div>
                                <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-3xl mb-10">
                                    <iframe className="w-full h-full" src={activeTopic.vid} title="Node Player" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                </div>
                                <div className="flex flex-wrap gap-5 justify-between">
                                    <div className="flex gap-4">
                                        <a href={activeTopic.notes} className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-slate-200 transition-all shadow-xl">
                                            <FileText size={18} /> Synchronize Notes
                                        </a>
                                        <a href={activeTopic.pyq} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
                                            <Target size={18} /> Mission Challenges
                                        </a>
                                    </div>
                                    <button onClick={() => toggleBookmark(activeTopic.name)} 
                                        className={`px-8 py-4 rounded-2xl font-black text-sm border-2 transition-all flex items-center gap-3 ${bookmarks.includes(activeTopic.name) ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-transparent border-white/5 text-slate-500 hover:text-white'}`}>
                                        <Star size={18} fill={bookmarks.includes(activeTopic.name) ? 'currentColor' : 'none'} />
                                        {bookmarks.includes(activeTopic.name) ? 'Archived In Memory' : 'Add to Memory'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TopicNode({ topic, onSelect, onBookmark, isBookmarked, getIcon }) {
    return (
        <motion.div whileHover={{ y: -5 }} className="linear-card group p-10 border-white/5 hover:border-blue-500/30 transition-all relative">
            <div className="flex justify-between items-start mb-8">
                <span className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">{getIcon(topic.subject)}</span>
                <button onClick={() => onBookmark(topic.name)} className={`transition-all ${isBookmarked ? 'text-amber-500 scale-125' : 'text-slate-700 hover:text-white'}`}><Star size={24} fill={isBookmarked ? 'currentColor' : 'none'} /></button>
            </div>
            <h4 className="text-2xl font-black tracking-tight mb-3 group-hover:text-blue-400 transition-colors">{topic.name}</h4>
            <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em] mb-10 italic">{topic.subject} // {topic.chapter}</p>
            <button onClick={() => onSelect(topic)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">Initiate_Sync →</button>
        </motion.div>
    );
}
