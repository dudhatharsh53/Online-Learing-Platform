import { Link } from 'react-router-dom'
import { FiBook, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-emerald-900/10 bg-[#00A884]">
            <div className="container-lg py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                                <FiBook className="text-white text-xs" />
                            </div>
                            <span className="font-bold text-white">LearnHub</span>
                        </Link>
                        <p className="text-emerald-50 text-sm leading-relaxed max-w-xs">
                            Empowering learners worldwide with high-quality, accessible online education. Learn at your own pace.
                        </p>
                        <div className="flex gap-4 mt-5">
                            {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                                <a key={i} href="#" className="text-emerald-100 hover:text-white transition-colors">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-2.5">
                            {[['Courses', '/courses'], ['About Us', '/about'], ['Contact Us', '/contact']].map(([label, href]) => (
                                <li key={href}>
                                    <Link to={href} className="text-emerald-50 hover:text-white text-sm transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact Us</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li className="text-emerald-50">
                                <span className="block text-emerald-100 font-medium">Helpline:</span>
                                +91 6353141028
                            </li>
                            <li className="text-emerald-50">
                                <span className="block text-emerald-100 font-medium">Email:</span>
                                learnhub@gmail.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="divider mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-emerald-700/50">
                    <p className="text-emerald-100 text-sm">© {year} LearnHub. All rights reserved.</p>
                    <p className="text-emerald-100 text-xs">Built with ❤️ using MERN Stack</p>
                </div>
            </div>
        </footer>
    )
}
