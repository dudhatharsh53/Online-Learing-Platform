import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '../redux/authSlice'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiCheckCircle } from 'react-icons/fi'

const PERKS = ['Free access to hundreds of courses', 'Track your learning progress', 'Download lecture notes & PDFs']

export default function Register() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [showPass, setShowPass] = useState(false)

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true })
        }
    }, [isAuthenticated, user, navigate])

    useEffect(() => {
        if (error) { toast.error(error); dispatch(clearError()) }
    }, [error, dispatch])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields')
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
        if (form.password !== form.confirm) return toast.error('Passwords do not match')

        const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }))
        if (registerUser.fulfilled.match(result)) {
            toast.success('Account created! Welcome to LearnHub 🎉')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16 animate-fade-in">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl" />
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
                    <h1 className="text-2xl font-bold text-slate-100 mb-1">Create your account</h1>
                    <p className="text-slate-500 text-sm">Join thousands of learners today</p>
                </div>

                {/* Perks */}
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-6">
                    {PERKS.map((p) => (
                        <span key={p} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <FiCheckCircle className="text-emerald-500" /> {p}
                        </span>
                    ))}
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="label">Full Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                                <input id="name" type="text" name="name" value={form.name} onChange={handleChange}
                                    placeholder="John Doe" className="input pl-10" autoComplete="name" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="label">Email address</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                                <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" className="input pl-10" autoComplete="email" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="label">Password <span className="text-slate-600 font-normal">(min. 6 chars)</span></label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                                <input id="password" type={showPass ? 'text' : 'password'} name="password"
                                    value={form.password} onChange={handleChange} placeholder="••••••••"
                                    className="input pl-10 pr-10" autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label="Toggle password">
                                    {showPass ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm */}
                        <div>
                            <label htmlFor="confirm" className="label">Confirm Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                                <input id="confirm" type={showPass ? 'text' : 'password'} name="confirm"
                                    value={form.confirm} onChange={handleChange} placeholder="••••••••"
                                    className="input pl-10" autoComplete="new-password" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
                            id="register-submit-btn">
                            {loading
                                ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating account…</>
                                : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}
