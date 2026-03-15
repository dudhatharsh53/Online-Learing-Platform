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
import { FiUsers } from 'react-icons/fi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminAnalytics = () => {
    const [studentProgress, setStudentProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await axiosInstance.get('/api/admin/student-progress');
                setStudentProgress(data.studentProgress);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const chartData = {
        labels: studentProgress.map(p => p.studentName),
        datasets: [
            {
                label: 'Completion %',
                data: studentProgress.map(p => p.completionPercentage),
                backgroundColor: '#00a884',
                borderRadius: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Individual Student Progress' },
        },
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
    };

    if (loading) return <div className="text-center p-10">Loading Analytics...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-[#111b21]">Performance Analytics</h2>
                    <p className="text-sm text-[#667781]">Visualizing student engagement and completion rates</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#d1d7db]">
                <div className="h-[400px]">
                    <Bar data={chartData} options={options} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#e7fce3] p-6 rounded-2xl border border-[#c1e6ba]">
                    <h4 className="text-xs font-bold text-[#1b5e20] uppercase tracking-wider mb-2">Higest Completion</h4>
                    <p className="text-2xl font-bold text-[#111b21]">
                        {studentProgress.length > 0 ? Math.max(...studentProgress.map(p => p.completionPercentage)) : 0}%
                    </p>
                </div>
                <div className="bg-[#fff9e6] p-6 rounded-2xl border border-[#ffe082]">
                    <h4 className="text-xs font-bold text-[#f57f17] uppercase tracking-wider mb-2">Total Enrollments</h4>
                    <p className="text-2xl font-bold text-[#111b21]">{studentProgress.length}</p>
                </div>
                <div className="bg-[#f0f4ff] p-6 rounded-2xl border border-[#c2d1ff]">
                    <h4 className="text-xs font-bold text-[#1a237e] uppercase tracking-wider mb-2">Needs Attention</h4>
                    <p className="text-2xl font-bold text-[#111b21]">
                        {studentProgress.filter(p => p.completionPercentage < 20).length} students
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
