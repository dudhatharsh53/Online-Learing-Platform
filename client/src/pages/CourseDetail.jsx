import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourseById, enrollInCourse } from '../redux/courseSlice'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'
import ReactPlayer from 'react-player/youtube'
import {
    FiPlay, FiDownload, FiUsers, FiClock,
    FiCheckCircle, FiLock, FiArrowLeft, FiStar, FiShield, FiAward, FiExternalLink, FiUser
} from 'react-icons/fi'

export default function CourseDetail() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentCourse: course, loading } = useSelector((s) => s.courses)
    const { user, isAuthenticated } = useSelector((s) => s.auth)
    const [enrolling, setEnrolling] = useState(false)

    useEffect(() => {
        dispatch(fetchCourseById(id))
    }, [id, dispatch])

    const isEnrolled = course?.enrolledStudents?.some(
        (s) => (s._id || s) === user?._id
    )

    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleEnroll = async () => {
        if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })
        if (isEnrolled) return toast('You are already enrolled!', { icon: '✅' })

        setEnrolling(true)
        try {
            // 1. Create Order
            const { data } = await axiosInstance.post(`/api/payment/order/${id}`)

            // Bypass if mock (no keys in .env)
            if (data.isMock) {
                const res = await dispatch(enrollInCourse(id))
                if (enrollInCourse.fulfilled.match(res)) {
                    toast.success('Successfully Enrolled (Mock Payment)! 🎉')
                    dispatch(fetchCourseById(id))
                }
                setEnrolling(false)
                return
            }

            // 2. Load Razorpay
            const loaded = await loadRazorpay()
            if (!loaded) {
                toast.error('Razorpay SDK failed to load. Are you online?')
                setEnrolling(false)
                return
            }

            // 3. Open Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Needs to be in .env
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'The Academy',
                description: `Enrollment for ${course.title}`,
                image: course.thumbnail || '',
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await axiosInstance.post('/api/payment/verify', {
                            ...response,
                            courseId: id
                        })
                        if (verifyRes.data.success) {
                            toast.success('Payment Successful! Welcome to the course.')
                            dispatch(fetchCourseById(id))
                        }
                    } catch (error) {
                        toast.error('Payment verification failed')
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: '#00a884',
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Payment initiation failed')
        } finally {
            setEnrolling(false)
        }
    }

    if (loading || !course) {
        return (
            <div className="bg-white min-h-screen py-20">
                <div className="container-lg">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="skeleton aspect-video rounded-[3rem]" />
                            <div className="skeleton h-12 w-3/4" />
                            <div className="skeleton h-4 w-full" />
                        </div>
                        <div className="skeleton h-96 rounded-[3rem]" />
                    </div>
                </div>
            </div>
        )
    }

    // Helper for embeddable URL
    const getEmbedUrl = (url) => {
        if (!url) return null
        if (url.includes('youtube.com/embed/')) return url
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }

    return (
        <div className="bg-[#f8faf9] min-h-screen py-12 md:py-20">
            <div className="container-lg">
                <Link to="/courses" className="inline-flex items-center gap-3 text-slate-400 hover:text-[#00a884] font-bold text-sm mb-12 transition-all group">
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> BACK TO ACADEMY
                </Link>

                <div className="grid lg:grid-cols-3 gap-16">
                    {/* Left: Main Content */}
                    <div className="lg:col-span-2">
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-emerald-100 text-[#00a884] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {course.category}
                                </span>
                                <span className="flex items-center gap-1 text-amber-500 font-bold text-xs font-sans">
                                    <FiStar fill="currentColor" /> 4.9 (2.4K+ reviews)
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111b21] leading-[1.1] tracking-tight mb-8">{course.title}</h1>

                            {/* Video Section (Feature 1) */}
                            <div className="mb-12">
                                {isEnrolled ? (
                                    <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 aspect-video border-4 border-white relative group">
                                        <ReactPlayer
                                            url={course.promoVideoUrl}
                                            width="100%"
                                            height="100%"
                                            controls={true}
                                            playing={false}
                                            light={course.thumbnail}
                                            playIcon={
                                                <div className="w-20 h-20 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-2xl scale-125 hover:scale-135 transition-transform duration-300">
                                                    <FiPlay fill="currentColor" size={30} className="ml-1" />
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl overflow-hidden group">
                                        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-900">
                                            <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                                    <FiLock size={24} className="text-white" />
                                                </div>
                                                <p className="text-white font-black text-sm uppercase tracking-widest">Enroll to Unlock Content</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-8 text-sm font-bold text-[#667781] mb-10 pb-10 border-b border-slate-100">
                                <span className="flex items-center gap-2"><FiUsers className="text-[#00a884] text-lg" /> {course.enrolledStudents?.length || 0} Learners</span>
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-[#00a884] text-lg" /> {course.level}</span>
                                <span className="flex items-center gap-2"><FiClock className="text-[#00a884] text-lg" /> Lifetime Access</span>
                            </div>

                            <div className="prose prose-slate max-w-none mb-16">
                                <h3 className="text-2xl font-black text-[#111b21] mb-6 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-[#00a884] rounded-full" /> About this course
                                </h3>
                                <p className="text-[#667781] text-lg leading-relaxed font-medium">
                                    {course.description}
                                </p>
                            </div>

                            {/* Faculty Info (Feature 3) */}
                            {course.faculty && (
                                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-lg mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50" />
                                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-emerald-100 flex-shrink-0 border-4 border-white shadow-xl overflow-hidden">
                                            {course.faculty.profileImage ? (
                                                <img src={course.faculty.profileImage} alt={course.faculty.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><FiUser size={40} className="text-[#00a884]" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-[#00a884] uppercase tracking-[0.2em] mb-2">Lead Instructor</p>
                                            <h3 className="text-2xl font-black text-[#111b21] mb-2">{course.faculty.name}</h3>
                                            <p className="text-[#667781] text-sm leading-relaxed font-medium italic">
                                                "{course.faculty.description}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* What you'll learn */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-lg">
                                <h3 className="text-xl font-black text-[#111b21] mb-8">What's Included</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { icon: <FiClock />, text: 'Lifetime access to all future updates' },
                                        { icon: <FiAward />, text: 'Verified Professional Certificate' },
                                        { icon: <FiDownload />, text: '12+ Downloadable PDF Resources' },
                                        { icon: <FiShield />, text: '1v1 Expert Mentor Support' },
                                    ].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-5 text-sm font-bold text-[#111b21]">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a884] flex items-center justify-center text-xl shadow-sm border border-emerald-100/50">{feat.icon}</div>
                                            {feat.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sticky Action Card */}
                    <div className="lg:relative">
                        <div className="sticky top-10">
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                                {/* Price */}
                                <div className="mb-10 text-center">
                                    <div className="inline-flex items-end gap-2 mb-2">
                                        <h3 className="text-5xl font-black text-[#111b21]">{course.price === 0 ? 'FREE' : `₹${course.price.toLocaleString()}`}</h3>
                                        {course.price > 0 && <span className="text-slate-300 font-bold mb-2 line-through text-lg">₹2,999</span>}
                                    </div>
                                    <p className="text-[10px] font-black text-[#00a884] uppercase tracking-widest bg-emerald-50 py-1.5 px-4 rounded-full inline-block">Best Value Guarantee</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-4 mb-10">
                                    {!isAuthenticated ? (
                                        <button
                                            onClick={() => navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })}
                                            className="btn-primary w-full py-5 text-lg font-black"
                                        >
                                            LOG IN TO ENROLL
                                        </button>
                                    ) : isEnrolled ? (
                                        <div className="text-center py-6 px-4 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100">
                                            <FiCheckCircle size={32} className="mx-auto text-[#00a884] mb-3" />
                                            <p className="text-sm font-black text-[#111b21] uppercase tracking-widest mb-1">Already Enrolled</p>
                                            <p className="text-[10px] font-bold text-slate-500">YOU HAVE FULL ACCESS TO THIS COURSE</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="btn-primary w-full py-5 text-lg font-black shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                                        >
                                            {enrolling ? (
                                                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> PROCESING...</>
                                            ) : (
                                                <><FiShield /> ENROLL NOW</>
                                            )}
                                        </button>
                                    )}
                                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Secure Payment via Razorpay</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-[#111b21] flex items-center gap-3"><FiAward className="text-[#00a884]" /> Full Lifetime Access</p>
                                    <p className="text-xs font-bold text-[#111b21] flex items-center gap-3"><FiShield className="text-[#00a884]" /> Certificate of Completion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

