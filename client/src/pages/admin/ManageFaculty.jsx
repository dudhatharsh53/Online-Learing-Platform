import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFaculties, createFaculty, updateFaculty, deleteFaculty } from '../../redux/facultySlice'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiX, FiMail, FiFileText } from 'react-icons/fi'

const EMPTY = { name: '', email: '', description: '', profileImage: '' }

export default function ManageFaculty() {
    const dispatch = useDispatch()
    const { faculties, loading } = useSelector((s) => s.faculty)
    const [modal, setModal] = useState(false)   // 'create' | 'edit' | false
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)

    useEffect(() => { dispatch(fetchFaculties()) }, [dispatch])

    const openCreate = () => { setForm(EMPTY); setEditing(null); setModal('create') }
    const openEdit = (f) => {
        setForm({ name: f.name, email: f.email, description: f.description, profileImage: f.profileImage || '' })
        setEditing(f); setModal('edit')
    }
    const closeModal = () => { setModal(false); setEditing(null) }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.description) return toast.error('Please fill required fields')
        setSaving(true)

        let res
        if (modal === 'create') res = await dispatch(createFaculty(form))
        else res = await dispatch(updateFaculty({ id: editing._id, formData: form }))

        setSaving(false)
        if (createFaculty.fulfilled.match(res) || updateFaculty.fulfilled.match(res)) {
            toast.success(modal === 'create' ? 'Faculty added!' : 'Faculty updated!')
            closeModal()
        } else {
            toast.error(res.payload || 'Something went wrong')
        }
    }

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove ${name} from faculty list?`)) return
        setDeleting(id)
        const res = await dispatch(deleteFaculty(id))
        setDeleting(null)
        if (deleteFaculty.fulfilled.match(res)) toast.success('Faculty removed')
        else toast.error(res.payload || 'Removal failed')
    }

    return (
        <div className="container-lg py-10 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#111b21] mb-1">Faculty Management</h1>
                    <p className="text-[#667781]">{faculties.length} total faculty members</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
                    <FiPlus /> Add Faculty
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-3xl" />)}
                </div>
            ) : faculties.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiUser className="text-5xl text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No faculty members found</p>
                    <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2"><FiPlus /> Add first member</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculties.map((f) => (
                        <div key={f._id} className="card p-6 flex flex-col group hover:border-[#00a884]/30 transition-all duration-300">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                    {f.profileImage ? (
                                        <img src={f.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUser className="text-2xl text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#111b21] truncate">{f.name}</h3>
                                    <p className="text-xs text-[#00a884] font-medium truncate">{f.email}</p>
                                </div>
                            </div>
                            <p className="text-[#667781] text-sm line-clamp-3 mb-6 flex-1 italic leading-relaxed">
                                "{f.description}"
                            </p>
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button onClick={() => openEdit(f)} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-2">
                                    <FiEdit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(f._id, f.name)}
                                    disabled={deleting === f._id}
                                    className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                >
                                    {deleting === f._id ? <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block" /> : <FiTrash2 size={14} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-[#111b21]">{modal === 'create' ? 'Add New Faculty' : 'Edit Faculty'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="label">Full Name *</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input className="input pl-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Email Address *</label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" className="input pl-11" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@academy.com" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Profile Image URL (Optional)</label>
                                <input className="input" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} placeholder="https://image-link.com" />
                            </div>
                            <div>
                                <label className="label">Biography / Description *</label>
                                <div className="relative">
                                    <FiFileText className="absolute left-4 top-4 text-slate-400" />
                                    <textarea className="input pl-11 min-h-[120px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Expert in Full Stack Development with 10 years of experience..." />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : (modal === 'create' ? 'Add Faculty' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
