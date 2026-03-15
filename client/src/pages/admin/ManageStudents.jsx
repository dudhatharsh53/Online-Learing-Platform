import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import ProgressBar from '../../components/ProgressBar'
import { FiUser, FiSearch, FiBook, FiTrendingUp, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ManageStudents() {
    const [progressList, setProgressList] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    const loadData = async () => {
        try {
            const { data } = await axiosInstance.get('/api/progress/admin/all')
            setProgressList(data.progressList || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load student progress')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student profile?')) return;
        try {
            await axiosInstance.delete(`/api/admin/student/${id}`);
            toast.success('Student removed from system');
            loadData();
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    // Group progress entries by student
    const studentMap = progressList.reduce((acc, p) => {
        const id = p.student?._id
        if (!id) return acc
        if (!acc[id]) acc[id] = { student: p.student, courses: [] }
        acc[id].courses.push(p)
        return acc
    }, {})

    const students = Object.values(studentMap).filter((s) =>
        !search || s.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.student?.email?.toLowerCase().includes(search.toLowerCase())
    )

    const avgProgress = (courses) => {
        if (!courses.length) return 0
        return Math.round(courses.reduce((s, c) => s + c.progressPercent, 0) / courses.length)
    }

    return (
        <div className="container-lg py-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#111b21] mb-1">Student Performance</h1>
                    <p className="text-[#667781]">{students.length} active learners</p>
                </div>
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8696a0] text-sm" />
                    <input
                        type="text"
                        placeholder="Search student profile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d1d7db] rounded-xl text-sm focus:outline-none focus:border-[#00a884] shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl bg-white" />)}
                </div>
            ) : students.length === 0 ? (
                <div className="bg-white rounded-2xl p-20 text-center border border-[#d1d7db]">
                    <FiUser className="text-5xl text-[#d1d7db] mx-auto mb-4" />
                    <p className="text-[#667781]">{search ? 'No matches found.' : 'No analytics available yet.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {students.map(({ student, courses }) => (
                        <div key={student._id} className="bg-white rounded-2xl p-6 border border-[#d1d7db] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold flex-shrink-0 text-xl shadow-lg shadow-emerald-100">
                                    {student.name?.charAt(0).toUpperCase()}
                                </div>

                                {/* Student info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                        <div>
                                            <h3 className="font-bold text-[#111b21] text-lg">{student.name}</h3>
                                            <span className="text-xs text-[#667781] flex items-center gap-1">{student.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => navigate(`/admin/student/${student._id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Details">
                                                <FiEye size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(student._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Delete">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-[#54656f] mb-6 pb-4 border-b border-[#f0f2f5]">
                                        <span className="flex items-center gap-2 bg-[#f8f9fa] px-3 py-1 rounded-full"><FiBook className="text-[#00a884]" /> {courses.length} Course{courses.length !== 1 ? 's' : ''}</span>
                                        <span className="flex items-center gap-2 bg-[#f8f9fa] px-3 py-1 rounded-full"><FiTrendingUp className="text-emerald-500" /> Avg {avgProgress(courses)}% complete</span>
                                    </div>

                                    {/* Per-course progress */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                        {courses.map((p) => (
                                            <div key={p._id} className="space-y-1.5 p-3 rounded-xl hover:bg-[#f8f9fa] transition-colors">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-semibold text-[#111b21] truncate w-40">{p.course?.title || 'Course'}</span>
                                                    <span className={`font-bold ${p.progressPercent === 100 ? 'text-emerald-600' : 'text-[#667781]'}`}>
                                                        {p.progressPercent}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-[#f0f2f5] h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${p.progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#00a884]'}`}
                                                        style={{ width: `${p.progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
