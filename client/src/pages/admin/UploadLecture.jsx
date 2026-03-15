import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { FiUpload, FiTrash2, FiArrowLeft, FiVideo, FiFile, FiCheckCircle } from 'react-icons/fi'

export default function UploadLecture() {
    const { courseId } = useParams()
    const [course, setCourse] = useState(null)
    const [lectures, setLectures] = useState([])
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [form, setForm] = useState({ title: '', description: '', order: '', isFreePreview: false, youtubeUrl: '' })
    const [videoFile, setVideoFile] = useState(null)
    const [pdfFile, setPdfFile] = useState(null)
    const [progress, setProgress] = useState(0)

    const load = async () => {
        try {
            const [{ data: cData }, { data: lData }] = await Promise.all([
                axiosInstance.get(`/api/courses/${courseId}`),
                axiosInstance.get(`/api/lectures/${courseId}`),
            ])
            setCourse(cData.course)
            setLectures(lData.lectures || [])
        } catch (err) { toast.error('Could not load course') }
    }

    useEffect(() => { load() }, [courseId])

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!form.title) return toast.error('Lecture title is required')
        if (!videoFile && !pdfFile) return toast.error('Please attach at least a video or PDF')
        setUploading(true)
        setProgress(0)
        try {
            const fd = new FormData()
            fd.append('title', form.title)
            fd.append('description', form.description)
            fd.append('order', form.order || lectures.length + 1)
            fd.append('isFreePreview', form.isFreePreview)
            if (form.youtubeUrl) fd.append('youtubeUrl', form.youtubeUrl)
            if (videoFile) fd.append('video', videoFile)
            if (pdfFile) fd.append('pdf', pdfFile)

            await axiosInstance.post(`/api/lectures/${courseId}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
            })
            toast.success('Lecture uploaded!')
            setForm({ title: '', description: '', order: '', isFreePreview: false, youtubeUrl: '' })
            setVideoFile(null); setPdfFile(null); setProgress(0)
            load() // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed')
        } finally { setUploading(false) }
    }

    const handleDelete = async (lectureId, title) => {
        if (!window.confirm(`Delete lecture "${title}"?`)) return
        setDeleting(lectureId)
        try {
            await axiosInstance.delete(`/api/lectures/${lectureId}`)
            toast.success('Lecture deleted')
            setLectures((prev) => prev.filter((l) => l._id !== lectureId))
        } catch (err) {
            toast.error('Delete failed')
        } finally { setDeleting(null) }
    }

    const fmt = (s) => { if (!s) return '—'; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m` }

    return (
        <div className="container-lg py-10 animate-fade-in">
            <Link to="/admin/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
                <FiArrowLeft /> Back to courses
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-100">Upload Lecture</h1>
                {course && <p className="text-slate-500 mt-1">Course: <span className="text-slate-300">{course.title}</span></p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* ── Upload form ── */}
                <div>
                    <div className="card p-6">
                        <h2 className="font-semibold text-slate-200 mb-5 flex items-center gap-2"><FiUpload className="text-primary-400" /> New Lecture</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="label">Lecture Title *</label>
                                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to React Hooks" />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea className="input min-h-[70px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this lecture…" />
                            </div>

                            {/* Video upload */}
                            <div>
                                <label className="label">Video File</label>
                                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${videoFile ? 'border-primary-600 bg-primary-900/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                    <FiVideo className={videoFile ? 'text-primary-400' : 'text-slate-600'} />
                                    <span className="text-sm text-slate-400">
                                        {videoFile ? videoFile.name : 'Click to select video (MP4, MOV, WebM…)'}
                                    </span>
                                    {videoFile && <FiCheckCircle className="ml-auto text-primary-400 flex-shrink-0" />}
                                    <input type="file" accept="video/*" className="hidden"
                                        onChange={(e) => setVideoFile(e.target.files[0] || null)} />
                                </label>
                            </div>

                            {/* PDF upload */}
                            <div>
                                <label className="label">PDF / Notes (optional)</label>
                                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${pdfFile ? 'border-emerald-600 bg-emerald-900/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                    <FiFile className={pdfFile ? 'text-emerald-400' : 'text-slate-600'} />
                                    <span className="text-sm text-slate-400">
                                        {pdfFile ? pdfFile.name : 'Click to select PDF / slides…'}
                                    </span>
                                    {pdfFile && <FiCheckCircle className="ml-auto text-emerald-400 flex-shrink-0" />}
                                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden"
                                        onChange={(e) => setPdfFile(e.target.files[0] || null)} />
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="label">Order</label>
                                    <input type="number" min="1" className="input" value={form.order}
                                        onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder={lectures.length + 1} />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="label">Free Preview?</label>
                                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                        <input type="checkbox" checked={form.isFreePreview}
                                            onChange={(e) => setForm({ ...form, isFreePreview: e.target.checked })}
                                            className="w-4 h-4 rounded accent-primary-500" />
                                        <span className="text-sm text-slate-400">Allow preview without enrollment</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="label">YouTube Link (Optional)</label>
                                <input className="input" value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                                <p className="text-[10px] text-slate-500 mt-1">If provided, this video will be used instead of uploaded file.</p>
                            </div>

                            {/* Upload progress bar */}
                            {uploading && progress > 0 && (
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Uploading to Cloudinary…</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary-500 to-blue-400 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2 py-3" id="upload-lecture-btn">
                                {uploading
                                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</>
                                    : <><FiUpload /> Upload Lecture</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Existing lectures ── */}
                <div>
                    <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                        <FiVideo className="text-primary-400" /> Existing Lectures
                        <span className="ml-1 badge-blue badge">{lectures.length}</span>
                    </h2>
                    {lectures.length === 0 ? (
                        <div className="card p-8 text-center text-slate-500 text-sm">No lectures yet. Upload one!</div>
                    ) : (
                        <div className="space-y-3">
                            {lectures.map((lec, idx) => (
                                <div key={lec._id} className="card px-4 py-3 flex items-start gap-3 hover:border-slate-700 transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-200 truncate">{lec.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-600">{fmt(lec.duration)}</span>
                                            {lec.videoUrl && <span className="badge-blue badge text-xs">Video</span>}
                                            {lec.youtubeUrl && <span className="badge-red badge text-xs">YouTube</span>}
                                            {lec.pdfUrl && <span className="badge-green badge text-xs">PDF</span>}
                                            {lec.isFreePreview && <span className="badge-yellow badge text-xs">Preview</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(lec._id, lec.title)} disabled={deleting === lec._id}
                                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0">
                                        {deleting === lec._id
                                            ? <span className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                            : <FiTrash2 className="text-sm" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
