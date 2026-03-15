import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { FiArrowLeft, FiUser, FiCheckCircle, FiPlay, FiClock, FiCalendar } from 'react-icons/fi';

const StudentDetails = () => {
    const { id } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await axiosInstance.get(`/api/admin/student/${id}/details`);
                setDetails(data);
            } catch (error) {
                console.error('Error fetching student details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="text-center p-10">Loading Details...</div>;
    if (!details) return <div className="text-center p-10">Student details not found.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <Link to="/admin/students" className="inline-flex items-center gap-2 text-[#00a884] font-semibold hover:underline bg-[#e7fce3] px-4 py-2 rounded-full transition-all">
                <FiArrowLeft /> Back to Students
            </Link>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#d1d7db] flex items-center gap-8">
                <div className="w-20 h-20 rounded-full bg-[#00a884] flex items-center justify-center text-white text-3xl font-bold">
                    {details.student.name.charAt(0)}
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#111b21]">{details.student.name}</h2>
                    <p className="text-[#667781] flex items-center gap-2 text-sm"><FiUser /> Student ID: {details.student._id}</p>
                    <p className="text-[#667781] flex items-center gap-2 text-sm"><FiUser /> Email: {details.student.email}</p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#111b21]">Course Progress</h3>
                {details.courseProgress.map((cp, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-[#d1d7db] overflow-hidden">
                        <div className="p-6 bg-[#f8f9fa] border-b border-[#d1d7db] flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-[#111b21]">{cp.courseName}</h4>
                                <p className="text-xs text-[#667781]">{cp.completedVideos} of {cp.totalVideos} videos completed</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-[#00a884]">{Math.round(cp.completionPercentage)}%</span>
                            </div>
                        </div>
                        <div className="p-0">
                            <ul className="divide-y divide-[#f0f2f5]">
                                {cp.videos.map((v, vIdx) => (
                                    <li key={vIdx} className="p-4 flex items-center justify-between hover:bg-[#fcfdfd] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${v.completed ? 'bg-[#e7fce3] text-[#00a884]' : 'bg-[#f0f2f5] text-[#8696a0]'}`}>
                                                {v.completed ? <FiCheckCircle /> : <FiPlay />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold ${v.completed ? 'text-[#111b21]' : 'text-[#8696a0]'}`}>{v.title}</p>
                                                <p className="text-[10px] text-[#8696a0] flex items-center gap-1">
                                                    <FiClock /> {v.completed ? 'Completed' : 'Locked/Remaining'}
                                                </p>
                                            </div>
                                        </div>
                                        {v.completed && (
                                            <div className="text-right">
                                                <p className="text-[10px] text-[#00a884] font-semibold flex items-center gap-1">
                                                    <FiCalendar /> {new Date(v.lastWatchedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDetails;
