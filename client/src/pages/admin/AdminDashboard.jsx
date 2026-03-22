import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import {
    FiUsers, FiBookOpen, FiActivity, FiTrendingUp,
    FiCreditCard, FiArrowRight, FiExternalLink, FiSearch, FiClock
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [{ data: sData }, { data: aData }] = await Promise.all([
                    axiosInstance.get('/api/admin/stats'),
                    axiosInstance.get('/api/admin/recent-activity')
                ])
                setStats(sData.stats)
                setActivities(aData.activities)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const COLORS = ['#00a884', '#3b82f6', '#f59e0b', '#ef4444']
    const pieData = stats ? [
        { name: 'Active', value: stats.totalUsers },
        { name: 'Students', value: stats.totalUsers },
        { name: 'Courses', value: stats.totalCourses },
        { name: 'Revenue', value: stats.totalPayments || 0 }
    ] : []

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center p-20 animate-pulse bg-slate-50 rounded-[3rem]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#00a884] font-black uppercase tracking-widest text-xs">Securing Admin Access...</p>
            </div>
        </div>
    )

    return (
        <div className="animate-fade-in space-y-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[#00a884] font-black text-[10px] uppercase tracking-widest mb-2 block">Enterprise Management</span>
                    <h1 className="text-4xl font-black text-[#111b21] tracking-tight">System Overview</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-[#111b21]">LIVE MONITORING</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Platform Users', value: stats?.totalUsers, icon: <FiUsers />, color: 'bg-emerald-100 text-[#00a884]', shadow: 'shadow-emerald-500/10' },
                    { label: 'Active Courses', value: stats?.totalCourses, icon: <FiBookOpen />, color: 'bg-blue-100 text-blue-600', shadow: 'shadow-blue-500/10' },
                    { label: 'Total Revenue', value: `₹${stats?.totalPayments || 0}`, icon: <FiCreditCard />, color: 'bg-purple-100 text-purple-600', shadow: 'shadow-purple-500/10' },
                ].map((s, idx) => (
                    <div key={idx} className={`bg-white rounded-[2.5rem] p-10 border border-slate-50 ${s.shadow} shadow-2xl hover:scale-105 transition-all group relative overflow-hidden`}>
                        <div className="flex flex-col">
                            <div className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm`}>
                                {s.icon}
                            </div>
                            <h3 className="text-4xl font-black text-[#111b21] mb-2">{s.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Chart and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Platform Health Chart */}
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-[#111b21]">Platform Health</h2>
                        <FiTrendingUp className="text-[#00a884] text-xl" />
                    </div>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs font-black text-[#111b21] uppercase">Optimal</span>
                            <span className="text-xs text-[#00a884] font-bold">STABLE</span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        {pieData.map((d, i) => (
                            <div key={d.name} className="flex items-center justify-between">
                                <span className="flex items-center gap-3 text-sm font-bold text-[#111b21]">
                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                    {d.name}
                                </span>
                                <span className="text-sm font-black text-[#667781]">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-[#111b21] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a884]/5 rounded-full blur-[80px]" />
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white">Live Activity Stream</h2>
                            <p className="text-[#8696a0] text-xs font-bold uppercase tracking-widest mt-1">Real-time engagement</p>
                        </div>
                        <button className="text-[#00a884] p-3 rounded-2xl bg-[#00a884]/10 hover:bg-[#00a884] hover:text-white transition-all">
                            <FiActivity size={20} />
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {activities.map((a, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-[#00a884]/20 flex items-center justify-center text-[#00a884] font-black flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {a.user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white mb-1">
                                        {a.user?.name}
                                        <span className="text-[#8696a0] font-medium mx-2">—</span>
                                        <span className="text-emerald-400">{a.action}</span>
                                    </p>
                                    <p className="text-[10px] text-[#8696a0] uppercase tracking-widest font-black flex items-center gap-2">
                                        <FiClock size={10} /> {new Date(a.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <button className="p-2 text-[#8696a0] hover:text-[#00a884] transition-colors">
                                    <FiExternalLink />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Analytics link removed */}
                </div>
            </div>

            {/* Bottom Section: Quick Links */}
            <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-100">
                {[
                    { to: '/admin/courses', label: 'Manage Curriculum', icon: <FiBookOpen /> },
                    { to: '/admin/students', label: 'Student Directory', icon: <FiUsers /> },
                    { to: '/admin/payments', label: 'Financial Reports', icon: <FiCreditCard /> },
                ].map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-emerald-500/10 hover:border-[#00a884]/20 font-black text-[#111b21] transition-all flex items-center gap-4 group"
                    >
                        <span className="text-emerald-600 transition-transform group-hover:scale-125">{link.icon}</span>
                        {link.label}
                        <FiArrowRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
