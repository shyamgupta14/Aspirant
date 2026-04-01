import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, User, Lock, ArrowRight, RefreshCw, Command } from 'lucide-react';

export default function AuthGateway() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const success = await login(username, password);
        if (success) navigate('/dashboard');
        else setErrorMsg('Access Denied: Invalid Credentials.');
        setLoading(false);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/send-otp', { email, name });
            setSuccessMsg(`Authorization code dispatched to ${email}`);
            setMode('otp');
            setCountdown(60);
        } catch (err) { setErrorMsg(err.response?.data?.msg || 'Failed to dispatch OTP.'); }
        setLoading(false);
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newInputs = [...otpInputs];
        newInputs[index] = value.slice(-1);
        setOtpInputs(newInputs);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        const fullOtp = otpInputs.join('');
        setLoading(true);
        setErrorMsg('');
        try {
            await api.post('/auth/verify-otp', { email, otp: fullOtp });
            const success = await register(name, email, username, password);
            if (success) navigate('/dashboard');
        } catch (err) { setErrorMsg(err.response?.data?.msg || 'Verification sequence failed.'); }
        setLoading(false);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-[#000000] flex text-white font-['Inter'] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-800/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="noise-bg" />

            {/* Content Section */}
            <div className="flex-1 hidden lg:flex flex-col justify-center px-24 relative z-10 border-r border-white/5">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
                    <div className="flex items-center gap-4 mb-16 opacity-60">
                        <Command size={24} className="text-blue-500" />
                        <span className="font-mono text-sm tracking-[0.4em] uppercase">System_Entry</span>
                    </div>
                    <h1 className="text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                        The Future <br/>Of <span className="text-blue-500 italic">Engineering.</span>
                    </h1>
                    <p className="text-slate-500 text-2xl font-medium max-w-lg leading-relaxed mb-12">
                        A high-performance environment for the next generation of GATE aspirants. 
                    </p>
                    <div className="flex gap-10">
                        {['Fast', 'Secure', 'Collaborative'].map(f => (
                            <div key={f} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {f}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Auth Form Section */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-20">
                <AnimatePresence mode="wait">
                    {mode === 'login' && (
                        <motion.div key="login" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md linear-card p-12 bg-white/[0.02]">
                            <div className="mb-10 text-center">
                                <h2 className="text-4xl font-black tracking-tighter mb-2">Access Portal_</h2>
                                <p className="text-slate-500 font-bold tracking-tight">Enter your credentials to resume.</p>
                            </div>

                            {errorMsg && <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-black text-center">{errorMsg}</motion.div>}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <InputGroup icon={<User size={18} />} label="Operator ID" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" type="text" />
                                <InputGroup icon={<Lock size={18} />} label="Access Key" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />
                                
                                <button type="submit" disabled={loading}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3">
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <>Continue Sequence <ArrowRight size={20} /></>}
                                </button>
                            </form>

                            <p className="mt-10 text-center text-slate-500 font-bold">
                                No profile found? <button onClick={() => setMode('register')} className="text-white hover:text-blue-500 border-b border-white/10">Request Access</button>
                            </p>
                        </motion.div>
                    )}

                    {mode === 'register' && (
                        <motion.div key="register" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md linear-card p-12 bg-white/[0.02]">
                            <h2 className="text-4xl font-black tracking-tighter mb-2">Create Node_</h2>
                            <p className="text-slate-500 mb-8 font-bold">Initialize your student profile on the network.</p>
                            
                            {errorMsg && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-black text-center">{errorMsg}</div>}

                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <InputGroup icon={<User size={18} />} label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Operator Name" type="text" />
                                <InputGroup icon={<Mail size={18} />} label="Email Node" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@address.com" type="email" />
                                <InputGroup icon={<User size={18} />} label="Alias" value={username} onChange={e => setUsername(e.target.value)} placeholder="unique_alias" type="text" />
                                <InputGroup icon={<Lock size={18} />} label="Security Key" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />
                                
                                <button type="submit" disabled={loading}
                                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3">
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <>Verify Identity <ShieldCheck size={20} /></>}
                                </button>
                            </form>
                            <button onClick={() => setMode('login')} className="mt-8 text-center w-full text-slate-500 font-bold hover:text-white transition-colors">← Cancel Sequence</button>
                        </motion.div>
                    )}

                    {mode === 'otp' && (
                        <motion.div key="otp" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-md linear-card p-12 bg-white/[0.02]">
                            <div className="text-center mb-10">
                                <h2 className="text-4xl font-black tracking-tighter mb-2 italic">Verify_</h2>
                                <p className="text-slate-500 font-bold tracking-tight">Code dispatched to <span className="text-white">{email}</span></p>
                            </div>

                            <form onSubmit={handleVerifyAndRegister}>
                                <div className="flex gap-3 justify-center mb-10">
                                    {otpInputs.map((val, idx) => (
                                        <input key={idx} id={`otp-${idx}`} type="text" inputMode="numeric" maxLength={1} value={val}
                                            onChange={e => handleOtpChange(idx, e.target.value)}
                                            className="w-12 h-16 text-center text-3xl font-black rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:bg-white/10 transition-all text-white" />
                                    ))}
                                </div>
                                <button type="submit" disabled={loading || otpInputs.join('').length !== 6}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50">
                                    {loading ? 'Authorizing...' : 'Finalize Encryption'}
                                </button>
                            </form>
                            <div className="mt-8 text-center">
                                <button onClick={() => setCountdown(60)} disabled={countdown > 0} className={`font-black text-sm tracking-widest uppercase transition-colors ${countdown > 0 ? 'text-slate-700' : 'text-blue-500 hover:text-blue-400'}`}>
                                    {countdown > 0 ? `Retry in ${countdown}s` : 'Request New Code'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function InputGroup({ icon, label, ...props }) {
    return (
        <div className="space-y-2 group">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 group-focus-within:text-blue-500 transition-colors">{label}</label>
            <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">{icon}</span>
                <input {...props} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all font-bold text-slate-200" />
            </div>
        </div>
    );
}
