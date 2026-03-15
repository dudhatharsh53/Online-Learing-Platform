import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { FiDollarSign, FiCalendar, FiBook, FiFilter } from 'react-icons/fi'

export default function Payments() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalAmount, setTotalAmount] = useState(0)
    const [days, setDays] = useState('0') // 0 = all time

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const url = days === '0' ? '/api/admin/payments' : `/api/admin/payments?days=${days}`
            const { data } = await axiosInstance.get(url)
            setPayments(data.payments || [])
            setTotalAmount(data.totalPayments || 0)
        } catch (err) {
            toast.error('Failed to fetch payments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [days])

    return (
        <div className="container-lg py-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#111b21] mb-1">Payment History</h1>
                    <p className="text-[#667781]">Track all course enrollments and revenue</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <FiFilter className="text-[#00a884] text-sm" />
                        <select
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            className="bg-transparent text-sm text-[#111b21] font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="0">All Time ✨</option>
                            <option value="1">Last 24 Hours</option>
                            <option value="2">Last 2 Days</option>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-1.5 flex items-center gap-2">
                        <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Total</span>
                        <span className="text-lg font-bold text-emerald-600">₹{totalAmount}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 rounded-xl" />
                    ))}
                </div>
            ) : payments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <FiDollarSign className="text-5xl mx-auto mb-4 text-slate-200" />
                    <p className="text-[#111b21] font-bold mb-1">No payments found</p>
                    <p className="text-sm text-[#667781]">No transactions recorded for the selected period.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-[#667781] text-xs uppercase tracking-wider">
                                    <th className="text-left p-4 font-bold">Student</th>
                                    <th className="text-left p-4 font-bold">Course</th>
                                    <th className="text-left p-4 font-bold">Date</th>
                                    <th className="text-left p-4 font-bold">Payment ID</th>
                                    <th className="text-right p-4 font-bold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.map((p) => (
                                    <tr key={p._id} className="hover:bg-emerald-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-[#00a884]">
                                                    {p.student?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#111b21]">{p.student?.name || 'Unknown'}</p>
                                                    <p className="text-[11px] text-[#667781]">{p.student?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 max-w-xs">
                                                <FiBook className="text-[#00a884] flex-shrink-0" />
                                                <p className="truncate text-[#111b21] font-medium">{p.course?.title || 'Deleted Course'}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[#667781] whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <FiCalendar size={12} className="text-[#00a884]" />
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-[11px] text-[#667781]">{p.paymentId || '—'}</td>
                                        <td className="p-4 text-right">
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">₹{p.amount}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
