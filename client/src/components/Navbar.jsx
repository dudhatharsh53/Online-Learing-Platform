import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../redux/authSlice'
import toast from 'react-hot-toast'
import { FiMenu, FiX, FiBook, FiUser, FiLogOut, FiSettings, FiHome } from 'react-icons/fi'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    const handleLogout = async () => {
        await dispatch(logoutUser())
        toast.success('Logged out successfully')
        navigate('/')
        setMenuOpen(false)
    }

    return (
        <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-sm shadow-emerald-500/5 transition-all">
            <div className="container-lg flex items-center justify-between h-20">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3.5 group">
                    <div className="w-10 h-10 rounded-xl bg-[#00a884] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                        <FiBook className="text-white text-lg" />
                    </div>
                    <span className="text-2xl font-black text-[#111b21] tracking-tighter">Learn<span className="text-[#00a884]">Hub</span></span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Go to Home - Positioned to the left of Courses */}
                    <Link to="/" className="text-[#667781] hover:text-[#00a884] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group">
                        <FiHome className="group-hover:scale-110 transition-transform" /> HOME
                    </Link>

                    <Link to="/courses" className="text-[#667781] hover:text-[#00a884] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group">
                        <FiBook className="group-hover:scale-110 transition-transform" /> Courses
                    </Link>

                    {/* Dashboard link merged with Home */}

                    {isAuthenticated && user?.role === 'admin' && (
                        <Link to="/admin" className="text-[#667781] hover:text-[#00a884] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group">
                            <FiSettings size={12} /> Console
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <div className="flex items-center gap-6 pl-6 border-l border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm font-black text-[#00a884] shadow-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden lg:block whitespace-nowrap">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome</p>
                                    <p className="text-sm font-black text-[#111b21] leading-none">{user?.name?.split(' ')[0]}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all group shadow-sm"
                                title="Logout"
                            >
                                <FiLogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-[#667781] hover:text-[#111b21] text-xs font-black uppercase tracking-widest transition-all px-4 py-2">
                                Log In
                            </Link>
                            <Link to="/register" className="btn-primary py-3 px-7 text-xs font-black uppercase tracking-widest">
                                Get Started Free
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden w-12 h-12 rounded-xl bg-slate-50 text-[#111b21] flex items-center justify-center hover:bg-emerald-50 transition-all border border-slate-100"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-slate-50 px-6 py-8 space-y-6 shadow-2xl animate-slide-up">
                    <div className="flex flex-col gap-1">
                        <Link to="/" className="text-[#111b21] font-black text-lg py-3 hover:text-[#00a884] flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                            <FiHome /> Home Page
                        </Link>
                        <Link to="/courses" className="text-[#111b21] font-black text-lg py-3 hover:text-[#00a884] flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                            <FiBook /> Courses Catalog
                        </Link>
                        {/* Dashboard link merged with Home */}
                        {isAuthenticated && user?.role === 'admin' && (
                            <Link to="/admin" className="text-[#00a884] font-black text-lg py-3 flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                                <FiSettings /> Admin Console
                            </Link>
                        )}
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                        {isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8faf9] border border-slate-100">
                                    <div className="w-12 h-12 rounded-xl bg-[#00a884] flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#111b21]">{user?.name}</p>
                                        <p className="text-xs text-[#667781] font-bold uppercase tracking-widest">{user?.role}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 font-black py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                    <FiLogOut /> Logout Securely
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link to="/login" className="btn-secondary w-full py-4 font-black" onClick={() => setMenuOpen(false)}>Log In</Link>
                                <Link to="/register" className="btn-primary w-full py-4 font-black" onClick={() => setMenuOpen(false)}>Create Free Account</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
