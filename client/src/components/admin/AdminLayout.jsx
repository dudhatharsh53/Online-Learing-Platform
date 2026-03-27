import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    FiGrid,
    FiBookOpen,
    FiUsers,
    FiPieChart,
    FiLogOut,
    FiMessageSquare,
    FiDollarSign,
    FiHome
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/authSlice';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <FiGrid /> },
        { name: 'Courses', path: '/admin/courses', icon: <FiBookOpen /> },
        { name: 'Faculty', path: '/admin/faculty', icon: <FiUsers /> },
        { name: 'Students', path: '/admin/students', icon: <FiUsers /> },
        { name: 'Payments', path: '/admin/payments', icon: <FiDollarSign /> },
    ];

    return (
        <div className="flex h-screen bg-[#f8faf9] text-[#111b21] font-sans antialiased overflow-hidden">
            {/* Sidebar - WhatsApp Premium Style */}
            <aside className="w-80 bg-[#064e3b] text-emerald-100 flex flex-shrink-0 flex-col border-r border-[#004d40] shadow-2xl relative z-30">
                {/* Brand */}
                <div className="p-8 border-b border-[#222d34] flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-12 h-12 rounded-[1.25rem] bg-[#00a884] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transform group-hover:rotate-12 transition-transform">
                        <FiMessageSquare size={24} />
                    </div>
                    <div>
                        <h1 className="text-white font-black text-xl tracking-tight leading-none uppercase">AdminHub</h1>
                        <p className="text-[10px] text-[#00a884] font-black tracking-[0.2em] mt-1">THE ACADEMY CMS</p>
                    </div>
                </div>

                {/* Search Sidebar Mock (WhatsApp Style) */}
                <div className="px-6 py-4">
                    <div className="bg-[#004d40] rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm text-emerald-200">
                        <FiGrid size={16} />
                        <span className="font-medium text-emerald-100">Command Center</span>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-black text-[#54656f] uppercase tracking-widest px-4 mb-4">Core Management</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-[#00a884] text-white shadow-xl shadow-emerald-500/20'
                                    : 'hover:bg-[#004d40] hover:text-emerald-100'
                                }`
                            }
                        >
                            <span className={`text-xl transition-transform group-hover:scale-120`}>{item.icon}</span>
                            <span className="font-bold tracking-tight">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / Profile */}
                <div className="p-6 border-t border-[#004d40] bg-[#004d40]/30 backdrop-blur-md">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#004d40] border border-emerald-800/50 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#00a884] flex items-center justify-center text-white font-black text-lg shadow-md uppercase">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-sm font-black truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-emerald-400 text-[10px] font-bold truncate uppercase">{user?.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#004d40] text-emerald-100 hover:text-white transition-all text-xs font-bold border border-emerald-800/30">
                            <FiHome /> Home
                        </button>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold">
                            <FiLogOut /> Exit
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#f8faf9] relative z-10 overflow-hidden">
                {/* Subtle Glow Effect */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#00a884]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />

                {/* Header */}
                <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 flex-shrink-0">
                    <h2 className="text-xl font-black text-[#111b21] tracking-tight">Executive Control Panel</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-[#667781] uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                {/* Content Scroller */}
                <section className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;
