import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Learning Lab', path: '/learn', icon: <BookOpen size={20} /> },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ name: 'Admin Control', path: '/admin', icon: <Settings size={20} /> });
    }

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 300 }}
            className="h-screen sticky top-0 bg-[#0c0c0c] border-r border-white/5 flex flex-col z-[100] transition-all group"
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all z-[110] opacity-0 group-hover:opacity-100"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} /> }
            </button>

            {/* Logo Section */}
            <div className="p-8 pb-12 flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 min-w-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-500 border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    A
                </div>
                {!isCollapsed && <span className="font-extrabold text-2xl tracking-tighter animate-in fade-in slide-in-from-left-2 duration-300">Aspirant_</span>}
            </div>

            {/* User Profile Hook */}
            <div className={`mx-4 mb-10 p-3 rounded-2xl border border-white/5 flex items-center gap-3 transition-all ${isCollapsed ? 'justify-center border-none p-0' : 'bg-white/5'}`}>
                <div className="w-10 h-10 min-w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg">
                    {user?.name?.[0] || 'A'}
                </div>
                {!isCollapsed && (
                    <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                        <p className="font-bold text-sm truncate text-white">{user?.name || 'Aspirant'}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{user?.role || 'student'}</p>
                    </div>
                )}
            </div>

            {/* Navigation Grid */}
            <nav className="px-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative flex items-center gap-5 px-5 py-4 rounded-2xl transition-all group/nav
                                ${isActive 
                                    ? 'text-white' 
                                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-bg"
                                    className="absolute inset-0 bg-blue-500 border border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-2xl z-0"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className={`relative z-10 transition-transform duration-300 group-hover/nav:scale-110`}>{item.icon}</span>
                            {!isCollapsed && <span className="relative z-10 font-bold tracking-tight animate-in fade-in duration-200">{item.name}</span>}
                            {isCollapsed && isActive && <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Terminal */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-5 px-5 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold group/logout"
                >
                    <LogOut size={20} className="group-hover/logout:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span className="animate-in fade-in duration-300">Terminate Lab_</span>}
                </button>
            </div>
        </motion.aside>
    );
}
