import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminCourses, deleteCourse, createCourse, updateCourse } from '../../redux/courseSlice'
import { fetchFaculties } from '../../redux/facultySlice'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiBook } from 'react-icons/fi'

const CATEGORIES = ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'DevOps', 'Design', 'Business', 'Marketing', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const EMPTY = { title: '', description: '', category: 'Web Development', instructor: '', price: 0, level: 'Beginner', promoVideoUrl: '', faculty: '' }

export default function ManageCourses() {
    const dispatch = useDispatch()
    const { courses, loading } = useSelector((s) => s.courses)
    const { faculties } = useSelector((s) => s.faculty)
    const [modal, setModal] = useState(false)   // 'create' | 'edit' | false
    const [editing, setEditing] = useState(null)    // course being edited
    const [form, setForm] = useState(EMPTY)
    const [thumb, setThumb] = useState(null)    // File
    const [thumbPrev, setThumbPrev] = useState('')
    const [deleting, setDeleting] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        dispatch(fetchAdminCourses())
        dispatch(fetchFaculties())
    }, [dispatch])

    const openCreate = () => { setForm(EMPTY); setEditing(null); setThumb(null); setThumbPrev(''); setModal('create') }
    const openEdit = (c) => {
        setForm({
            title: c.title,
            description: c.description,
            category: c.category,
            instructor: c.instructor,
            price: c.price,
            level: c.level,
            promoVideoUrl: c.promoVideoUrl || '',
            faculty: c.faculty?._id || c.faculty || ''
        })
        setEditing(c); setThumb(null); setThumbPrev(c.thumbnail || ''); setModal('edit')
    }
    const closeModal = () => { setModal(false); setEditing(null) }

    const handleThumb = (e) => {
        const file = e.target.files[0]
        if (file) { setThumb(file); setThumbPrev(URL.createObjectURL(file)) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title || !form.description || !form.instructor || !form.faculty) return toast.error('Please fill required fields (Title, Description, Instructor, Faculty)')
        setSaving(true)
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        if (thumb) fd.append('thumbnail', thumb)

        let res
        if (modal === 'create') res = await dispatch(createCourse(fd))
        else res = await dispatch(updateCourse({ id: editing._id, formData: fd }))

        setSaving(false)
        if (createCourse.fulfilled.match(res) || updateCourse.fulfilled.match(res)) {
            toast.success(modal === 'create' ? 'Course created!' : 'Course updated!')
            closeModal()
        } else {
            toast.error(res.payload || 'Something went wrong')
        }
    }

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This will also delete all its lectures.`)) return
        setDeleting(id)
        const res = await dispatch(deleteCourse(id))
        setDeleting(null)
        if (deleteCourse.fulfilled.match(res)) toast.success('Course deleted')
        else toast.error(res.payload || 'Delete failed')
    }

    return (
        <div className="container-lg py-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#111b21] mb-1">Manage Courses</h1>
                    <p className="text-[#667781]">{courses.length} total courses</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm" id="create-course-btn">
                    <FiPlus /> New Course
                </button>
            </div>

            {/* Course table */}
            {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
            ) : courses.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiBook className="text-5xl text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No courses yet</p>
                    <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2"><FiPlus /> Create first course</button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-[#667781] text-xs uppercase tracking-wider">
                                    <th className="text-left p-4 font-medium">Course</th>
                                    <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
                                    <th className="text-left p-4 font-medium hidden sm:table-cell">Lectures</th>
                                    <th className="text-left p-4 font-medium hidden lg:table-cell">Students</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {course.thumbnail
                                                    ? <img src={course.thumbnail} alt="" className="w-10 h-7 rounded-lg object-cover flex-shrink-0" />
                                                    : <div className="w-10 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><FiBook className="text-slate-400 text-xs" /></div>
                                                }
                                                <div>
                                                    <p className="font-bold text-[#111b21] line-clamp-1">{course.title}</p>
                                                    <p className="text-xs text-[#667781]">{course.instructor}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell"><span className="badge-blue badge">{course.category}</span></td>
                                        <td className="p-4 hidden sm:table-cell text-[#667781]">{course.lectures?.length || 0}</td>
                                        <td className="p-4 hidden lg:table-cell text-[#667781]">{course.enrolledStudents?.length || 0}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/courses/${course._id}/upload-lecture`}
                                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Upload lecture">
                                                    <FiUpload className="text-sm" />
                                                </Link>
                                                <button onClick={() => openEdit(course)}
                                                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                                                    <FiEdit2 className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDelete(course._id, course.title)}
                                                    disabled={deleting === course._id}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                                    {deleting === course._id
                                                        ? <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
                                                        : <FiTrash2 className="text-sm" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-[#111b21]">{modal === 'create' ? 'New Course' : 'Edit Course'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Thumbnail */}
                            <div>
                                <label className="label">Thumbnail</label>
                                <div className="relative">
                                    {thumbPrev
                                        ? <img src={thumbPrev} alt="preview" className="w-full aspect-video object-cover rounded-xl mb-2" />
                                        : <div className="w-full aspect-video bg-slate-800 rounded-xl flex items-center justify-center mb-2 text-slate-600 text-sm">No thumbnail</div>
                                    }
                                    <label className="btn-secondary text-sm flex items-center gap-2 cursor-pointer w-fit">
                                        <FiUpload /> Choose Image
                                        <input type="file" accept="image/*" onChange={handleThumb} className="hidden" />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="label">YouTube Promo Link (Optional)</label>
                                <input className="input" value={form.promoVideoUrl} onChange={(e) => setForm({ ...form, promoVideoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                            <div>
                                <label className="label">Title *</label>
                                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Course title" />
                            </div>
                            <div>
                                <label className="label">Description *</label>
                                <textarea className="input min-h-[80px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will students learn?" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Category</label>
                                    <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Level</label>
                                    <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Instructor *</label>
                                    <input className="input" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="Instructor name" />
                                </div>
                                <div>
                                    <label className="label">Price (₹)</label>
                                    <input type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Assigned Faculty *</label>
                                <select className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                                    <option value="">-- Select Faculty --</option>
                                    {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : (modal === 'create' ? 'Create Course' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
