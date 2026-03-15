import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../redux/authSlice'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiBook } from 'react-icons/fi'

export default function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPass, setShowPass] = useState(false)

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            const from = location.state?.from?.pathname
            if (from) return navigate(from, { replace: true })
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true })
        }
    }, [isAuthenticated, user, navigate, location])

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearError())
        }
    }, [error, dispatch])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) return toast.error('Please fill in all fields')
        const result = await dispatch(loginUser(form))
        if (loginUser.fulfilled.match(result)) {
            toast.success(`Welcome back, ${result.payload.name}!`)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16 animate-fade-in">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-900/40">
                            <FiBook className="text-white text-lg" />
                        </div>
                        <span className="text-xl font-bold gradient-text">LearnHub</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
                    <p className="text-slate-500 text-sm">Log in to continue learning</p>
                </div>

                {/* Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="label">Email address</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="input pl-10"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="label">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input pl-10 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    aria-label="Toggle password"
                                >
                                    {showPass ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                            id="login-submit-btn"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Logging in…</>
                            ) : 'Log In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    )
}
