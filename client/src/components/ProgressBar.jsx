/**
 * ProgressBar component
 * Props:
 *   percent  {number}  0–100
 *   label    {string}  optional label text
 *   size     {string}  'sm' | 'md' (default 'md')
 *   showLabel {bool}   show percentage text (default true)
 */
export default function ProgressBar({ percent = 0, label, size = 'md', showLabel = true }) {
    const clamped = Math.min(100, Math.max(0, percent))

    const height = size === 'sm' ? 'h-1.5' : 'h-2.5'

    // Color transitions: red → yellow → green
    const color =
        clamped === 100
            ? 'from-emerald-500 to-green-400'
            : clamped >= 60
                ? 'from-primary-500 to-blue-400'
                : clamped >= 30
                    ? 'from-amber-500 to-yellow-400'
                    : 'from-red-500 to-orange-400'

    return (
        <div className="w-full">
            {(label || showLabel) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && <span className="text-xs text-slate-400">{label}</span>}
                    {showLabel && (
                        <span className={`text-xs font-semibold ${clamped === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {clamped}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height}`}>
                <div
                    className={`${height} bg-gradient-to-r ${color} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${clamped}%` }}
                    role="progressbar"
                    aria-valuenow={clamped}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    )
}
