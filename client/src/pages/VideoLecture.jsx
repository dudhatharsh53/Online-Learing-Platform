import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import VideoPlayer from '../components/VideoPlayer'
import ProgressBar from '../components/ProgressBar'
import toast from 'react-hot-toast'
import {
    FiDownload, FiCheckCircle, FiChevronLeft, FiChevronRight,
    FiList, FiBook, FiArrowLeft, FiPlayCircle, FiClock, FiTrendingUp
} from 'react-icons/fi'

export default function VideoLecture() {
    const { courseId, id: lectureId } = useParams()
    const navigate = useNavigate()

    const [lecture, setLecture] = useState(null)
    const [course, setCourse] = useState(null)
    const [lectures, setLectures] = useState([])
    const [progress, setProgress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [marking, setMarking] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const lastUpdateRef = useRef(0)

    // Load lecture, course, and progress
    const load = async () => {
        setLoading(true)
        try {
            const [{ data: lData }, { data: cData }, { data: pData }] = await Promise.all([
                axiosInstance.get(`/api/lectures/single/${lectureId}`),
                axiosInstance.get(`/api/courses/${courseId}`),
                axiosInstance.get(`/api/progress/${courseId}`),
            ])
            setLecture(lData.lecture)
            setCourse(cData.course)
            setLectures(cData.course.lectures || [])
            setProgress(pData.progress)
        } catch (err) {
            toast.error('Could not load lecture')
            navigate(`/courses/${courseId}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!lectureId || lectureId === 'undefined' || !courseId) return
        load()
    }, [lectureId, courseId, navigate])

    const currentIdx = lectures.findIndex((l) => l._id === lectureId)
    const prevLecture = currentIdx > 0 ? lectures[currentIdx - 1] : null
    const nextLecture = currentIdx < lectures.length - 1 ? lectures[currentIdx + 1] : null

    const isCompleted = progress?.completedVideos?.some(
        (vId) => vId.toString() === lectureId
    )

    const handleMarkComplete = async () => {
        if (isCompleted || marking) return
        setMarking(true)
        try {
            const { data } = await axiosInstance.post('/api/progress/video/watch', {
                courseId,
                videoId: lectureId,
                percentage: 100
            })
            setProgress(data.progress)
            toast.success('Lecture completed! 🎓')
            if (nextLecture) {
                setTimeout(() => navigate(`/courses/${courseId}/lecture/${nextLecture._id}`), 1500)
            }
        } catch (err) {
            toast.error('Could not save progress')
        } finally {
            setMarking(false)
        }
    }

    const handleProgress = async (state) => {
        const playedPercentage = Math.round(state.played * 100)

        // Only update server every 10% or if at key milestones (50%, 90%)
        if (playedPercentage - lastUpdateRef.current >= 10 || (playedPercentage >= 50 && lastUpdateRef.current < 50)) {
            lastUpdateRef.current = playedPercentage
            try {
                const { data } = await axiosInstance.post('/api/progress/video/watch', {
                    courseId,
                    videoId: lectureId,
                    percentage: playedPercentage
                })
                setProgress(data.progress)
            } catch (err) {
                console.error('Progress sync error:', err)
            }
        }
    }

    const getVideoPercentage = (vId) => {
        const prog = progress?.videoProgress?.find(p => p.videoId.toString() === vId)
        return prog ? prog.percentage : 0
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse">Entering Classroom...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navigation Header */}
            <header className="glass-navbar px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <Link to={`/courses/${courseId}`} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#00a884] hover:text-white transition-all shadow-sm">
                        <FiArrowLeft size={18} />
                    </Link>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#00a884] uppercase tracking-widest">{course?.category}</p>
                        <h1 className="text-lg font-black text-[#111b21] truncate">{course?.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {progress && (
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <FiTrendingUp size={12} className="text-[#00a884]" />
                                {progress.progressPercent || 0}% COURSE PROGRESS
                            </div>
                            <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#00a884] h-full rounded-full transition-all duration-1000" style={{ width: `${progress.progressPercent || 0}%` }} />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-3 rounded-xl transition-all ${sidebarOpen ? 'bg-[#111b21] text-white' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}
                    >
                        <FiList size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Main Video Area */}
                <main className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'lg:mr-96' : ''}`}>
                    <div className="max-w-5xl mx-auto p-6 md:p-10">
                        <div className="animate-fade-in">
                            <VideoPlayer
                                url={lecture?.youtubeUrl || lecture?.videoUrl}
                                onEnded={handleMarkComplete}
                                onProgress={handleProgress}
                                title={lecture?.title}
                            />
                        </div>

                        <div className="mt-10 flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-emerald-100 text-[#00a884] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                        Active Lecture
                                    </span>
                                    {isCompleted && (
                                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                            <FiCheckCircle /> COMPLETELY FINISHED
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-black text-[#111b21] mb-4">{lecture?.title}</h1>
                                <p className="text-slate-600 leading-relaxed text-lg max-w-3xl">
                                    {lecture?.description || 'No description available for this lecture.'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 min-w-[240px]">
                                {lecture?.pdfUrl && (
                                    <a
                                        href={lecture.pdfUrl}
                                        target="_blank"
                                        className="btn-secondary w-full justify-start"
                                    >
                                        <FiDownload className="text-[#00a884]" /> Download Notes
                                    </a>
                                )}
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={isCompleted || marking}
                                    className={`w-full ${isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'btn-primary'}`}
                                >
                                    {isCompleted ? <><FiCheckCircle /> Completed</> : marking ? 'Saving...' : 'Mark as Finished'}
                                </button>
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between gap-4">
                            {prevLecture ? (
                                <button onClick={() => navigate(`/courses/${courseId}/lecture/${prevLecture._id}`)} className="btn-secondary">
                                    <FiChevronLeft /> Previous Session
                                </button>
                            ) : <div />}
                            {nextLecture && (
                                <button onClick={() => navigate(`/courses/${courseId}/lecture/${nextLecture._id}`)} className="btn-primary px-10">
                                    Next Session <FiChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                {/* Course Content Sidebar */}
                <aside className={`fixed top-[5.5rem] bottom-0 right-0 w-full lg:w-96 bg-white border-l border-slate-100 transform transition-transform duration-500 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-[#111b21]">Course Syllabus</h2>
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{lectures.length} Total Lessons</span>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {lectures.map((lec, idx) => {
                            const prog = getVideoPercentage(lec._id)
                            const done = prog >= 100
                            const active = lec._id === lectureId

                            // IF video is complete, don't show suggestion logic... 
                            // The user said: "if student coplete the video then don't show any suggestion that youcan show that video"
                            // If this was a "next video" recommendation, we'd skip completed ones.
                            // But for the syllabus sidebar, we should show it but marked as done.

                            return (
                                <button
                                    key={lec._id}
                                    onClick={() => navigate(`/courses/${courseId}/lecture/${lec._id}`)}
                                    className={`w-full text-left p-6 transition-all hover:bg-slate-50 relative group ${active ? 'bg-emerald-50/50' : ''}`}
                                >
                                    {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a884]" />}

                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black shadow-sm ${done ? 'bg-emerald-500 text-white' : active ? 'bg-[#111b21] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-[#00a884] group-hover:text-white transition-colors'}`}>
                                            {done ? <FiCheckCircle size={14} /> : idx + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                                <h4 className={`font-bold text-sm truncate ${active ? 'text-[#00a884]' : 'text-[#111b21]'}`}>{lec.title}</h4>
                                                {lec.duration > 0 && <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">{Math.floor(lec.duration / 60)}m</span>}
                                            </div>

                                            {/* Progress Status Text */}
                                            {prog > 0 && prog < 100 && (
                                                <div className="flex items-center gap-2 text-[10px] font-black text-[#00a884] uppercase tracking-wider mb-2">
                                                    <FiClock size={10} /> {prog}% in your progress
                                                </div>
                                            )}

                                            {/* Progress Bar inside lesson item */}
                                            {prog > 0 && (
                                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-[#00a884]'}`} style={{ width: `${prog}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </aside>
            </div>
        </div>
    )
}
