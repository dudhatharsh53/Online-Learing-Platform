import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// ── Custom Confirmation Dialog ─────────────────────────────────────────────────
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            {/* Dialog */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full border border-red-100 animate-fade-in">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FiAlertTriangle className="text-red-500 text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#111b21] mb-1">{title}</h3>
                        <p className="text-sm text-[#667781] leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-6 rounded-xl border border-slate-200 text-[#111b21] font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── StudentList Component ─────────────────────────────────────────────────────
const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editData, setEditData] = useState({ name: '', email: '', role: 'student' });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, studentId: null, studentName: '' });
    const navigate = useNavigate();

    const fetchStudents = async () => {
        try {
            const { data } = await axiosInstance.get('/api/admin/students');
            setStudents(data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Opens the custom dialog instead of window.confirm
    const handleDeleteClick = (student) => {
        setConfirmDialog({ isOpen: true, studentId: student._id, studentName: student.name });
    };

    // Called when admin clicks "Yes, Delete" in the dialog
    const handleConfirmDelete = async () => {
        const { studentId } = confirmDialog;
        setConfirmDialog({ isOpen: false, studentId: null, studentName: '' });
        try {
            await axiosInstance.delete(`/api/admin/student/${studentId}`);
            toast.success('Student deleted successfully');
            setStudents(students.filter(s => s._id !== studentId));
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, studentId: null, studentName: '' });
    };

    const handleEditClick = (student) => {
        setEditingStudent(student._id);
        setEditData({ name: student.name, email: student.email, role: student.role });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axiosInstance.put(`/api/admin/student/${editingStudent}`, editData);
            toast.success('Student updated successfully');
            setStudents(students.map(s => s._id === editingStudent ? data.student : s));
            setEditingStudent(null);
        } catch (error) {
            toast.error('Failed to update student');
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <>
            {/* Custom Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Student?"
                message={`Are you sure you want to permanently delete "${confirmDialog.studentName}"? All their progress and data will be lost and cannot be recovered.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#111b21]">Registered Students</h2>
                        <p className="text-sm text-[#667781]">{filteredStudents.length} total users</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d1d7db] rounded-xl text-sm focus:outline-none focus:border-[#00a884] shadow-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#d1d7db] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f8f9fa] border-b border-[#d1d7db]">
                                    <th className="px-6 py-4 text-xs font-bold text-[#667781] uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#667781] uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#667781] uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#667781] uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f2f5]">
                                {filteredStudents.map((s) => (
                                    <tr key={s._id} className="hover:bg-[#f8f9fa] transition-colors group">
                                        <td className="px-6 py-4">
                                            {editingStudent === s._id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        className="block w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00a884]"
                                                        value={editData.name}
                                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                    />
                                                    <input
                                                        className="block w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00a884]"
                                                        value={editData.email}
                                                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-[#111b21]">{s.name}</div>
                                                        <div className="text-xs text-[#667781]">{s.email}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingStudent === s._id ? (
                                                <select
                                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#00a884]"
                                                    value={editData.role}
                                                    onChange={e => setEditData({ ...editData, role: e.target.value })}
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {s.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[#667781]">
                                            {new Date(s.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingStudent === s._id ? (
                                                    <>
                                                        <button onClick={handleUpdate} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full" title="Save">
                                                            <FiCheck size={18} />
                                                        </button>
                                                        <button onClick={() => setEditingStudent(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Cancel">
                                                            <FiX size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/admin/student/${s._id}`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="View Progress"
                                                        >
                                                            <FiEye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(s)}
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors" title="Edit Profile"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(s)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete User"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredStudents.length === 0 && (
                        <div className="p-16 text-center text-[#667781]">
                            <p className="italic">No students found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentList;
