import { Link } from 'react-router-dom'
import { FiPlay, FiUsers, FiClock, FiStar } from 'react-icons/fi'

const CATEGORY_COLORS = {
    'Web Development': 'badge-blue',
    'Mobile Development': 'badge-green',
    'Data Science': 'badge-yellow',
    'Machine Learning': 'badge-blue',
    'DevOps': 'badge-green',
    'Design': 'badge-yellow',
    'Business': 'badge-blue',
    'Marketing': 'badge-green',
    'Other': 'badge-yellow',
}

// Format seconds to "Xh Xm"
const formatDuration = (secs) => {
    if (!secs) return '—'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function CourseCard({ course }) {
    const totalDuration = course.lectures?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0

    return (
        <div className="card group hover:border-[#00a884] hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 block overflow-hidden bg-white">
            {/* Thumbnail */}
            <div className="relative overflow-hidden aspect-video bg-slate-100">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00a884]/20 to-emerald-50">
                        <FiPlay className="text-[#00a884] text-4xl" />
                    </div>
                )}


                {/* Level badge */}
                <div className="absolute top-4 right-4 z-10">
                    <span className="bg-[#00a884] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                        {course.level || 'Beginner'}
                    </span>
                </div>
            </div>

            <Link to={`/courses/${course._id}`} className="p-6 block">
                {/* Category */}
                <span className="bg-emerald-50 text-[#00a884] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-4 inline-block">
                    {course.category}
                </span>

                {/* Title */}
                <h3 className="font-black text-[#111b21] text-lg leading-tight line-clamp-2 mb-2 group-hover:text-[#00a884] transition-colors">
                    {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-[#667781] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full" /> {course.instructor}
                </p>

                {/* Description */}
                <p className="text-[#667781] text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                    {course.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 border-t border-slate-50 pt-6 uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <FiPlay className="text-[#00a884]" /> {course.lectures?.length || 0} Modules
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FiClock className="text-[#00a884]" /> {formatDuration(totalDuration)}
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                        <FiUsers className="text-[#00a884]" /> {course.enrolledStudents?.length || 0}
                    </span>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#111b21]">
                            {course.price === 0 ? 'FREE' : `₹${course.price}`}
                        </span>
                        {course.price > 0 && <span className="text-xs text-slate-400 line-through font-bold">₹2,999</span>}
                    </div>
                    <span className="text-[10px] font-black text-[#00a884] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform bg-emerald-50 px-4 py-2 rounded-xl">
                        View Access →
                    </span>
                </div>
            </Link>
        </div>
    )
}
