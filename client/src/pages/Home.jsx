import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axiosInstance from '../api/axiosInstance'
import { fetchAllCourses } from '../redux/courseSlice'
import CourseCard from '../components/CourseCard'
import { FiArrowRight, FiBook, FiUsers, FiAward, FiPlay, FiCheckCircle, FiShield, FiTrendingUp, FiActivity } from 'react-icons/fi'

const STATS = [
    { icon: FiBook, value: '50+', label: 'Premium Courses', color: 'bg-emerald-100 text-[#00a884]' },
    { icon: FiUsers, value: '2K+', label: 'Active Students', color: 'bg-blue-100 text-blue-600' },
    { icon: FiAward, value: '50+', label: 'Certified Mentors', color: 'bg-amber-100 text-amber-600' },
    { icon: FiPlay, value: '1K+', label: 'HD Lectures', color: 'bg-purple-100 text-purple-600' },
]

export default function Home() {
    const dispatch = useDispatch()
    const { courses, loading: coursesLoading } = useSelector((state) => state.courses)
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    const [progressList, setProgressList] = useState([])
    const [loadingProgress, setLoadingProgress] = useState(true)

    useEffect(() => {
        dispatch(fetchAllCourses({}))
    }, [dispatch])

    useEffect(() => {
        const fetchProgress = async () => {
            if (!isAuthenticated || user?.role === 'admin') {
                setLoadingProgress(false)
                return
            }
            try {
                const { data } = await axiosInstance.get('/api/progress/my')
                setProgressList(data.progressList || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoadingProgress(false)
            }
        }
        fetchProgress()
    }, [isAuthenticated, user])

    // Dashboard calculations
    const completedCount = progressList.filter((p) => p.progressPercent === 100).length
    const inProgressCount = progressList.filter((p) => p.progressPercent > 0 && p.progressPercent < 100).length
    const totalProgress = progressList.reduce((acc, p) => acc + (p.progressPercent || 0), 0)
    const averageProgress = progressList.length > 0 ? Math.round(totalProgress / progressList.length) : 0

    const featuredCourses = courses.slice(0, 3)

    return (
        <div className="bg-white min-h-screen">
            {/* ── Hero (Unconditional) ── */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50/50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#00a884]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="container-lg relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-emerald-100/80 px-4 py-1.5 rounded-full text-[#00a884] text-xs font-black uppercase tracking-widest mb-8 animate-slide-down">
                                <FiAward /> Trusted by 10,000+ Students
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-[#111b21] leading-[1.1] mb-8 tracking-tighter">
                                Master New <br />
                                <span className="text-[#00a884]">Skills</span> Today.
                            </h1>
                            <p className="text-[#667781] text-lg lg:text-xl font-medium mb-12 max-w-xl leading-relaxed">
                                Access world-class education from anywhere. Learn at your own pace with our curated courses and expert mentorship.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link to="/courses" className="btn-primary py-4 px-10 text-lg shadow-emerald-500/30">
                                    Start Learning Now <FiArrowRight />
                                </Link>
                                {!isAuthenticated && (
                                    <Link to="/register" className="btn-secondary py-4 px-10 text-lg border-slate-200">
                                        Join for Free
                                    </Link>
                                )}
                            </div>
                            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <span className="text-sm font-bold text-slate-400 flex items-center gap-2"><FiShield /> Data Secured</span>
                                <span className="text-sm font-bold text-slate-400 flex items-center gap-2"><FiCheckCircle /> Lifetime Access</span>
                                <span className="text-sm font-bold text-slate-400 flex items-center gap-2"><FiTrendingUp /> Expert Support</span>
                            </div>
                        </div>

                        {/* Hero Image Mockup Area */}
                        <div className="flex-1 w-full max-w-2xl animate-fade-in delay-200">
                            <div className="relative p-4 bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white/50 shadow-2xl">
                                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-400 to-[#00a884] rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                                    <FiPlay size={80} className="text-white opacity-40 animate-pulse-slow" />
                                </div>
                                {/* Floating Badges */}
                                <div className="absolute -top-6 -right-6 bg-white p-5 rounded-3xl shadow-xl animate-bounce-slow">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Release</p>
                                    <p className="text-sm font-black text-[#111b21]">React Mastery 2026</p>
                                </div>
                                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-[#00a884] font-black">95%</div>
                                    <div>
                                        <p className="text-sm font-black text-[#111b21]">Job Success</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Average Graduate Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {isAuthenticated && user?.role === 'student' ? (
                // ── Dashboard Layout ──
                <div className="bg-[#f8faf9] py-10 md:py-20 border-t border-slate-100">
                    <div className="container-lg">
                        {/* User Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-slide-down">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-3xl bg-[#00a884] shadow-xl shadow-emerald-500/20 flex items-center justify-center text-white text-3xl font-black">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-black text-[#111b21] tracking-tight">
                                            Hello, <span className="text-[#00a884]">{user?.name?.split(' ')[0]}</span> 👋
                                        </h1>
                                        <p className="text-[#667781] font-bold text-sm uppercase tracking-widest mt-1">Student Dashboard</p>
                                    </div>
                                </div>
                                <p className="text-[#8696a0] max-w-lg leading-relaxed font-medium">
                                    Welcome back to your learning hub! Here are your enrolled courses. Keep up the great work!
                                </p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                            {[
                                { icon: <FiBook />, label: 'Enrolled Courses', value: progressList.length, color: 'bg-blue-50 text-blue-600' },
                                { icon: <FiTrendingUp />, label: 'In Progress', value: inProgressCount, color: 'bg-amber-50 text-amber-600' },
                                { icon: <FiAward />, label: 'Completed', value: completedCount, color: 'bg-emerald-50 text-emerald-600' },
                                { icon: <FiActivity />, label: 'Total Mastery', value: `${averageProgress}%`, color: 'bg-purple-50 text-purple-600' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-emerald-500/10 transition-all hover:scale-105">
                                    <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-2xl mb-6 shadow-sm`}>
                                        {stat.icon}
                                    </div>
                                    <h3 className="text-4xl font-black text-[#111b21] mb-2">{stat.value}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Areas */}
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Courses List */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-[#111b21] flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-[#00a884] rounded-full" /> My Courses
                                    </h2>
                                </div>

                                {loadingProgress ? (
                                    <div className="space-y-6">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="skeleton h-32 w-full" />
                                        ))}
                                    </div>
                                ) : progressList.length === 0 ? (
                                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-xl shadow-slate-100">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                            <FiBook className="text-4xl text-slate-200" />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#111b21] mb-4">No Courses Enrolled</h3>
                                        <p className="text-[#667781] max-w-sm mx-auto mb-10 font-medium">
                                            You haven't enrolled in any courses yet. Purchase a course from our catalog to see it here!
                                        </p>
                                        <Link to="/courses" className="btn-primary inline-flex">
                                            Browse Our Catalog <FiArrowRight />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {progressList.map((prog) => (
                                            <div key={prog.course?._id} className="bg-white rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center gap-8 border border-slate-50 shadow-lg shadow-slate-100 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group">
                                                <div className="w-full sm:w-32 h-20 rounded-2xl bg-neutral-100 overflow-hidden relative shadow-inner">
                                                    {prog.course?.thumbnail ? (
                                                        <img src={prog.course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-[#00a884]">
                                                            <FiPlay className="text-white text-2xl" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#00a884] uppercase tracking-widest mb-1">{prog.course?.category || 'Professional Course'}</p>
                                                            <h3 className="text-xl font-black text-[#111b21] truncate">{prog.course?.title}</h3>
                                                        </div>
                                                        <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${prog.progressPercent === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {prog.progressPercent === 100 ? 'Mastered' : `${prog.progressPercent}% Done`}
                                                        </div>
                                                    </div>

                                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-6 mb-2 shadow-inner">
                                                        <div className={`h-full transition-all duration-1000 ${prog.progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#00a884]'}`} style={{ width: `${prog.progressPercent}%` || 0 }} />
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0">
                                                    <Link
                                                        to={prog.lastWatched ? `/courses/${prog.course?._id}/lecture/${prog.lastWatched._id || prog.lastWatched}` : `/courses/${prog.course?._id}`}
                                                        className={`p-4 rounded-2xl flex items-center gap-3 font-bold transition-all shadow-xl ${prog.progressPercent === 100 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-[#111b21] text-white hover:bg-[#202c33] shadow-slate-900/10'}`}
                                                    >
                                                        {prog.progressPercent === 100 ? 'Review Lectures' : 'Resume Lesson'} <FiPlay size={16} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Profile / Sidebar Info */}
                            <div className="w-full lg:w-80 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100 text-center">
                                    <h3 className="font-black text-[#111b21] mb-2">{user?.name}</h3>
                                    <p className="text-xs text-[#8696a0] font-bold uppercase tracking-widest mb-8">{user?.email}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#f8faf9] p-4 rounded-2xl">
                                            <p className="text-xl font-black text-[#111b21]">{progressList.length}</p>
                                            <p className="text-[10px] text-[#8696a0] font-bold uppercase">Enrolled</p>
                                        </div>
                                        <div className="bg-[#f8faf9] p-4 rounded-2xl">
                                            <p className="text-xl font-black text-[#111b21]">{completedCount}</p>
                                            <p className="text-[10px] text-[#8696a0] font-bold uppercase">Finished</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#00A884] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-bl-full shadow-white/20 shadow-2xl" />
                                    <h3 className="text-xl font-black mb-4 relative z-10">Helpline Center</h3>
                                    <p className="text-sm text-emerald-50 leading-relaxed mb-6 font-medium">Need help with your course? Reach out to our technical team.</p>
                                    <p className="text-white font-black mb-1">+91 6353141028</p>
                                    <p className="text-xs font-bold text-white/80">learnhub@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // ── Public Landing Layout ──
                <>
                    {/* ── Stats ── */}
                    <section className="py-20 -mt-16 relative z-20">
                        <div className="container-lg">
                            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 grid grid-cols-2 lg:grid-cols-4 gap-12 border border-slate-50">
                                {STATS.map(({ icon: Icon, value, label, color }) => (
                                    <div key={label} className="text-center group">
                                        <div className={`w-16 h-16 rounded-3xl ${color} flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 shadow-lg`}>
                                            <Icon size={28} />
                                        </div>
                                        <div className="text-4xl font-black text-[#111b21] mb-2">{value}</div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Featured Courses ── */}
                    <section className="py-32">
                        <div className="container-lg">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                                <div>
                                    <span className="text-[#00a884] font-black uppercase tracking-widest text-xs mb-3 block">Curated Selection</span>
                                    <h2 className="text-4xl md:text-5xl font-black text-[#111b21]">Featured Learning <br /> <span className="text-[#00a884]">Pathways</span></h2>
                                </div>
                                <Link to="/courses" className="bg-[#f0f2f5] text-[#111b21] hover:bg-emerald-50 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all">
                                    Explore Archive <FiArrowRight />
                                </Link>
                            </div>

                            {coursesLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-[420px]" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {featuredCourses.map(course => (
                                        <CourseCard key={course._id} course={course} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── About Section Short ── */}
                    <section className="py-32 bg-[#004d40] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00a884]/5 -skew-x-12 transform translate-x-1/2" />
                        <div className="container-lg relative z-10">
                            <div className="flex flex-col lg:flex-row items-center gap-20">
                                <div className="flex-1">
                                    <span className="text-[#00a884] font-black text-xs uppercase tracking-[0.3em] mb-6 block">Why LearnHub</span>
                                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Beyond Online <br /> Education.</h2>
                                    <div className="space-y-6">
                                        <p className="text-[#8696a0] text-lg leading-relaxed">
                                            Our platform isn't just about watching videos. It's about a complete learning cycle—from initial curiosity to professional mastery.
                                        </p>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {['Interactive Labs', 'Expert mentorship', 'Career guidance', 'Global community'].map(item => (
                                                <li key={item} className="flex items-center gap-3 text-sm font-bold text-[#d1d7db]">
                                                    <div className="w-6 h-6 rounded-full bg-[#00a884]/20 flex items-center justify-center text-[#00a884]">
                                                        <FiCheckCircle size={14} />
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-12">
                                        <Link to="/about" className="text-[#00a884] font-black text-sm uppercase tracking-widest border-b-2 border-[#00a884]/30 hover:border-[#00a884] pb-1 transition-all">
                                            Discover Our Story →
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/5">
                                            <h3 className="text-3xl font-black mb-2">99%</h3>
                                            <p className="text-xs text-[#8696a0] font-bold uppercase tracking-widest">Satisfaction</p>
                                        </div>
                                        <div className="bg-[#00a884] p-10 rounded-[2.5rem] mt-12">
                                            <h3 className="text-3xl font-black mb-2">24/7</h3>
                                            <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Support</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    )
}
