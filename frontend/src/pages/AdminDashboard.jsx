import { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Users, Database, Save, Trash2, Cpu, ChevronRight, Activity, Plus, Megaphone, Edit3, X, Award, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
    const [subjects, setSubjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [tab, setTab] = useState('content'); // 'content' | 'students' | 'broadcast'
    const [activeSubject, setActiveSubject] = useState(null);
    
    // Broadcast State
    const [announcement, setAnnouncement] = useState('');
    const [lastAnn, setLastAnn] = useState(null);

    // Edit User Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', username: '', role: '', password: '' });

    useEffect(() => {
        fetchData();
        fetchAnn();
    }, []);

    const fetchData = async () => {
        try {
            const subRes = await api.get('/subjects');
            setSubjects(subRes.data);
            if (subRes.data.length > 0 && !activeSubject) setActiveSubject(subRes.data[0]);

            const userRes = await api.get('/auth/users');
            setUsers(userRes.data);
        } catch (err) { console.error(err); }
    };

    const fetchAnn = async () => {
        try {
            const res = await api.get('/announcements');
            setLastAnn(res.data);
        } catch (err) { console.error(err); }
    };

    // ── CONTENT CRUD ──
    const addSubject = () => {
        const name = prompt("Enter Subject Name:");
        if (!name) return;
        const newSub = { name, chapters: [] };
        setSubjects([...subjects, newSub]);
        setActiveSubject(newSub);
    };

    const deleteSubject = (idx) => {
        if (!window.confirm("CRITICAL: Terminate subject node and all nested data?")) return;
        const newSubs = [...subjects];
        newSubs.splice(idx, 1);
        setSubjects(newSubs);
        if (activeSubject?.name === subjects[idx].name) setActiveSubject(newSubs[0] || null);
    };

    const addChapter = () => {
        if (!activeSubject) return;
        const name = prompt("Enter Chapter Name:");
        if (!name) return;
        const sIdx = subjects.findIndex(s => s.name === activeSubject.name);
        const newSubs = [...subjects];
        newSubs[sIdx].chapters.push({ name, topics: [] });
        setSubjects(newSubs);
    };

    const deleteChapter = (cIdx) => {
        const sIdx = subjects.findIndex(s => s.name === activeSubject.name);
        const newSubs = [...subjects];
        newSubs[sIdx].chapters.splice(cIdx, 1);
        setSubjects(newSubs);
    };

    const addTopic = (cIdx) => {
        const sIdx = subjects.findIndex(s => s.name === activeSubject.name);
        const newTopic = { id: Date.now() % 1000, name: 'New Topic', vid: '', notes: '', pyq: '' };
        const newSubs = [...subjects];
        newSubs[sIdx].chapters[cIdx].topics.push(newTopic);
        setSubjects(newSubs);
    };

    const deleteTopic = (cIdx, tIdx) => {
        const sIdx = subjects.findIndex(s => s.name === activeSubject.name);
        const newSubs = [...subjects];
        newSubs[sIdx].chapters[cIdx].topics.splice(tIdx, 1);
        setSubjects(newSubs);
    };

    const updateTopic = (sName, cIdx, tIdx, field, val) => {
        const sIdx = subjects.findIndex(s => s.name === sName);
        const newSubs = [...subjects];
        newSubs[sIdx].chapters[cIdx].topics[tIdx][field] = val;
        setSubjects(newSubs);
    };

    const saveTree = async () => {
        try {
            await api.post('/subjects/saveTree', { data: subjects });
            alert("SYSTEM: DATA MAP SYNCHRONIZED SUCCESSFULLY.");
        } catch (err) { console.error(err); }
    };

    // ── ANNOUNCEMENTS ──
    const postAnnouncement = async () => {
        if (!announcement) return;
        try {
            await api.post('/announcements', { message: announcement });
            alert("BROADCAST COMMITTED.");
            setAnnouncement('');
            fetchAnn();
        } catch (err) { console.error(err); }
    };

    // ── USER MANAGEMENT ──
    const openUserEdit = (u) => {
        setEditingUser(u);
        setEditFormData({ name: u.name, username: u.username, role: u.role, password: '' });
    };

    const handleUserUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/update-user', { id: editingUser._id, ...editFormData });
            alert("USER NODE RECONFIGURED.");
            setEditingUser(null);
            fetchData();
        } catch (err) { alert("ERROR RECONFIGURING NODE."); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("CRITICAL: Permanent termination of operative profile?")) return;
        try {
            await api.delete(`/auth/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-12 text-white min-h-screen bg-[#000]/40 backdrop-blur-3xl animate-in fade-in duration-700">
            {/* God-Mode Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16 px-4">
                <div>
                    <h1 className="text-7xl font-black tracking-tighter leading-[0.9] italic flex items-center gap-6">
                        GodMode_ <ShieldAlert className="text-red-600 animate-pulse" size={60} />
                    </h1>
                    <div className="flex gap-8 mt-6">
                        <StatItem label="Operatives" val={users.length} icon={<Users size={14} />} />
                        <StatItem label="Data Nodes" val={subjects.length} icon={<Database size={14} />} />
                        <StatItem label="Uptime" val="100%" icon={<Activity size={14} />} />
                    </div>
                </div>
                <div className="grid grid-cols-3 bg-white/[0.03] p-1.5 rounded-3xl border border-white/5 gap-2 backdrop-blur-3xl">
                    <TabBtn label="Content" active={tab === 'content'} onClick={() => setTab('content')} icon={<Database size={20} />} />
                    <TabBtn label="Ops Ledger" active={tab === 'students'} onClick={() => setTab('students')} icon={<Users size={20} />} />
                    <TabBtn label="Broadcast" active={tab === 'broadcast'} onClick={() => setTab('broadcast')} icon={<Megaphone size={20} />} />
                </div>
            </header>

            <AnimatePresence mode="wait">
                {/* ── CONTENT CRUD ── */}
                {tab === 'content' && (
                    <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Subject Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="flex justify-between items-center mb-10 px-4">
                                <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.4em] italic">Subject_Nodes</p>
                                <button onClick={addSubject} className="text-blue-500 hover:scale-125 transition-transform"><Plus size={20} /></button>
                            </div>
                            {subjects.map((s, idx) => (
                                <div key={idx} className="group flex items-center gap-2">
                                    <button onClick={() => setActiveSubject(s)}
                                        className={`flex-1 text-left p-6 rounded-2xl transition-all font-bold border-2 ${activeSubject?.name === s.name ? 'bg-white/5 border-blue-500 text-blue-400' : 'bg-transparent border-transparent text-slate-600 hover:text-slate-300'}`}>
                                        {s.name}
                                    </button>
                                    <button onClick={() => deleteSubject(idx)} className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-600 p-2 transition-all"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button onClick={saveTree} className="w-full bg-blue-600 text-white rounded-2xl py-6 font-black text-xs uppercase tracking-widest mt-12 hover:bg-blue-500 shadow-2xl active:scale-95 flex items-center justify-center gap-4 group transition-all">
                                <Save size={20} className="group-hover:rotate-12" /> Sync Entire Data Map
                            </button>
                        </div>

                        {/* Editor Hub */}
                        <div className="lg:col-span-3 space-y-16">
                            {activeSubject && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex justify-between items-end mb-20 border-b border-white/5 pb-10">
                                        <div>
                                            <p className="text-blue-500 font-mono text-[10px] font-bold tracking-widest italic mb-2 uppercase">Subject_Node_{activeSubject.name}</p>
                                            <h2 className="text-5xl font-black italic tracking-tighter">{activeSubject.name}.</h2>
                                        </div>
                                        <button onClick={addChapter} className="cmd-btn cmd-btn-primary py-3 px-8 text-sm flex items-center gap-3"><Plus size={18}/> New Chapter</button>
                                    </div>

                                    {activeSubject.chapters.map((ch, cIdx) => (
                                        <div key={cIdx} className="linear-card p-12 bg-white/[0.01] relative border-white/5 group">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 group-focus-within:bg-white" />
                                            <div className="flex justify-between items-center mb-12">
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-300">{ch.name}</h3>
                                                <div className="flex gap-4">
                                                    <button onClick={() => addTopic(cIdx)} className="text-blue-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors group/add">
                                                        <Plus size={14} className="group-hover/add:rotate-90 transition-transform" /> Add Topic
                                                    </button>
                                                    <button onClick={() => deleteChapter(cIdx)} className="text-red-900 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-10">
                                                {ch.topics.map((topic, tIdx) => (
                                                    <div key={tIdx} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/10 transition-all space-y-6 relative group/topic">
                                                        <button onClick={() => deleteTopic(cIdx, tIdx)} className="absolute top-8 right-8 opacity-0 group-hover/topic:opacity-100 text-red-900 transition-all"><Trash2 size={16}/></button>
                                                        <div className="flex gap-6 items-center">
                                                            <span className="font-mono text-[10px] text-blue-500 opacity-60">TOPIC_{topic.id}</span>
                                                            <input className="bg-transparent border-none focus:ring-0 outline-none font-bold text-xl italic w-full text-white"
                                                                value={topic.name} onChange={e => updateTopic(activeSubject.name, cIdx, tIdx, 'name', e.target.value)} />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <EditInput label="Video Node" val={topic.vid} onChange={e => updateTopic(activeSubject.name, cIdx, tIdx, 'vid', e.target.value)} />
                                                            <EditInput label="Notes Node" val={topic.notes} onChange={e => updateTopic(activeSubject.name, cIdx, tIdx, 'notes', e.target.value)} />
                                                            <EditInput label="Check Node" val={topic.pyq} onChange={e => updateTopic(activeSubject.name, cIdx, tIdx, 'pyq', e.target.value)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── BROADCAST STATION ── */}
                {tab === 'broadcast' && (
                    <motion.div key="broadcast" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-12">
                        <section className="linear-card p-12 space-y-8 bg-blue-600/[0.02]">
                             <h2 className="text-4xl font-black italic tracking-tighter uppercase px-6 border-l-8 border-blue-600">Broadcast Terminal.</h2>
                             <p className="text-slate-500 font-bold mb-8">This signal will override all student dashboards instantly.</p>
                             <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type announcement message here..."
                                 className="w-full h-48 bg-black border border-white/10 rounded-3xl p-8 focus:border-blue-500 outline-none font-bold text-xl placeholder:text-slate-900"></textarea>
                             <button onClick={postAnnouncement} className="cmd-btn cmd-btn-primary w-full py-6 text-xl tracking-tighter flex items-center gap-3">
                                <Megaphone size={24}/> DISPATCH GLOBAL SIGNAL
                             </button>
                        </section>

                        <section className="linear-card p-10 space-y-6">
                             <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.4em]">Current_System_Status</p>
                             <div className="p-6 rounded-2xl bg-white/5 border border-white/10 italic font-bold">
                                {lastAnn ? (
                                    <>
                                        <p className="text-blue-500 mb-2 font-mono uppercase text-xs">Active Since: {new Date(lastAnn.date).toLocaleString()}</p>
                                        <p className="text-2xl tracking-tight">"{lastAnn.message}"</p>
                                    </>
                                ) : "NO ACTIVE BROADCAST SIGNAL."}
                             </div>
                        </section>
                    </motion.div>
                )}

                {/* ── OPERATIVE LEDGER ── */}
                {tab === 'students' && (
                    <motion.div key="students" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="linear-card p-12 bg-white/[0.01] border-white/5">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase px-4 border-l-8 border-red-600 mb-16">Active_Operatives.</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5">
                                    <tr className="text-[10px] uppercase font-black text-slate-600 tracking-[0.4em]">
                                        <th className="p-6">Node ID</th>
                                        <th className="p-6">Operative Name</th>
                                        <th className="p-6">Signal Path</th>
                                        <th className="p-6">Alias</th>
                                        <th className="p-6 text-right">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold text-slate-300">
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6 text-[10px] font-mono opacity-30">{u._id}</td>
                                            <td className="p-6 text-2xl tracking-tighter italic">{u.name}</td>
                                            <td className="p-6 text-sm text-slate-500 font-medium">{u.email}</td>
                                            <td className="p-6"><span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-lg text-xs italic">@{u.username}</span></td>
                                            <td className="p-6 text-right flex justify-end gap-3">
                                                <button onClick={() => openUserEdit(u)} className="p-3 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18}/></button>
                                                <button onClick={() => deleteUser(u._id)} className="p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/95 backdrop-blur-2xl">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg linear-card p-12 bg-white/5 space-y-8">
                             <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-black italic tracking-tighter">Reconfigure_Node.</h3>
                                <button onClick={() => setEditingUser(null)}><X/></button>
                             </div>
                             <form onSubmit={handleUserUpdate} className="space-y-6">
                                 <div>
                                    <label className="text-[10px] uppercase font-black text-slate-600 block mb-2">FullName_Tag</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={editFormData.name} onChange={e=>setEditFormData({...editFormData, name: e.target.value})} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] uppercase font-black text-slate-600 block mb-2">Alias_Node</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={editFormData.username} onChange={e=>setEditFormData({...editFormData, username: e.target.value})} />
                                 </div>
                                 <div>
                                    <label className="text-[10px] uppercase font-black text-slate-600 block mb-2">Role_Access</label>
                                    <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={editFormData.role} onChange={e=>setEditFormData({...editFormData, role: e.target.value})}>
                                        <option value="student" className="bg-black">Student</option>
                                        <option value="admin" className="bg-black">Admin</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="text-[10px] uppercase font-black text-slate-600 block mb-2">Reset_Security_Key (Leave blank to keep current)</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl font-bold" value={editFormData.password} onChange={e=>setEditFormData({...editFormData, password: e.target.value})} />
                                 </div>
                                 <button type="submit" className="cmd-btn cmd-btn-primary w-full py-5 text-xl tracking-tight flex items-center justify-center gap-3"><Award size={20}/> COMMIT RECONFIGURATION</button>
                             </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatItem({ label, val, icon }) {
    return (
        <div className="flex items-center gap-3 p-3 px-5 rounded-2xl bg-white/[0.03] border border-white/5">
             <span className="text-blue-500 opacity-60">{icon}</span>
             <div>
                <p className="text-[8px] uppercase font-black text-slate-600 tracking-widest">{label}</p>
                <p className="text-lg font-black tracking-tighter">{val}</p>
             </div>
        </div>
    );
}

function TabBtn({ label, active, onClick, icon }) {
    return (
        <button onClick={onClick} className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${active ? 'bg-white text-black shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}>
             {icon} {label}
        </button>
    );
}

function EditInput({ label, val, onChange }) {
    return (
        <div>
            <label className="text-[10px] uppercase font-black text-slate-600 mb-2 block italic tracking-widest">{label}</label>
            <input type="text" className="w-full bg-[#000] border border-white/5 p-4 rounded-2xl font-mono text-xs focus:border-blue-500 outline-none transition-all text-slate-400 focus:text-white"
                value={val} onChange={onChange} />
        </div>
    );
}
