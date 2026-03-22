import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllCourses } from '../redux/courseSlice'
import { fetchFaculties } from '../redux/facultySlice'
import CourseCard from '../components/CourseCard'
import { FiSearch, FiFilter, FiBook, FiX, FiChevronDown, FiMenu } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const CATEGORIES = ['All', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'DevOps', 'Design', 'Business', 'Marketing', 'Other']
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const PURCHASE_STATUS = ['All', 'Purchased', 'Not Purchased']
const PRICE_RANGES = [
    { label: 'All', value: 'All' },
    { label: 'Free', value: 'Free' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Under ₹500', value: '0-500' },
    { label: '₹500 - ₹1000', value: '500-1000' },
    { label: 'Above ₹1000', value: '1000+' }
]

export default function CourseList() {
    const dispatch = useDispatch()
    const { courses, loading } = useSelector((state) => state.courses)
    const { faculties } = useSelector((state) => state.faculty)
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [faculty, setFaculty] = useState('All')
    const [level, setLevel] = useState('All')
    const [purchaseStatus, setPurchaseStatus] = useState('All')
    const [priceRange, setPriceRange] = useState('All')
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchAllCourses())
        dispatch(fetchFaculties())
    }, [dispatch])

    // Client-side filtering as the backend doesn't support all these yet
    // but the backend does support category and search
    const filteredCourses = courses.filter(course => {
        const matchesSearch = !search || course.title.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === 'All' || course.category === category
        const matchesFaculty = faculty === 'All' || course.faculty?.name === faculty
        const matchesLevel = level === 'All' || course.level === level

        // Purchase status logic
        let matchesPurchase = true
        if (isAuthenticated && user) {
            const isEnrolled = user.enrolledCourses?.some(c => (c._id || c) === course._id)
            if (purchaseStatus === 'Purchased') matchesPurchase = isEnrolled
            if (purchaseStatus === 'Not Purchased') matchesPurchase = !isEnrolled
        }

        // Price range logic
        let matchesPrice = true
        if (priceRange === 'Free') matchesPrice = course.price === 0
        else if (priceRange === 'Paid') matchesPrice = course.price > 0
        else if (priceRange === '0-500') matchesPrice = course.price > 0 && course.price <= 500
        else if (priceRange === '500-1000') matchesPrice = course.price > 500 && course.price <= 1000
        else if (priceRange === '1000+') matchesPrice = course.price > 1000

        return matchesSearch && matchesCategory && matchesFaculty && matchesLevel && matchesPurchase && matchesPrice
    })

    const FilterDropdown = ({ label, options, value, onChange, icon }) => (
        <div className="relative group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer pr-10 shadow-sm"
                >
                    {options.map(opt => (
                        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                            {typeof opt === 'string' ? opt : opt.label}
                        </option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#00a884] transition-colors" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f8faf9] py-12">
            <div className="container-lg">
                {/* Hero Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-slide-down">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-[#00a884] text-xs font-extrabold uppercase tracking-widest mb-4">
                            Premium Education
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-[#111b21] tracking-tight mb-2">
                            Transform Your <span className="text-[#00a884]">Future</span>
                        </h1>
                        <p className="text-[#667781] text-lg font-medium italic">
                            Discover {filteredCourses.length} world-class courses taught by industry experts.
                        </p>
                    </div>

                    {/* Drawer Toggle */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex items-center gap-3 bg-[#00a884] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-[#008f6f] transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        <FiMenu size={20} />
                        Filter & Search
                    </button>
                </div>

                {/* Filters Drawer (Sliding Overlay) */}
                <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[#064e3b]/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

                    {/* Drawer Content */}
                    <div className={`absolute left-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-500 transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#00a884] flex items-center justify-center text-white shadow-lg">
                                        <FiFilter size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#111b21]">Filters</h2>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Search */}
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Search Keywords</label>
                                    <div className="relative">
                                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8696a0]" />
                                        <input
                                            type="text"
                                            placeholder="eg. Javascript, AI, Design..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full bg-[#f0f2f5] border-none rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[#111b21] font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Dropdown Filters */}
                                <FilterDropdown label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
                                <FilterDropdown 
                                    label="Faculty" 
                                    options={['All', ...faculties.map(f => f.name)]} 
                                    value={faculty} 
                                    onChange={setFaculty} 
                                />
                                <FilterDropdown label="Skill Level" options={LEVELS} value={level} onChange={setLevel} />
                                {isAuthenticated && (
                                    <FilterDropdown label="Enrollment Status" options={PURCHASE_STATUS} value={purchaseStatus} onChange={setPurchaseStatus} />
                                )}
                                <FilterDropdown label="Price Range" options={PRICE_RANGES} value={priceRange} onChange={setPriceRange} />

                                <div className="pt-10">
                                    <button
                                        onClick={() => { setSearch(''); setCategory('All'); setFaculty('All'); setLevel('All'); setPurchaseStatus('All'); setPriceRange('All'); }}
                                        className="w-full py-4 text-[#ef4444] font-bold text-sm hover:bg-red-50 rounded-2xl transition-colors"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer Info */}
                        <div className="p-8 bg-[#f8faf9] mt-auto">
                            <p className="text-[10px] text-[#8696a0] font-bold uppercase tracking-widest text-center mb-4">Contact Helpline</p>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                                <p className="text-[#111b21] font-bold">+91 6353141028</p>
                                <p className="text-xs text-[#667781]">learnhub@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="skeleton h-[420px]" />
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-2xl shadow-slate-200/50 max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <FiBook className="text-5xl text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-[#111b21] mb-4">No Courses Found</h3>
                        <p className="text-[#667781] font-medium leading-relaxed mb-10">
                            Your current filter combination didn't yield any results. Try adjusting the category or search keywords to find what you're looking for.
                        </p>
                        <button
                            onClick={() => { setSearch(''); setCategory('All'); setFaculty('All'); setLevel('All'); setPurchaseStatus('All'); setPriceRange('All'); }}
                            className="bg-[#00a884] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                        >
                            Reset My Quest
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredCourses.map((course) => (
                            <div key={course._id} className="hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <CourseCard course={course} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
