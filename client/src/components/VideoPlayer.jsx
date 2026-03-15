import ReactPlayer from 'react-player'
import { useState } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

/**
 * VideoPlayer component — wraps react-player with a custom UI.
 * Props:
 *   url      {string}  Cloudinary video URL
 *   onEnded  {func}    Called when video finishes playing
 *   title    {string}  Lecture title (for accessibility)
 */
export default function VideoPlayer({ url, onEnded, onProgress, title = 'Lecture Video' }) {
    const [error, setError] = useState(false)
    const [ready, setReady] = useState(false)

    if (!url) {
        return (
            <div className="aspect-video bg-[#111b21] flex flex-col items-center justify-center rounded-[2rem] border border-[#222d34] gap-4 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 transform scale-110">
                    <FiAlertCircle size={32} />
                </div>
                <p className="text-[#667781] font-bold text-lg">No content available.</p>
            </div>
        )
    }

    return (
        <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/10 border border-[#f0f2f5]">
            {/* Loading skeleton */}
            {!ready && !error && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                    <div className="w-12 h-12 rounded-full border-4 border-[#00a884] border-t-transparent animate-spin" />
                </div>
            )}

            {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
                        <FiAlertCircle size={32} />
                    </div>
                    <p className="text-[#111b21] font-bold text-lg">Failed to load video.</p>
                    <button
                        onClick={() => setError(false)}
                        className="btn-primary py-2 px-6"
                    >
                        Retry Loading
                    </button>
                </div>
            ) : (
                <ReactPlayer
                    url={url}
                    width="100%"
                    height="100%"
                    controls
                    playing={false}
                    onReady={() => setReady(true)}
                    onEnded={onEnded}
                    onProgress={onProgress}
                    onError={() => setError(true)}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload', // Prevent video download
                                title,
                            },
                        },
                    }}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                />
            )}
        </div>
    )
}
